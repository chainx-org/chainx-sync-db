var path = require('path');
var config = require('./config');
const substrate = require('oo7-substrate');
const OPS = require('bitcoin-ops');
const {
    nodeService
} = require('oo7-substrate/src/nodeService');
const {
    Balance
} = require('oo7-substrate/src/types.js')
const db = config.db;
const {
    Bussiness,
    handicap
} = require('./bussiness')

const {
    queryBTCBalance,
    hashToBtcAdress
} = require('./bitcoin')
const {
    decode
} = require('oo7-substrate/src/codec.js')
const {
    hexToBytes
} = require('oo7-substrate/src/utils');
const {
    chase_event
} = require('./chain/handler_event');
const handler_block = require('./chain/handler_block');
var logger = config.logger();
const request = require('request');

substrate.setNodeUri(config.node.ws);

function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(' enough sleep~');
        }, time);
    })
}

async function chase_number(height, event_module) {
    var hash = await substrate.chain.hash(height);
    var header = await substrate.chain.header(hash);
    var block = await substrate.chain.block(hash);
    logger.debug('chase  block', height, hash);

    let block_tx = await handler_block.handle_block(hash, header, block, false);
    await chase_event(height, hash, block_tx, event_module)
}

async function fix_btc_head_and_tx(best) {
    try {
        (async function () {
            let last_day = parseInt(best) - 1 * 24 * 60 * 60 / 2

            let block_null = await db.query("select * from  \"XBridgeOfBTC_BlockHeaderFor\" where RELAY is NULL and insert_height >"+last_day+ ";")

            for (var i = 0; block_null.rows && i < block_null.rows.length; i++) {
                let n = parseInt(block_null.rows[i].insert_height)
                console.log('fix_btc_head_and_tx block=' + n)
                await chase_number(n, 'XBridgeOfBTC')
            }

            let tx_null = await db.query("select * from  \"XBridgeOfBTC_TxFor\" where RELAY is NULL and height > "+last_day)
            for (var i = 0; tx_null.rows && i < tx_null.rows.length; i++) {
                let n = parseInt(tx_null.rows[i].height)
                console.log('fix_btc_head_and_tx tx=' + n)
                await chase_number(n, 'XBridgeOfBTC')
            }
        })()

    } catch (e) {
        logger.error('fix_btc_head_and_tx ' + e)
    }

};

