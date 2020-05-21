var config = require('../config');
var logger = config.logger(__dirname + "/chain.log");
const substrate = require('oo7-substrate');
const {
    blake2b
} = require('blakejs')
const db = config.db;
const {
    Bussiness
} = require('../bussiness');
const {
    hexToBytes,
    bytesToHex,
} = require('oo7-substrate/src/utils.js');
const {
    decode
} = require('oo7-substrate/src/codec.js')
const {
    Balance
} = require('oo7-substrate/src/types.js')
const {
    nodeService
} = require('oo7-substrate/src/nodeService');

let finalized = 0
let transactions = 0
//设置节点
substrate.setNodeUri(config.node.ws);

async function stat_chain(best, new_finalized) {
    logger.debug('status_chain', best);

    if (parseInt(new_finalized) > parseInt(finalized)) {
        finalized = new_finalized
    }
    let totalAssetBalance = await substrate.runtime.xassets.totalAssetBalance('PCX')
    let pcx_issuance = new Balance(0)
    for (var m = 0; m < totalAssetBalance.length; m++) {
        pcx_issuance += totalAssetBalance[m][0][1]

    }

    let pcx_destroy = 0
    let desposit_diff = 0
    let vote_diff = 0
    let validators = await substrate.runtime.xsession.validators
    validators = validators.length
    let Intentions = await substrate.runtime.xstaking.intentions
    let votes = 0

    let rpc_intentions=await nodeService().request('chainx_getIntentionsV1')
    let selfvote_count=0;

    for (var i = 0; i < rpc_intentions.length; i++) {
        selfvote_count += parseInt(rpc_intentions[i].selfVote)
        votes += (parseInt(rpc_intentions[i].totalNomination)-parseInt(rpc_intentions[i].selfVote))
    }
    let sdot_power=0
    let btc_power=0
    let rpc_pseduintentions=await nodeService().request('chainx_getPseduIntentionsV1')
    for (var i = 0; i < rpc_pseduintentions.length; i++) {
        if( rpc_pseduintentions[i].id == 'SDOT'){
            sdot_power= parseInt(rpc_pseduintentions[i].power)
        }
        if( rpc_pseduintentions[i].id == 'BTC'){
            btc_power= parseInt(rpc_pseduintentions[i].power)
        }
    }

    let dividend_cycle = await substrate.runtime.xsession.currentIndex
    let vote_cycle = await substrate.runtime.xstaking.currentEra

    let sql = Bussiness['status_chain'].insertSql([best, finalized, exports.transactions, pcx_issuance, pcx_destroy, desposit_diff, vote_diff, validators, votes, dividend_cycle.toPrimitive(), vote_cycle.toPrimitive(),btc_power,sdot_power])
    sql += 'update "status_chain" set "selfvote_count"=' +selfvote_count + ' where best=' + best + ';'
    sql += ' update "status_chain" set "account_count"=(select count(DISTINCT  accountid) from  "XAssets_AssetBalance") where best=' + best + ';'
    sql += ' update "status_chain" set "contract_count"=(select count(contract) from  "contracts") where best=' + best + ';'
    sql += ' update "status_chain" set "contract_call_count"=(select count(contract) from  "contracts_transation") where best=' + best + ';'

    logger.debug(sql)
    try {
        await db.query(sql)
    } catch (e) {
        if (e.code != 23505)
            throw e
    }

};

