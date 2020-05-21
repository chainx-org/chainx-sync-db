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


async function fix_account_balance(best) {

    let count = 0;
    while (count < 10000) {
        let sql = ' select distinct  accountid  from  "public"."XAssets_AssetBalance"  order by accountid desc  limit 10000  '
        let data = await db.query(sql)
        data = data.rows
        console.log(data.length)

        if (data.length < 1)
            break;
        for (var i = 0; i < data.length; i++) {
            logger.debug(i)
            let accountid = data[i].accountid
            let asset = await nodeService().request('chainx_getAssetsByAccount', [accountid, 0, 10])

            for (var j = 0; j < asset.data.length; j++) {
                let Free = parseInt(asset.data[j].details['Free'])
                let ReservedCurrency = parseInt(asset.data[j].details['ReservedCurrency'])
                let ReservedDexFuture = parseInt(asset.data[j].details['ReservedDexFuture'])
                let ReservedDexSpot = parseInt(asset.data[j].details['ReservedDexSpot'])
                let ReservedStaking = parseInt(asset.data[j].details['ReservedStaking'])
                let ReservedStakingRevocation = parseInt(asset.data[j].details['ReservedStakingRevocation'])
                let ReservedWithdrawal = parseInt(asset.data[j].details['ReservedWithdrawal'])
                let ReservedErc20= parseInt(asset.data[j].details['ReservedErc20'])

                let token = asset.data[j].name

                let sql = Bussiness['XAssets AssetBalance'].insertOrUpdateSql([accountid, token, Free, ReservedStaking, ReservedStakingRevocation, ReservedWithdrawal, ReservedDexSpot, ReservedDexFuture,ReservedErc20, best])
                logger.debug(sql)
                await db.query(sql)
            }

            count++
        }
        break;
    }

}

(async function () {
    try {
        let init = await substrate.runtimeUp
        while (true) {
            await sleep(2000)
            let last = await substrate.chain.height
            try {
                await fix_account_balance(last)
                process.exit(0);

            } catch (e) {
                logger.error(e)
                await substrate.runtimeUp
            }
        }

    } catch (e) {
        logger.error(e)
    }
})()