async function stat_bitcoin() {
    try {
        let best = await substrate.chain.height
        logger.debug('stat_bitcoin', best);
        try {
            (async function () {
                let trustee_session = await db.query('select * from  "public"."XBridgeFeatures_TrusteeSessionInfoLen"  where chain = \'Bitcoin\';')
                trustee_session = (trustee_session.rows[0] && trustee_session.rows[0].length) ? trustee_session.rows[0].length - 1 : 0

                let trustee_session_info = await db.query('select * from  "public"."XBridgeFeatures_BitcoinTrusteeSessionInfoOf" where  id=' + trustee_session + ';')

                let hot_address = (trustee_session_info.rows[0] && trustee_session_info.rows[0].hot_address) ? trustee_session_info.rows[0].hot_address : ''
                let cold_address = (trustee_session_info.rows[0] && trustee_session_info.rows[0].cold_address) ? trustee_session_info.rows[0].cold_address : ''

                let deposit_count = await db.query('select  count(*) from  "public"."event_DepositRecord"')
                deposit_count = (deposit_count.rows && deposit_count.rows[0].count) ? deposit_count.rows[0].count : 0
                let withdraw_count = await db.query('select  count(*) from  "public"."event_WithdrawRecord"')
                withdraw_count = (withdraw_count.rows && withdraw_count.rows[0].count) ? withdraw_count.rows[0].count : 0

                let bind_count = await db.query(' select count(*) from  "public"."XBridgeFeatures_BitcoinCrossChainOf" ')
                bind_count = (bind_count.rows && bind_count.rows[0].count) ? bind_count.rows[0].count : 0

                let lockup_count = await db.query(' select count(*) from  "public"."event_lockupbtc" ')
                lockup_count = (lockup_count.rows && lockup_count.rows[0].count) ? parseInt(lockup_count.rows[0].count) : 0

                let lockup_balance = 0
                let psedintentions = await nodeService().request('chainx_getPseduIntentionsV1')
                for (var i = 0; i < psedintentions.length; i++) {
                    if ('L-BTC' == psedintentions[i].id) {
                        lockup_balance = psedintentions[i].circulation
                        break;
                    }
                }
                console.log('lockup_balance', lockup_balance, 'lockup_count', lockup_count)

                let lockup_address_count=await db.query('  select count(DISTINCT address )  from  "public"."event_lockupbtc" ')
                lockup_address_count = (lockup_address_count.rows && lockup_address_count.rows[0].count) ? parseInt(lockup_address_count.rows[0].count) : 0
                console.log('lockup_balance', lockup_balance, 'lockup_count', lockup_count,'lockup_address_count',lockup_address_count)

                hot_address = JSON.parse(hot_address)
                cold_address = JSON.parse(cold_address)

                //console.log(hot_address,cold_address)

                queryBTCBalance(hot_address.addr.hash, hot_address.addr.kind, hot_address.addr.network, function (hot_info) {
                    queryBTCBalance(cold_address.addr.hash, cold_address.addr.kind, cold_address.addr.network, function (cold_info) {
                        let sql = Bussiness['status_bitcoin'].insertOrUpdateSql([trustee_session, hot_info.balance, cold_info.balance, hot_info.address, cold_info.address, deposit_count, withdraw_count, bind_count, lockup_count, lockup_balance,lockup_address_count, best])
                        logger.debug(sql)
                        db.query(sql, (err, res) => {
                            if (err && err.code != 23505) {
                                logger.error(sql, err)
                                // throw err
                            }
                        })
                    })
                })


            })()
        } catch (e) {
            logger.error('stat_bitcoin ' + e)
        }

    } catch (e) {
        logger.error('stat_bitcoin ' + e)
    }

};

function post(opts) {
    return new Promise((resolve, reject) => {
        request.post(opts, function (err, response, body) {
            console.log('返回结果：', err, body);
            if (!err && response.statusCode == 200) {
                if (body !== 'null') {
                    // results=JSON.parse(body);
                    resolve(body);
                }
            }
        });
    });
}