async function handle_block(hash, header, block, fresh) {
    //更新block表
    let block_tx = [] //reset

    let new_finalized = 0
    header.number = parseInt(header.number)
    if( 1 == header.number % 150 ){
        //去取最新的finalized
        let finalized_head=await nodeService().request('chain_getFinalizedHead')
        let finalized_block=await nodeService().request('chain_getBlock',[finalized_head])
        new_finalized=parseInt(finalized_block.block.header.number)
    }
    let sql = Bussiness.block.insertSql([
        header.number,
        hash,
        header.parentHash,
        header.stateRoot,
        header.extrinsicsRoot,
        JSON.stringify(header.digest),
        JSON.stringify(block.justification),
        block.block.extrinsics.length,
        JSON.stringify(block)
    ]);

    //console.log(sql)
    logger.debug(sql)
    try {
        await db.query(sql)
    } catch (e) {
        if (e.code != 23505)
            throw e
    }
    let transaction_stat_sql = ''
    let block_time = 0
    let producer = ''
    let multisig_sql=''
    let contracts_transation=''

    exports.transactions += parseInt(block.block.extrinsics.length)
    //更新transaction表
    for (var i = 0; i < block.block.extrinsics.length; i++) {
        let byte = hexToBytes(block.block.extrinsics[i])

        let transaction_hash = bytesToHex(blake2b(byte, null, 32))

        let input = decode(byte, 'Vec<u8>')
        input = {
            data: input
        };

        let extrinsic = decode(input, 'UncheckedMortalExtrinsic')
        //console.log(substrate.call_decode,extrinsic)

        let args = substrate.call_decode[extrinsic.get('module')][extrinsic.get('call')].decode(input)

        let module = substrate.call_decode[extrinsic.get('module')][extrinsic.get('call')].module;
        let call = substrate.call_decode[extrinsic.get('module')][extrinsic.get('call')].call;
        let help = '(' + extrinsic.get('module') + ')' + '(' + extrinsic.get('call') + ')' + '__' + substrate.call_decode[extrinsic.get('module')][extrinsic.get('call')].help;

        if( extrinsic.get('signed') == '' ){//内部交易
            let in_byte = hexToBytes(header.number.toString(16) + i.toString(16) + block.block.extrinsics[i])
            transaction_hash = bytesToHex(blake2b(in_byte, null, 32))
        }

        if ('XSystem' == module && 'set_block_producer' == call) {
            producer = args[0].data
        }
        if ('Timestamp' == module && 'set' == call) {
            //console.log(args[0])
            block_time = new Date(args[0].data)
            block_time = block_time.getTime()
            let time = block_time / 1000
            time = time - time % (24 * 60 * 60)

            if ((fresh !== false) && transaction_stat_sql == '') {
                transaction_stat_sql = 'insert into "transaction_daily" (day,num,height) values (' + time + ',' + block.block.extrinsics.length + ',' + header.number + ') on conflict (day ) do update set num=transaction_daily.num+excluded.num,height=excluded.height';
            }

        }
        if ( 'XMultiSig' == module && 'execute' == call) {

            let proposal=JSON.parse( args[1].data )
            let proposal_module = substrate.call_decode[proposal.m][proposal.c].module;
            let proposal_call = substrate.call_decode[proposal.m][proposal.c].call;

            let t = {
                data: hexToBytes(proposal.args)
            };

            let proposal_args=substrate.call_decode[proposal.m][proposal.c].decode(t)
            if( 'set_code' == proposal_call ){//太大了，不重复写
                proposal_args=''
            }
            //console.log(proposal_args)

            multisig_sql +=Bussiness['event_multisig'].insertSql([
                args[0].data,
                transaction_hash,
                extrinsic.get('signed'),
                '',
                proposal_module,
                proposal_call,
                JSON.stringify(proposal_args),
                header.number
            ]);
        }
        if ( 'XContracts' == module && 'call' == call ) {
            contracts_transation=Bussiness['contracts_transation'].insertSql([
                args[0].data,//合约地址
                transaction_hash,
                header.number
            ]);
        }
        let transaction_sql = Bussiness.transaction.insertSql([
            header.number,
            i,
            extrinsic.get('signed'),
            extrinsic.get('signature').toString(),
            extrinsic.get('index'),
            extrinsic.get('era'),
            module,
            call,
            help,
            JSON.stringify(args),
            block.block.extrinsics[i],
            extrinsic.get('version'),
            extrinsic.get('acceleration'),
            transaction_hash
        ]);

        logger.debug(transaction_sql)
        try {
            await db.query(transaction_sql)
        } catch (e) {
            if (e.code != 23505)
                throw e
        }

        block_tx[i] = transaction_hash
    }

    if (transaction_stat_sql != '') {
        logger.debug(transaction_stat_sql)
        try {
            await db.query(transaction_stat_sql)
        } catch (e) {
            if (e.code != 23505)
                throw e
        }

    }
    let update_time = "update transaction set time=" + block_time + " where number=" + header.number + ";"
    let update_producer = "update block set time=" + block_time + ",producer='" + producer + "'  where number=" + header.number + ";"

    logger.debug(update_time + update_producer)
    try {
        await db.query(update_time + update_producer + multisig_sql+contracts_transation)
    } catch (e) {
        if (e.code != 23505)
            throw e
    }

    if (fresh !== false)
        stat_chain(header.number, new_finalized)

    return block_tx
}


exports.handle_block = handle_block;
exports.transactions = transactions
exports.finalized = finalized
