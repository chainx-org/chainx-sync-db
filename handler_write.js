var path = require('path')
var config = require('./config')
var logger = config.logger()
const {
    Bussiness
} = require('./bussiness')
const db = config.db
const substrate = require('oo7-substrate');
const {
    decode
} = require('oo7-substrate/src/codec.js')
const {
    toBtcAddress,
    bytesToRIHex,
    bytesToHex
} = require('oo7-substrate/src/utils');
const {
    parseRedeemScript
} = require('./bitcoin')

exports.handler = function (response, request) {
    var body = ''
    request.on('data', function (chunk) {
        body += chunk
    })
    request.on('end', function () {
        try {
            // {"data":[{"key":["k1","k2"...],"prefix":"block","value":["v1","v2"]}],"height":0}
            logger.debug('Receive write data:' + JSON.stringify(body))
            body = JSON.parse(body)

            for (var i = 0; i < body.data.length; i++) {
                let tail_sql = ''
                let value = body.data[i].value
                if ("null" == value || !value) { //已被删除
                    if ("XBridgeOfBTC PendingDepositMap" == body.data[i].prefix) {
                        let delete_sql = "delete from \"XBridgeOfBTC_PendingDepositMap\" where address='" + JSON.stringify(body.data[i].key) + "';"
                        logger.debug(delete_sql)
                        db.query(delete_sql, (err, res) => {
                            if (err && err.code != 23505) {
                                logger.error(delete_sql, err)
                                // throw err
                            }
                        })
                    }
                    continue;
                }


                if ("XAssets AssetBalance" == body.data[i].prefix || "XAssets TotalAssetBalance" == body.data[i].prefix) {
                    value = [
                        value['Free'] ? value['Free'] : 0,
                        value['ReservedStaking'] ? value['ReservedStaking'] : 0,
                        value['ReservedStakingRevocation'] ? value['ReservedStakingRevocation'] : 0,
                        value['ReservedWithdrawal'] ? value['ReservedWithdrawal'] : 0,
                        value['ReservedDexSpot'] ? value['ReservedDexSpot'] : 0,
                        value['ReservedDexFuture'] ? value['ReservedDexFuture'] : 0,
                        value['ReservedErc20'] ? value['ReservedErc20'] : 0,
                    ]
                } else if ("XTokens PseduIntentions" == body.data[i].prefix) {
                    value = [JSON.stringify(value)];
                } else if ("XTokens PseduIntentionProfiles" == body.data[i].prefix || "XTokens PseduIntentionProfilesV1" == body.data[i].prefix) {
                    value = [
                        value.last_total_deposit_weight,
                        value.last_total_deposit_weight_update
                    ]
                } else if ("XTokens DepositRecords" == body.data[i].prefix || "XTokens DepositRecordsV1" == body.data[i].prefix) {
                    value = [
                        value.last_deposit_weight,
                        value.last_deposit_weight_update
                    ]
                } else if ("XStaking IntentionProfiles" == body.data[i].prefix) {
                    value = [
                        value.total_nomination,
                        value.last_total_vote_weight,
                        value.last_total_vote_weight_update
                    ]
                } else if ("XSpot TradingPairOf" == body.data[i].prefix) {
                    value = [
                        JSON.stringify(value.currency_pair),
                        value.precision,
                        value.unit_precision,
                        value.online
                    ]
                } else if ("XSpot QuotationsOf" == body.data[i].prefix) {
                    value = [
                        JSON.stringify(value)
                    ]
                } else if ("XAccounts IntentionPropertiesOf" == body.data[i].prefix) {
                    value = [
                        value.url,
                        value.is_active,
                        value.about,
                        value.session_key != null ? value.session_key : '',
                    ]
                } else if ("XBridgeFeatures BitcoinTrusteeIntentionPropertiesOf" == body.data[i].prefix) {
                    value = [
                        value.about,
                        JSON.stringify(value.hot_entity),
                        JSON.stringify(value.cold_entity)
                    ]
                } else if ("XStaking Intentions" == body.data[i].prefix || "XStaking IntentionsV1" == body.data[i].prefix) {
                    value = [
                        JSON.stringify(value)
                    ]
                } else if ("XStaking SlashedPerSession" == body.data[i].prefix) {
                    value = [
                        JSON.stringify(value)
                    ]
                } else if ("XBridgeFeatures BitcoinCrossChainOf" == body.data[i].prefix) {
                    body.data[i].key = JSON.stringify(body.data[i].key)
                    value = [
                        value[0],
                        value[1] ? value[1] : ''
                    ]
                } else if ("XBridgeFeatures EthereumCrossChainOf" == body.data[i].prefix) {
                    value = [
                        value[0],
                        value[1] ? value[1] : ''
                    ]
                } else if ("XBridgeFeatures BitcoinTrusteeSessionInfoOf" == body.data[i].prefix) {
                    let hot_redeem_script = parseRedeemScript(value.hot_address.redeem_script.replace(/^0x/, ''))
                    let cold_redeem_script = parseRedeemScript(value.cold_address.redeem_script.replace(/^0x/, ''))

                    logger.debug('redeem_script ', hot_redeem_script, cold_redeem_script)

                    value = [
                        JSON.stringify(value.trustee_list),
                        JSON.stringify(value.hot_address),
                        JSON.stringify(value.cold_address),
                        JSON.stringify(hot_redeem_script.keys),
                        JSON.stringify(cold_redeem_script.keys)
                    ]
                } else if ("XStaking NominationRecords" == body.data[i].prefix || "XStaking NominationRecordsV1" == body.data[i].prefix) {
                    value = [
                        value.nomination,
                        value.last_vote_weight,
                        value.last_vote_weight_update,
                        JSON.stringify(value.revocations)
                    ]
                } else if ("XAssets AssetInfo" == body.data[i].prefix) {
                    value = [
                        value[0].token_name,
                        value[0].chain,
                        value[0].precision,
                        value[0].desc.replace(/\'/, ' '),
                        value[1],
                        value[2]
                    ]
                } else if ("XSpot OrderInfoOf" == body.data[i].prefix) {
                    value = [
                        value.props[1],
                        value.props[4],
                        value.props[5],
                        value.props[0],
                        value.props[6],
                        value.props[2],
                        value.props[3],
                        value.already_filled,
                        value.props[7],
                        value.last_update_at,
                        value.status,
                        value.remaining,
                        JSON.stringify(value.executed_indices)
                    ]
                } else if ("XSpot HandicapOf" == body.data[i].prefix) {
                    value = [
                        value.highest_bid,
                        value.lowest_offer
                    ]
                } else if ("XAssetsRecords ApplicationMap" == body.data[i].prefix) {
                    value = [
                        value.data.applicant,
                        value.data.token,
                        value.data.balance,
                        value.data.addr,
                        value.data.ext,
                        value.data.time
                    ]
                } else if ("XBridgeOfBTC PendingDepositMap" == body.data[i].prefix) {
                    body.data[i].type = "value"
                    value = [
                        JSON.stringify(body.data[i].key),
                        JSON.stringify(value)
                    ]
                } else if ("XBridgeOfBTC BlockHeaderFor" == body.data[i].prefix) {
                    let hash_b = substrate.hexToBytes(body.data[i].key)
                    let hash = substrate.bytesToRIHex(hash_b)
                    body.data[i].key = hash

                    let previous_b = substrate.hexToBytes(value.header.previous_header_hash)
                    let previous_hash = substrate.bytesToRIHex(previous_b)
                    let merkle_b = substrate.hexToBytes(value.header.merkle_root_hash)
                    let merkle_hash = substrate.bytesToRIHex(merkle_b)

                    for (var j = 0; value.txid_list && j < value.txid_list.length; j++) {
                        value.txid_list[j] = substrate.bytesToRIHex(substrate.hexToBytes(value.txid_list[j]))
                    }

                    if (value.confirmed == false) {
                        tail_sql = 'update "public"."XBridgeOfBTC_BlockHeaderFor" set insert_height=' + body.height + ' where header=\'' + body.data[i].key + '\';'
                    }

                    value = [
                        value.height,
                        value.header.version,
                        previous_hash,
                        merkle_hash,
                        value.header.time,
                        value.header.bits,
                        value.header.nonce,
                        JSON.stringify(value.txid_list),
                        value.confirmed,
                    ]

                } else if ("XBridgeOfBTC TxFor" == body.data[i].prefix) {
                    body.data[i].key = substrate.bytesToRIHex(substrate.hexToBytes(body.data[i].key))

                    let balance = 0
                    if ('Withdrawal' == value.tx_type) {
                        for (var k = 0; k < value.raw_tx.outputs.length - 1; k++) {
                            balance += value.raw_tx.outputs[k].value
                        }
                    }

                    value = [
                        value.tx_type,
                        value.raw_tx.version,
                        JSON.stringify(value.raw_tx.inputs),
                        JSON.stringify(value.raw_tx.outputs),
                        value.raw_tx.lock_time,
                        balance
                    ]
                } else if (!(value instanceof Array)) {
                    value = [value]
                } else if ("value" == body.data[i].type) {

                    value = value.map(v => {
                        if (typeof v == 'object') {
                            return JSON.stringify(v);
                        } else
                            return v.toString();
                    });
                }

                let key = body.data[i].key
                if (!(key instanceof Array)) {
                    key = [key]
                }

                let sql = '';
                if (body.data[i].type == "value") {
                    sql = Bussiness[body.data[i].prefix].insertSql([...value, body.height])
                } else {
                    sql = Bussiness[body.data[i].prefix].insertOrUpdateSql([...key.map(v => v.toString()), ...value, body.height])
                }
                if (tail_sql != '') {
                    sql += tail_sql;
                }
                db.query(sql, (err, res) => {
                    logger.debug(sql, err)
                    if (err && err.code != 23505) {
                        logger.error(sql, err)
                        // throw err
                    }
                })
            }
        } catch (e) {
            logger.error('write!' + JSON.stringify(body) + e)
            response.writeHead(200, {
                'Content-Type': 'text/html',
                'X-FRAME-OPTIONS': 'DENY',
                'Cache-Control': 'no-cache'
            })
            response.end('{"result":"null"}')
            return
        }

        response.writeHead(200, {
            'Content-Type': 'text/html',
            'X-FRAME-OPTIONS': 'DENY',
            'Cache-Control': 'no-cache'
        })
        response.end('{"result":"OK"}')
        return
    })
}
