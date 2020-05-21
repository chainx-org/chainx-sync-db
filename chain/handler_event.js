var fs = require('fs')
var config = require('../config');
const {
    Bussiness
} = require('../bussiness');
var logger = config.logger(__dirname + "/chain.log");
const substrate = require('oo7-substrate');
const chain = substrate.chain;
const {
    blake2b
} = require('blakejs')
const db = config.db;
const {
    hexToBytes,
    bytesToHex,
    leToNumber,
    bytesToRIHex
} = require('oo7-substrate/src/utils.js');
const {
    decode
} = require('oo7-substrate/src/codec.js')
const {
    AccountId,
} = require('oo7-substrate/src/types.js')


substrate.setNodeUri(config.node.ws);

function to_txstate(e) {
    switch (e) {
        case 0:
            return 'NotApplying';
        case 1:
            return 'Applying';
        case 2:
            return 'Signing';
        case 3:
            return 'Broadcasting';
        case 4:
            return 'Processing';
        case 5:
            return 'Confirming';
        case 6:
            return 'Confirmed';
        case 7:
            return 'Unknown';
            ;
        default:
            return 'Unknown';
    }
}


async function chase_event(number, hash, block_tx, event_module) {
    // var hash = await chain.hash(number);
    // var header = await chain.header(hash);
    // var block = await chain.block(hash);

    var data_events = await substrate.runtime.core.events(hash)
    var events = decode(data_events, 'Vec<EventRecord>')
    logger.debug('chase events', number, hash, events.length);
    await handle_event(number, events, block_tx, event_module)
}


async function handle_event(number, events, block_tx, event_module) {
    for (var i = 0; i < events.length; i++) {

        if (event_module && (event_module != events[i].event.moduleName)) {
            logger.debug(number, 'process_event only ', event_module)
            continue;
        }

        let transaction_tx = block_tx[events[i].phase.value]

        await process_event(events[i], number, event_module, transaction_tx); //处理特殊的event

        //更新event表
        let sql = Bussiness.event.insertSql([
            number,
            i,
            JSON.stringify(events[i].phase),
            events[i].event.moduleName,
            events[i].event.eventName,
            JSON.stringify(events[i].event.args.map(a => {
                if (a instanceof AccountId) {
                    let v = {};
                    v['_type'] = 'AccountId';
                    v['data'] = a.toHex();
                    return v;
                }
                return a;
            })),
            JSON.stringify(events[i]),
            transaction_tx ? transaction_tx : ''
        ]);

        if ('System' == events[i].event.moduleName && ('ExtrinsicSuccess' == events[i].event.eventName || 'ExtrinsicFailed' == events[i].event.eventName) && events[i].phase.value) {
            sql += "update transaction set status='" + events[i].event.eventName + "' where number=" + number + " and index=" + events[i].phase.value + ";"
        }
        logger.debug(sql)
        try {
            let r = await db.query(sql).catch(error => {
                console.log('error', error)
            })

        } catch (e) {
            console.log(e)
            if (e.code != 23505)
                throw e

        }


    }
}

async function process_lbtc_address(accountid, height) {
    let sql = ' select  address,channel from "event_lockupbtc" where accountid=\'' + accountid + '\''
    let data = await db.query(sql)

    let addresses = []
    let channel = ''
    for (var i = 0; i < data.rows.length; i++) {
        addresses.push(data.rows[i].address)
        channel = data.rows[i].channel
    }

    sql = Bussiness['lbtc_addresses'].insertOrUpdateSql([accountid, channel, JSON.stringify(addresses), height])
    return sql
}