async function fix_btc_txfor() {
    let hot_address = await db.query('select * from  "public"."status_bitcoin" order by trustee_session desc')
    //如果是在未清空数据的情况下，重放，可能会命中不了热地址，这可以优化未热地址集合，命中一个即可
    hot_address = (hot_address.rows[0] && hot_address.rows[0].hot_address) ? hot_address.rows[0].hot_address : ''

    let sql = ' select * from  "public"."XBridgeOfBTC_TxFor" where  value =0 and tx_type != \'Bind\' and tx_type !=\'HotAndCold\' ;'

    let txs = await db.query(sql)
    logger.debug('fix_btc_txfor ', txs.rows.length)
    for (var i = 0; i < txs.rows.length; i++) {
        let outputs = JSON.parse(txs.rows[i].outputs)
        let op_return = false
        let lock_address=''
        let value = 0
        let withdraw_value = 0

        var options = {
            uri: config.bitcoin_node,
            'auth': {
                'user': 'auth',
                'pass': 'bitcoin-b2dd077',
                'sendImmediately': false
            },
            method: 'POST',
            json: {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getrawtransaction",
                "params": [
                    txs.rows[i].txid,
                    true
                ]
            }
        };
        let rawtransaction = await post(options);
        //console.log(rawtransaction)

        rawtransaction = rawtransaction.result
        for (var j = 0; j < rawtransaction.vout.length; j++) {
            if ( (txs.rows[i].tx_type=='Lock') && ('nulldata' == rawtransaction.vout[j].scriptPubKey.type) ) { //op_return
                let msg = hexToBytes('0x' + rawtransaction.vout[j].scriptPubKey.hex).toString()
                lock_address=msg.substr(msg.length - 4)
                break
            }
        }

        for (var j = 0; j < rawtransaction.vout.length; j++) {
            //console.log(rawtransaction.vout[j])

            if ('nulldata' == rawtransaction.vout[j].scriptPubKey.type) { //op_return
                op_return = true
            }
            if (rawtransaction.vout[j].scriptPubKey.addresses && rawtransaction.vout[j].scriptPubKey.addresses[0] && (rawtransaction.vout[j].scriptPubKey.addresses[0] == hot_address)) {
                value = parseInt(rawtransaction.vout[j].value * 100000000)
            }
            if (txs.rows[i].tx_type == 'Withdraw') {
                withdraw_value += parseInt(rawtransaction.vout[j].value * 100000000)
            }
            //如果是锁仓交易
            if ( (value == 0) && (txs.rows[i].tx_type=='Lock') && (rawtransaction.vout[j].scriptPubKey.addresses&& rawtransaction.vout[j].scriptPubKey.addresses[0].substr(0,4) === lock_address) ){
                value =parseInt(rawtransaction.vout[j].value * 100000000)
                console.log('Lock',value,lock_address)
            }
        }

        if (txs.rows[i].tx_type == 'Withdraw') {
            withdraw_value -= value //减去找零
            value = withdraw_value
        }

        let update_sql = ''
        if (op_return) {
            if (value > 0 ) {
                if( txs.rows[i].tx_type=='Lock' ) {
                    update_sql = 'update "public"."XBridgeOfBTC_TxFor" set value=' + value + ' where txid=\'' + txs.rows[i].txid + '\';'
                }
                else{
                    update_sql = 'update "public"."XBridgeOfBTC_TxFor" set value=' + value + ' ,tx_type=\'BindAndDeposit\' where txid=\'' + txs.rows[i].txid + '\';'
                }

            } else {
                update_sql = 'update "public"."XBridgeOfBTC_TxFor" set tx_type=\'Bind\' where txid=\'' + txs.rows[i].txid + '\';'
            }
        } else {
            if (value > 0) {
                update_sql = 'update "public"."XBridgeOfBTC_TxFor" set value=' + value + ' where txid=\'' + txs.rows[i].txid + '\';'
            }
        }

        if (update_sql) {
            logger.debug(update_sql)
            try {
                await db.query(update_sql)
            } catch (e) {
                logger.error('fix_btc_txfor ' + e)
            }
        }
    }
}


async function psedu_intentions() {
    try {
        let best = await substrate.chain.height
        logger.debug('psedu_intentions', best);
        try {
            (async function () {

                let intentions = await nodeService().request('chainx_getPseduIntentionsV1')

                let sql = 'delete from "psedu_intentions";'

                for (var i = 0; i < intentions.length; i++) {
                    sql += Bussiness['psedu_intentions'].insertSql([
                        intentions[i].id, best, intentions[i].circulation, intentions[i].jackpot, (intentions[i].jackpotAccount), intentions[i].lastTotalDepositWeight, intentions[i].lastTotalDepositWeightUpdate, intentions[i].power, intentions[i].price
                    ])
                }

                logger.debug(sql)
                db.query(sql, (err, res) => {
                    if (err && err.code != 23505) {
                        logger.error(sql, err)
                        // throw err
                    }
                })
            })()
        } catch (e) {
            logger.error('psedu_intentions ' + e)
        }

    } catch (e) {
        logger.error('psedu_intentions ' + e)
    }

};