async function process_event(event, number, event_module, transaction_tx) {
    //console.log((event));
    let sql = '';
    let handicapsql = '';

    if ('XSpot' == event.event.moduleName) {
        if ('PutOrder' == event.event.eventName) {
            sql = Bussiness['event_xspot_AccountOrder'].insertOrUpdateSql([
                ...event.event.args[0].map(a => a.toString()),
                number
            ]);

            handicapsql = Bussiness['handicap'].update(number);

        } else if ('UpdateOrder' == event.event.eventName) {
            sql = "update \"event_xspot_AccountOrder\" set hasfill_amount=" + (event.event.args[0][2].toString()) + ",lastupdate_time=" + (event.event.args[0][3].toString()) + ",status='" + (event.event.args[0][4]) + "',reserve_last=" + (event.event.args[0][5].toString()) + ",fill_index='" + JSON.stringify(event.event.args[0][6]) + "' where accountid='" + event.event.args[0][0].toHex() + "' and id=" + (event.event.args[0][1].toString()) + ';'
            //console.log(sql)

            handicapsql = Bussiness['handicap'].update(number);

        } else if ('FillOrder' == event.event.eventName) {
            sql = Bussiness['event_xspot_FillsOf'].insertOrUpdateSql([
                ...event.event.args[0].map(a => a.toString())
            ]);

            try {
                let s1 = "select time from  \"block\" where number=" + event.event.args[0][8]
                let res = await db.query(s1)
                let kline = Bussiness['kline'].update(event.event.args[0][1], event.event.args[0][2], event.event.args[0][7], res.rows[0]['time'] / 1000);
                console.log(kline)
                await db.query(kline)
            } catch (e) {
                if (e.code != 23505)
                    throw e
            }
        }
    } else if ('XBridgeOfBTC' == event.event.moduleName) {
        if ('Deposit' == event.event.eventName) {
            let chain = leToNumber(event.event.args[0][1])
            let tx_hash = bytesToRIHex(event.event.args[0][6])
            let tx_state = to_txstate(leToNumber(event.event.args[0][7]))

            sql = Bussiness['event_DepositRecord'].insertSql([
                event.event.args[0][0].toString(), chain,
                event.event.args[0][2].toString(), tx_hash,
                bytesToHex(event.event.args[0][4]), event.event.args[0][3].toString(),
                event.event.args[0][5], tx_state,
                number
            ]);

        } else if (!event_module && 'Withdrawal' == event.event.eventName) {
            let tx_hash = bytesToRIHex(event.event.args[0][1])
            sql = "update \"event_WithdrawRecord\" set txid='" + tx_hash + "',txstate='" + to_txstate(leToNumber(event.event.args[0][2])) + "' where id=" + event.event.args[0][0] + ';'

        } else if ('InsertHeader' == event.event.eventName) {
            let header_hash = event.event.args[0][1].toRightHex()
            let transation_index = event.phase.value
            //logger.debug('InsertHeader',header_hash,transation_index)
            sql = "update \"XBridgeOfBTC_BlockHeaderFor\" set (chainx_tx,relay)=(select hash,signed from transaction where number=" + number + " and index=" + transation_index + ")  where header='" + header_hash + "';"
        } else if ('InsertTx' == event.event.eventName) {
            let transation_index = event.phase.value
            let tx_hash = event.event.args[0][0].toRightHex()
            let header_hash = event.event.args[0][1].toRightHex()

            sql = "update \"XBridgeOfBTC_TxFor\" set (chainx_tx,relay)=(select hash,signed from transaction where number=" + number + " and index=" + transation_index + ")  where txid='" + tx_hash + "';"
            sql += "update \"XBridgeOfBTC_TxFor\" set header='" + header_hash + "'  where txid='" + tx_hash + "';"

            sql += "update \"XBridgeOfBTC_TxFor\" set bitcoin_height=(select bitcoin_height from \"XBridgeOfBTC_BlockHeaderFor\" where header='" + header_hash + "' )  where txid='" + tx_hash + "';"
        }
    } else if ('XAssetsRecords' == event.event.moduleName) {
        if ('WithdrawalApply' == event.event.eventName) {
            let transation_index = event.phase.value
            sql = Bussiness['event_WithdrawRecord'].insertOrUpdateSql([
                event.event.args[0][0], event.event.args[0][1].toString(), leToNumber(event.event.args[0][2]), event.event.args[0][3].toString(), event.event.args[0][4].toString(), bytesToHex(event.event.args[0][5]), event.event.args[0][6].toString(), 'Applying',
                number
            ]);
            sql += "update \"event_WithdrawRecord\" set chainx_tx=(select hash from transaction where number=" + number + " and index=" + transation_index + ")  where id=" + event.event.args[0][0] + ";"
        } else if ('WithdrawalFinish' == event.event.eventName) {
            sql = "update \"event_WithdrawRecord\" set txstate='" + event.event.args[0][1].toString() + "' where id=" + event.event.args[0][0] + ';'
        }
    } else if ('MissedBlocksOfOfflineValidatorPerSession' == event.event.eventName) {
        let MissedBlocksOfOfflineValidatorPerSession = event.event.args[0][0]

        for (var i = 0; i < MissedBlocksOfOfflineValidatorPerSession.length; i++) {
            let accountid = MissedBlocksOfOfflineValidatorPerSession[i][0][0]
            let n = MissedBlocksOfOfflineValidatorPerSession[i][0][1]

            sql += Bussiness['missed_blocks_offline_validator'].insertSql([
                accountid.toString(),
                number,
                n
            ]);
        }

    } else if ('XBridgeCommon' == event.event.moduleName) {
        if ('ChannelBinding' == event.event.eventName) {
            let token = event.event.args[0][0]
            let accountid = event.event.args[0][1].toString()
            let channel = event.event.args[0][2].toString()
            sql = Bussiness['event_ChannelBinding'].insertOrUpdateSql([
                token, accountid, channel, number
            ]);
            sql += "update \"event_lockupbtc\" set channel='" + channel + "' where accountid='" + accountid + "';"

            sql += await process_lbtc_address(accountid, number)
        }
    } else if ('XMultiSig' == event.event.moduleName) {
        if ('Confirm' == event.event.eventName) {
            let addr = event.event.args[0][0].toString()
            let multisigid = event.event.args[0][1].toHex()
            let yet_needed = event.event.args[0][2]
            let owners_done = event.event.args[0][3]

            sql += "update event_multisig set multisigid='" + multisigid + "' where addr='" + addr + "' and multisigid ='' and height=" + number + ";"
            sql += "update event_multisig set confirm_tx=concat(confirm_tx,'" + ',' + transaction_tx + "'),yet_needed=" + yet_needed + ",owners_done=" + owners_done + ",height=" + number + " where  multisigid ='" + multisigid + "' ;"
        } else if ('RemoveMultiSigIdFor' == event.event.eventName) {// 完成
            let addr = event.event.args[0][0].toString()
            let multisigid = event.event.args[0][1].toHex()
            sql += "update event_multisig set yet_needed=101,height=" + number + " where  multisigid ='" + multisigid + "' and addr='" + addr + "';"
        }
    } else if ('XBridgeOfBTCLockup' == event.event.moduleName) {
        let transation_index = event.phase.value
        if ('Lock' == event.event.eventName) {
           
            let lock_hash = bytesToRIHex(event.event.args[0][2])
            let output_index = event.event.args[0][3]
            let address = (event.event.args[0][4].toString())
            let value = event.event.args[0][1]
            let accountid = event.event.args[0][0].toString()

            sql = Bussiness['event_lockupbtc'].insertSql([
                lock_hash, output_index, 0, address, value, accountid, number
            ]);
            sql += "update \"event_lockupbtc\" set relay_hash=(select hash from transaction where number=" + number + " and index=" + transation_index + ")  where hash='" + lock_hash + "' and index=" + output_index + " and type=0;"

            sql += "insert into \"event_lockupbtc_total\" (accountid,address,lock,height) values('" +
                accountid + "','" + address + "'," + value + "," + number + ') on conflict(accountid,address) do update set lock=event_lockupbtc_total.lock+excluded.lock,height=excluded.height;';

            sql += await process_lbtc_address(accountid, number)

        } else if ('Unlock' == event.event.eventName) {
            //Unlock(H256, u32, H256, u32),
            let unlock_hash = bytesToRIHex(event.event.args[0][0])
            let unlock_hash_left = event.event.args[0][0].toHex()
            let input_index = event.event.args[0][1]
            let lock_hash = bytesToRIHex(event.event.args[0][2])
            let lock_hash_left = event.event.args[0][2].toHex()
            let output_index = event.event.args[0][3]

            sql = "insert into \"event_lockupbtc\" (hash,index,type,pre_hash,pre_index,height) values('" + unlock_hash + "'," + input_index + ",1,'" + lock_hash + "'," + output_index + ',' + number + ');'

            sql += "update \"event_lockupbtc\" set relay_hash=(select hash from transaction where number=" + number + " and index=" + transation_index + ")  where hash='" + unlock_hash + "' and index=" + input_index + " and type=1;"

            sql += "update \"event_lockupbtc\" set (accountid,address,value)=(select accountid,address,value from event_lockupbtc where ( (hash='" + lock_hash + "' or hash='" + lock_hash_left + "') and index=" + output_index + " and type=0 ) )  where (hash='" + unlock_hash + "' or hash='" + unlock_hash_left + "') and index=" + input_index + " and type=1;"

            let txid = unlock_hash
            sql += "update \"XBridgeOfBTC_TxFor\" set value=(select value from event_lockupbtc where ( hash='" + lock_hash + "' or hash='" + lock_hash_left + "') and index=" + output_index + " and type=0)  where txid='" + txid + "';"

            sql += "update \"event_lockupbtc_total\"  set unlock=unlock+t.value from (select * from event_lockupbtc  where  (hash='" + unlock_hash + "' or hash='" + unlock_hash_left + "') and index=" + input_index + " and type=1) as t where event_lockupbtc_total.accountid=t.accountid and event_lockupbtc_total.address=t.address"

        } else if ('UnlockedFromRoot' == event.event.eventName) {
            //UnlockedFromRoot(H256, u32),
            let lock_hash = bytesToRIHex(event.event.args[0][0])
            let output_index = event.event.args[0][1]
            let lock_hash_left = event.event.args[0][0].toHex()

            sql += "update \"event_lockupbtc\" set pre_index=10000 where (hash='" + lock_hash + "' or hash='" + lock_hash_left + "') and index=" + output_index + " and type=0;"

            sql += "update \"event_lockupbtc_total\"  set unlock=unlock+t.value from (select * from event_lockupbtc  where  (hash='" + lock_hash + "' or hash='" + lock_hash_left + "') and index=" + output_index + " and type=0) as t where event_lockupbtc_total.accountid=t.accountid and event_lockupbtc_total.address=t.address"
        }
    }
    else if ('XContracts' == event.event.moduleName ) {
        if ( 'Instantiated' == event.event.eventName ){
            let account = event.event.args[0][0].toString()
            let contract = event.event.args[0][1].toString()

            sql += Bussiness['contracts'].insertSql([
                contract,
                '',
                account,
                '',
                '',
                transaction_tx,
                number
            ]);
        }
    }
    else if ( 'XFeeManager' == event.event.moduleName ){
        let transation_index = event.phase.value
        let fee=event.event.args[0][1]

        sql = "update transaction set fee=fee+"+fee+" where number="+number+" and index="+transation_index+";"
    }
    if (sql != '') {
        logger.debug(sql)
        try {
            await db.query(sql)
        } catch (e) {
            if (e.code != 23505)
                throw e
        }
    }
    if (handicapsql != '') {
        logger.debug(handicapsql)
        try {
            await db.query(handicapsql)
        } catch (e) {
            if (e.code != 23505)
                throw e
        }
    }

}


exports.chase_event = chase_event
exports.process_lbtc_address = process_lbtc_address