async function intentions() {
    try {
        let best = await substrate.chain.height
        let last_week = parseInt(best) - 7 * 24 * 60 * 60 / 2

        logger.debug('intentions', best.toString());
        try {

            let intentions = await nodeService().request('chainx_getIntentionsV1')

            let sql = 'delete  from  "public"."intentions";';
            for (var i = 0; i < intentions.length; i++) {

                sql += Bussiness['intentions'].insertSql([
                    intentions[i].account, best, intentions[i].about, intentions[i].isActive, JSON.stringify(intentions[i].isTrustee), intentions[i].isValidator, intentions[i].jackpot, intentions[i].jackpotAccount, intentions[i].lastTotalVoteWeight, intentions[i].lastTotalVoteWeightUpdate, intentions[i].name, intentions[i].selfVote, intentions[i].sessionKey, intentions[i].totalNomination, intentions[i].url
                ])

                let weekmissed = await db.query("select sum(missed) as s from missed_blocks_offline_validator where height >" + last_week + " and  accountid='" + intentions[i].account.replace(/^0x/, '') + "';")

                weekmissed = weekmissed.rows[0] ? weekmissed.rows[0].s : 0
                sql += "update intentions  set \"weekMissedBlocks\"=" + weekmissed + " where accountid='" + intentions[i].account + "';"

            }

            sql += "update intentions  set weekblocks=(select count(*) from block where number >" + last_week + " and accountid='0x'||block.producer );"

            logger.debug(sql)
            await db.query(sql)


        } catch (e) {
            logger.error('intentions ' + e)
        }

    } catch (e) {
        logger.error('intentions ' + e)
    }

};

async function fix_order_fill_aver(last) {
    let orders = await db.query("select * from \"event_xspot_AccountOrder\" where (status='Filled' or status='ParitialFill' or status='ParitialFillAndCanceled' ) and ( fill_aver =0 or lastupdate_time > " + (100 + last) + ")")

    orders = orders.rows

    try {
        for (var i = 0; i < orders.length; i++) {
            let amount = orders[i].hasfill_amount
            let sum = 0
            let fill_index = JSON.parse(orders[i].fill_index)
            //console.log('fill_index=',fill_index)
            for (var j = 0; j < fill_index.length; j++) {
                let fill = await db.query("select * from \"event_xspot_FillsOf\" where id=" + fill_index[j] + " and pairid=" + orders[i].pairid + " ;")
                //console.log(fill.rows)
                fill = fill.rows
                //console.log(fill_index[j],fill[0].id,fill[0].price,fill[0].amount)
                if( fill.length > 0 ){
                    sum += parseInt(fill[0].price) * parseInt(fill[0].amount)
                }
                
            }
            //console.log(sum,amount)
            let fill_aver = (sum / amount).toFixed(0)

            let sql = 'update "event_xspot_AccountOrder" set fill_aver=' + fill_aver + ' where accountid=\'' + orders[i].accountid + '\' and id=' + orders[i].id + ';'
            logger.debug(sql)
            await db.query(sql)
        }
    } catch (e) {
        logger.error(e)
    }
}

async function fix_bind_btc_address() {
    try {
        let sql = 'select * from  "public"."XBridgeFeatures_BitcoinCrossChainOf" where display_address is null limit 100'
        let data = await db.query(sql)
        data = data.rows
        if (data.length < 1)
            return;

        for (var i = 0; i < data.length; i++) {
            let args = JSON.parse(data[i].address)

            let display_address = hashToBtcAdress(args.hash, args.kind, args.network)
            let sql = 'update "XBridgeFeatures_BitcoinCrossChainOf" set display_address=\'' + display_address + '\' where accountid=\'' + data[i].accountid + '\''
            logger.debug(sql)
            await db.query(sql)
        }
    } catch (e) {
        logger.error(e)
    }
}

async function fix_transfer_to() {
    try {
        let count = 0;
        while (count < 10) {
            let sql = 'select * from "transaction" where module=\'XAssets\' and call=\'transfer\' and payee is null limit 10'
            let data = await db.query(sql)
            data = data.rows
            if (data.length < 1)
                break;

            for (var i = 0; i < data.length; i++) {
                let args = JSON.parse(data[i].args)
                let update = ''
                args.forEach(item => {
                    if ('dest' == item.name) {

                        update = 'update "transaction" set payee=\'' + item.data + '\' where number=' + data[i].number + ' and index=' + data[i].index
                    }
                });

                if (update) {
                    logger.debug(update)
                    await db.query(update)
                }
            }
            count++
        }
    } catch (e) {
        logger.error(e)
    }
}


async function fix_code_hash() {
    try {
        let best = await substrate.chain.height
        let last_hours = parseInt(best) - 3600/2

        logger.debug('fix_code_hash', best);
        try {
            let sql = 'select * from  "public"."contracts" where height >='+last_hours+' and code_hash=\'\' and tx !=\'\'   limit 30'
            let data = await db.query(sql)
            data = data.rows
            if (data.length < 1)
                return;

            for (var i = 0; i < data.length; i++) {
                let tx = await  db.query('select * from transaction where hash=\''+data[i].tx+'\' limit 1')
                tx=tx.rows
                if( tx.length < 1  )
                    return;
                let args=JSON.parse(tx[0].args)
                let code_hash=args[2].data
                let update_code_sql='update contracts set code_hash=\''+code_hash+'\' where tx=\''+data[i].tx+'\';'
                logger.debug(update_code_sql)
                await db.query(update_code_sql)
            }
        } catch (e) {
            logger.error('fix_code_hash ' + e)
        }

    } catch (e) {
        logger.error('fix_code_hash ' + e)
    }

};


async function fix_lbtc_channel() {
    try {
        let best = await substrate.chain.height
        let last_minues = parseInt(best) - 1* 60 / 2

        logger.debug('fix_lbtc_channel', best);
        try {
            let sql = 'select * from  "public"."event_lockupbtc" where height >='+last_minues+' and channel is null order by height desc  limit 30'
            let data = await db.query(sql)
            data = data.rows
            if (data.length < 1)
                return;

            for (var i = 0; i < data.length; i++) {
                let accountid = data[i].accountid
                sql=''
                sql = "update \"event_lockupbtc\" set channel=(select channel from \"event_ChannelBinding\" where accountid='"+accountid+"') where accountid='" + accountid + "';"
                logger.debug(sql)
                await db.query(sql)
            }
        } catch (e) {
            logger.error('fix_lbtc_channel ' + e)
        }

    } catch (e) {
        logger.error('fix_lbtc_channel ' + e)
    }

};


async function test() {
    let sql = '  select * from  "public"."XAssets_AssetBalance" where token=\'BTC\' and "ReservedDexSpot" > 0 '
    let data = await db.query(sql)
    data = data.rows
    let count = 0

    for (var i = 0; i < data.length; i++) {
        let accountid = data[i].accountid
        let orders = await nodeService().request('chainx_getOrders', [accountid, 0, 10])

        if (orders.data.length < 1) {
            console.log(accountid, data[i].ReservedDexSpot)
            count++
        }
    }
    console.log(count)
}

(async function () {
    try {
        let init = await substrate.runtimeUp
        let n = 0
        while (true) {
            await sleep(2000)
            let last = await substrate.chain.height
            try {
                await fix_order_fill_aver(last)
                await fix_transfer_to()
                await fix_btc_head_and_tx(last)
                await fix_btc_txfor()
                await fix_lbtc_channel()
                await fix_code_hash()

                if (n % 30 == 0) {
                    await psedu_intentions()
                    await fix_bind_btc_address()
                    await stat_bitcoin()
                }
                if (n % 120 == 0) {
                    (async function () {
                        await intentions()
                    })()
                }

                n++
              
            } catch (e) {
                logger.error(e)
                await substrate.runtimeUp
            }
        }


    } catch (e) {
        logger.error(e)
    }
})()