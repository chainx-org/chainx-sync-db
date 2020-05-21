var config = require('./config');
var path = require('path');
var logger = config.logger();
const db = config.db;

const escape = require('pg-escape');

class Struct extends Map {
    toJSON() {
        const json = {};
        for (const [key, value] of this.entries()) {
            if (typeof value !== 'object' || !value) {
                json[key] = value;
            } else if (typeof value.toPrimitive === 'function') {
                json[key] = value.toPrimitive();
            } else if (typeof value.toJSON === 'function') {
                json[key] = value.toJSON();
            }
        }
        return json;
    }
}

class Table extends Struct {
    insertSql(value) {
        let sql = 'insert into ' + this.get('table') + ' (' + this.get('pkey') + ',' + this.get('column') + ') values (';
        for (var i = 0; i < value.length; i++) {
            if (typeof value[i] == 'string')
                sql += escape('%L', value[i]);
            else
                sql += value[i];

            sql += ','
        }
        sql = sql.replace(/,$/, '');
        sql += ');';
        return sql;
    }

    insertOrUpdateSql(value) {
        let sql = this.insertSql(value);
        sql = sql.replace(/;$/, '');

        sql += ' on conflict (' + this.get('pkey') + ' ) do update set ';
        let columns = this.get('column').split(',');
        for (var i = 0; i < columns.length; i++) {
            sql += columns[i] + '=excluded.' + columns[i] + ',';
        }
        sql = sql.replace(/,$/, '');
        sql += ';';

        return sql;
    }
};

class Handicap extends Table {
    update(height) {
        let sql = "delete  from \"handicap\";insert into \"handicap\" (select pairid,direction,price,sum(amount)-sum(hasfill_amount) from \"event_xspot_AccountOrder\" where status != 'Canceled' and status !='ParitialFillAndCanceled' and status !='Filled' group by (pairid,direction,price) HAVING sum(amount)-sum(hasfill_amount) > 0 );update \"handicap\" set height=" + height

        return sql;
    }
}

async function handicap(accountid, index) {
    let order = await db.query('select * from "event_xspot_AccountOrder" where accountid=\'' + accountid + '\' and id=' + index)
    order = order.rows[0]

    let quotaionsof = await db.query('select * from "XSpot_QuotationsOf" where pairid=' + order.pairid + ' and price=' + order.price)
    if (quotaionsof.rows.length < 1)
        return

    quotaionsof = quotaionsof.rows[0]

    let accountid_index = JSON.parse(quotaionsof.accountid_id)
    let pairid = order.pairid
    let price = order.price
    let direction = order.direction
    let amount = 0
    let height = order.height

    for (var i = 0; i < accountid_index.length; i++) {
        let o = await db.query('select * from "event_xspot_AccountOrder" where accountid=\'' + accountid_index[i][0].replace(/^0x/, '') + '\' and id=' + accountid_index[i][1])
        o = o.rows[0]
        direction = o.direction
        amount += (parseInt(o.amount) - parseInt(o.hasfill_amount))
    }
    let sql = Bussiness['handicap_new'].insertOrUpdateSql([pairid, price, direction, amount, height])
    logger.debug(sql)

    await db.query(sql)
}

class KLine extends Table {

    update(pairid, price, amount, time) {
        let type = [60, 300, 1800, 86400, 604800, 2592000]

        let sql = '';
        for (var i = 0; i < type.length; i++) {
            let point = parseInt(time) - parseInt(time % type[i]);
            sql += 'insert into "kline" (pairid,type,time,open,high,low,close) values (' + pairid + ',' + type[i] + ',' + point + ',' + price + ',' + price + ',' + price + ',' + price + ') on conflict (pairid,type,time) do update set type=' + type[i] + ';'

            //sql += this.insertSql([pairid, type[i], point, price, price, price, price]);
            sql += 'update  "kline" set high=' + price + ' where pairid=' + pairid + ' and type=' + type[i] + ' and time=' + point + ' and "kline".high<' + price + ';'
            sql += 'update  "kline" set low=' + price + ' where pairid=' + pairid + ' and type=' + type[i] + '  and time=' + point + ' and "kline".low>' + price + ';'
            sql += 'update  "kline" set close=' + price + ' where pairid=' + pairid + ' and type=' + type[i] + ' and time=' + point + ';'
            sql += 'update  "kline" set volume=(volume+' + amount + ') where pairid=' + pairid + ' and type=' + type[i] + ' and time=' + point + ';'
        }

        return sql
    }
}

let Bussiness = {
    'block': new Table(
        new Map([
            ['table', '"block"'],
            ['pkey', 'number'],
            ['column', 'hash,parent_hash,state_root,extrinsics_root,digest,justification,extrinsics,data'],
        ])
    ),
    'transaction': new Table(
        new Map([
            ['table', '"transaction"'],
            ['pkey', 'number,index'],
            ['column', 'signed,signature,account_index,era,module,call,help,args,data,version,acceleration,hash'],
        ])
    ),
    'event': new Table(
        new Map([
            ['table', '"event"'],
            ['pkey', 'number,index'],
            ['column', 'phase,module,name,args,data,transaction_tx'],
        ])
    ),
    'Consensus OriginalAuthorities': new Table(
        new Map([
            ['prefix', 'Consensus OriginalAuthorities'],
            ['table', '"Consensus_OriginalAuthorities"'], //表名
            ['pkey', 'height'], //主键
            ['column', 'sessionkey'], //列
        ])
    ),
    'System AccountNonce': new Table(
        new Map([
            ['prefix', 'System AccountNonce'],
            ['table', '"System_AccountNonce"'], //表名
            ['pkey', 'accountid'], //主键
            ['column', 'nonce,height'], //列
        ])
    ),
    'XAssets AssetBalance': new Table(
        new Map([
            ['prefix', 'XAssets AssetBalance'],
            ['table', '"XAssets_AssetBalance"'], //表名
            ['pkey', 'accountid,token'], //主键
            ['column', '"Free","ReservedStaking","ReservedStakingRevocation","ReservedWithdrawal","ReservedDexSpot","ReservedDexFuture","ReservedErc20",height'], //列
        ])
    ),
    'XAssets TotalAssetBalance': new Table(
        new Map([
            ['prefix', 'XAssets TotalAssetBalance'],
            ['table', '"XAssets_TotalAssetBalance"'], //表名
            ['pkey', 'token'], //主键
            ['column', '"Free","ReservedStaking","ReservedStakingRevocation","ReservedWithdrawal","ReservedDexSpot","ReservedDexFuture","ReservedErc20",height'], //列
        ])
    ),
    'XAssets AssetList': new Table(
        new Map([
            ['prefix', 'XAssets AssetList'],
            ['table', '"XAssets_AssetList"'], //表名
            ['pkey', 'chain'], //主键
            ['column', 'token,height'], //列
        ])
    ),
    'XAssets AssetInfo': new Table(
        new Map([
            ['prefix', 'XAssets AssetInfo'],
            ['table', '"XAssets_AssetInfo"'], //表名
            ['pkey', 'token'], //主键
            ['column', 'token_name,chain,precision,des,ok,num,height'], //列
        ])
    ),
    'event_xspot_AccountOrder': new Table(
        new Map([
            ['table', '"event_xspot_AccountOrder"'], //表名
            ['pkey', 'accountid,id'], //主键
            ['column', 'pairid,class,price,direction,amount,create_time,height'], //列
        ])
    ),
    'event_DepositRecord': new Table(
        new Map([
            ['table', '"event_DepositRecord"'], //表名
            ['pkey', 'accountid,chain,token,txid,memo'], //主键
            ['column', 'balance,address,txstate,height'], //列
        ])
    ),
    'event_WithdrawRecord': new Table(
        new Map([
            ['table', '"event_WithdrawRecord"'], //表名
            ['pkey', 'id'], //主键
            ['column', 'accountid,chain,token,balance,memo,address,txstate,height'], //列
        ])
    ),
    'event_xspot_FillsOf': new Table(
        new Map([
            ['table', '"event_xspot_FillsOf"'], //表名
            ['pkey', 'id,pairid'], //主键
            ['column', 'price,maker_user,taker_user,maker_user_order_index,taker_user_order_index,amount,time'], //列
        ])
    ),
    'Balances FreeBalance': new Table(
        new Map([
            ['prefix', 'Balances FreeBalance'],
            ['table', '"Balances_FreeBalance"'], //表名
            ['pkey', 'accountid'], //主键
            ['column', 'balance,height'], //列
        ])
    ),
    'Balances TotalIssuance': new Table(
        new Map([
            ['prefix', 'Balances TotalIssuance'],
            ['table', '"Balances_TotalIssuance"'], //表名
            ['pkey', 'balance'], //主键
            ['column', 'height'], //列
        ])
    ),
    'XAssetsRecords ApplicationMap': new Table(
        new Map([
            ['prefix', 'XAssetsRecords ApplicationMap'],
            ['table', '"XAssetsRecords_ApplicationMap"'], //表名
            ['pkey', 'id'], //主键
            ['column', 'accountid,token,balance,addr,ext,time,height'], //列
        ])
    ),
    'XStaking StakeWeight': new Table(
        new Map([
            ['prefix', 'XStaking StakeWeight'],
            ['table', '"XStaking_StakeWeight"'], //表名
            ['pkey', 'accountid'], //主键
            ['column', 'balance,height'], //列
        ])
    ),
    'XStaking IntentionProfiles': new Table(
        new Map([
            ['prefix', 'XStaking IntentionProfiles'],
            ['table', '"XStaking_IntentionProfiles"'], //表名
            ['pkey', 'accountid'], //主键
            ['column', 'total_nomination,last_total_vote_weight,last_total_vote_weight_update,height'], //列
        ])
    ),
    'XStaking NominationRecords': new Table(
        new Map([
            ['prefix', 'XStaking NominationRecords'],
            ['table', '"XStaking_NominationRecords"'], //表名
            ['pkey', 'nominator,nominee'], //主键
            ['column', 'nomination,last_vote_weight,last_vote_weight_update,revocations,height'], //列
        ])
    ),
    'XStaking NominationRecordsV1': new Table(
        new Map([
            ['prefix', 'XStaking NominationRecordsV1'],
            ['table', '"XStaking_NominationRecords"'], //表名
            ['pkey', 'nominator,nominee'], //主键
            ['column', 'nomination,last_vote_weight,last_vote_weight_update,revocations,height'], //列
        ])
    ),
    'XStaking SlashedPerSession': new Table(
        new Map([
            ['prefix', 'XStaking SlashedPerSession'],
            ['table', '"XStaking_SlashedPerSession"'], //表名
            ['pkey', 'accountid'], //主键
            ['column', 'height'], //列
        ])
    ),
    'XTokens PseduIntentions': new Table(
        new Map([
            ['prefix', 'XTokens PseduIntentions'],
            ['table', '"XTokens_PseduIntentions"'], //表名
            ['pkey', 'token'], //主键
            ['column', 'height'], //列
        ])
    ),
    'XTokens PseduIntentionProfiles': new Table(
        new Map([
            ['prefix', 'XTokens PseduIntentionProfiles'],
            ['table', '"XTokens_PseduIntentionProfiles"'], //表名
            ['pkey', 'token'], //主键
            ['column', 'last_total_deposit_weight,last_total_deposit_weight_update,height'], //列
        ])
    ),
    'XTokens DepositRecords': new Table(
        new Map([
            ['prefix', 'XTokens DepositRecords'],
            ['table', '"XTokens_DepositRecords"'], //表名
            ['pkey', 'accountid,token'], //主键
            ['column', 'last_deposit_weight,last_deposit_weight_update,height'], //列
        ])
    ),
    'XSpot TradingPairOf': new Table(
        new Map([
            ['prefix', 'XSpot TradingPairOf'],
            ['table', '"XSpot_TradingPairOf"'], //表名
            ['pkey', 'pairid'], //主键
            ['column', 'currency_pair,precision,unit_precision,online,height'], //列
        ])
    ),
    'XSpot TradingPairInfoOf': new Table(
        new Map([
            ['prefix', 'XSpot TradingPairInfoOf'],
            ['table', '"XSpot_TradingPairInfoOf"'], //表名
            ['pkey', 'pairid'], //主键
            ['column', 'last_price,aver_price,update_height,height'], //列
        ])
    ),
    'XSpot TradeHisotryIndexOf': new Table(
        new Map([
            ['prefix', 'XSpot TradeHisotryIndexOf'],
            ['table', '"XSpot_TradeHisotryIndexOf"'], //表名
            ['pkey', 'pairid'], //主键
            ['column', 'id,height'], //列
        ])
    ),
    'XSpot OrderCountOf': new Table(
        new Map([
            ['prefix', 'XSpot OrderCountOf'],
            ['table', '"XSpot_OrderCountOf"'], //表名
            ['pkey', 'accountid'], //主键
            ['column', 'id,height'], //列
        ])
    ),
    'XSpot OrderInfoOf': new Table(
        new Map([
            ['prefix', 'XSpot OrderInfoOf'],
            ['table', '"XSpot_OrderInfoOf"'], //表名
            ['pkey', 'accountid,id'], //主键
            ['column', 'pairid,price,index,account,class,direction,amount,hasfill_amount,create_time,lastupdate_time,status,reserve_last,fill_index,height'], //列
        ])
    ),
    'XSpot QuotationsOf': new Table(
        new Map([
            ['prefix', 'XSpot QuotationsOf'],
            ['table', '"XSpot_QuotationsOf"'], //表名
            ['pkey', 'pairid,price'], //主键
            ['column', 'accountid_id,height'], //列
        ])
    ),
    'XSpot HandicapOf': new Table(
        new Map([
            ['prefix', 'XSpot HandicapOf'],
            ['table', '"XSpot_HandicapOf"'], //表名
            ['pkey', 'pairid'], //主键
            ['column', 'buy,sell,height'], //列
        ])
    ),
    'XAccounts IntentionOf': new Table(
        new Map([
            ['prefix', 'XAccounts IntentionOf'],
            ['table', '"XAccounts_IntentionOf"'], //表名
            ['pkey', 'name'], //主键
            ['column', 'accountid,height'], //列
        ])
    ),
    'XAccounts IntentionPropertiesOf': new Table(
        new Map([
            ['prefix', 'XAccounts IntentionPropertiesOf'],
            ['table', '"XAccounts_IntentionPropertiesOf"'], //表名
            ['pkey', 'accountid'], //主键
            ['column', 'url,is_active,about,session_key,height'], //列
        ])
    ),
    'XBridgeFeatures BitcoinTrusteeIntentionPropertiesOf': new Table(
        new Map([
            ['prefix', 'XBridgeFeatures BitcoinTrusteeIntentionPropertiesOf'],
            ['table', '"XBridgeFeatures_BitcoinTrusteeIntentionPropertiesOf"'], //表名
            ['pkey', 'accountid'], //主键
            ['column', 'about,hot_entity,cold_entity,height'], //列
        ])
    ),
    'XBridgeCommon CrossChainBinding': new Table(
        new Map([
            ['prefix', 'XBridgeCommon CrossChainBinding'],
            ['table', '"XBridgeCommon_CrossChainBinding"'], //表名
            ['pkey', 'token,accountid'], //主键
            ['column', 'channel,height'], //列
        ])
    ),
    'XBridgeFeatures BitcoinCrossChainOf': new Table(
        new Map([
            ['prefix', 'XBridgeFeatures BitcoinCrossChainOf'],
            ['table', '"XBridgeFeatures_BitcoinCrossChainOf"'], //表名
            ['pkey', 'address'], //主键
            ['column', 'accountid,channel,height'], //列
        ])
    ),
    'XBridgeFeatures EthereumCrossChainOf': new Table(
        new Map([
            ['prefix', 'XBridgeFeatures EthereumCrossChainOf'],
            ['table', '"XBridgeFeatures_EthereumCrossChainOf"'], //表名
            ['pkey', 'address'], //主键
            ['column', 'accountid,channel,height'], //列
        ])
    ),
    'XBridgeFeatures BitcoinTrusteeSessionInfoOf': new Table(
        new Map([
            ['prefix', 'XBridgeFeatures BitcoinTrusteeSessionInfoOf'],
            ['table', '"XBridgeFeatures_BitcoinTrusteeSessionInfoOf"'], //表名
            ['pkey', 'id'], //主键
            ['column', 'trustee_list,hot_address,cold_address,hot_address_list,cold_address_list,height'], //列
        ])
    ),
    'XBridgeFeatures TrusteeSessionInfoLen': new Table(
        new Map([
            ['prefix', 'XBridgeFeatures TrusteeSessionInfoLen'],
            ['table', '"XBridgeFeatures_TrusteeSessionInfoLen"'], //表名
            ['pkey', 'chain'], //主键
            ['column', 'length,height'], //列
        ])
    ),
    'XBridgeOfSDOT Claims': new Table(
        new Map([
            ['prefix', 'XBridgeOfSDOT Claims'],
            ['table', '"XBridgeOfSDOT_Claims"'], //表名
            ['pkey', 'address'], //主键
            ['column', 'balance,height'], //列
        ])
    ),
    'XBridgeOfBTC TxFor': new Table(
        new Map([
            ['prefix', 'XBridgeOfBTC TxFor'],
            ['table', '"XBridgeOfBTC_TxFor"'], //表名
            ['pkey', 'txid'], //主键
            ['column', 'tx_type,version,inputs,outputs,lock_time,value,height'], //列
        ])
    ),
    'XBridgeOfBTC BlockHeaderFor': new Table(
        new Map([
            ['prefix', 'XBridgeOfBTC BlockHeaderFor'],
            ['table', '"XBridgeOfBTC_BlockHeaderFor"'], //表名
            ['pkey', 'header'], //主键
            ['column', 'bitcoin_height,version,parent,merkle,time,bits,nonce,txid,confirmed,height'], //列
        ])
    ),
    'XBridgeOfBTC PendingDepositMap': new Table(
        new Map([
            ['prefix', 'XBridgeOfBTC PendingDepositMap'],
            ['table', '"XBridgeOfBTC_PendingDepositMap"'], //表名
            ['pkey', 'address'], //主键
            ['column', 'txid_balance,height'], //列
        ])
    ),
    'status_chain': new Table(
        new Map([
            ['table', '"status_chain"'], //表名
            ['pkey', 'best'], //主键
            ['column', 'finalized,transactions,pcx_issuance,pcx_destroy,deposit_diff,vote_diff,validators,votes,dividend_cycle,vote_cycle,btc_power,sdot_power'], //列
        ])
    ),
    'status_bitcoin': new Table(
        new Map([
            ['table', '"status_bitcoin"'], //表名
            ['pkey', 'trustee_session'], //主键
            ['column', 'hot_balance,cold_balance,hot_address,cold_address,deposit_count,withdraw_count,bind_count,lockup_count,lockup_balance,lockup_address_count,height'], //列
        ])
    ),
    'transaction_daily': new Table(
        new Map([
            ['table', '"transaction_daily"'], //表名
            ['pkey', 'day,height'], //主键
            ['column', 'num'], //列
        ])
    ),
    'handicap': new Handicap(
        new Map([
            ['table', '"handicap"'], //表名
            ['pkey', 'pairid,direction,price'], //主键
            ['column', 'amount,height'], //列
        ])
    ),
    'handicap_new': new Table(
        new Map([
            ['table', '"handicap_new"'], //表名
            ['pkey', 'pairid,price'], //主键
            ['column', 'direction,amount,height'], //列
        ])
    ),
    'kline': new KLine(
        new Map([
            ['table', '"kline"'], //表名
            ['pkey', 'pairid,type,time'], //主键
            ['column', 'open,high,low,close'], //列
        ])
    ),
    'intentions': new Table(
        new Map([
            ['table', '"intentions"'], //表名
            ['pkey', 'accountid,height'], //主键
            ['column', 'about,"isActive","isTrustee","isValidator",jackpot,"jackpotAddress","lastTotalVoteWeight","lastTotalVoteWeightUpdate",name,"selfVote","sessionKey","totalNomination",url'], //列
        ])
    ),
    'psedu_intentions': new Table(
        new Map([
            ['table', '"psedu_intentions"'], //表名
            ['pkey', 'id,height'], //主键
            ['column', 'circulation,"jackpot","jackpotAddress","lastTotalDepositWeight","lastTotalDepositWeightUpdate","power","price"'], //列
        ])
    ),
    'missed_blocks_offline_validator': new Table(
        new Map([
            ['table', '"missed_blocks_offline_validator"'], //表名
            ['pkey', '"accountid",height'], //主键
            ['column', 'missed'], //列
        ])
    ),
    'event_lockupbtc': new Table(
        new Map([
            ['table', '"event_lockupbtc"'], //表名
            ['pkey', 'hash,index,type'], //主键
            ['column', 'address,value,accountid,height'],
        ])
    ),
    'event_lockupbtc_total': new Table(
        new Map([
            ['table', '"event_lockupbtc_total"'], //表名
            ['pkey', 'accountid,address'], //主键
            ['column', 'lock,unlock,height'],
        ])
    ),
    'event_ChannelBinding': new Table(
        new Map([
            ['table', '"event_ChannelBinding"'], //表名
            ['pkey', 'token,accountid'], //主键
            ['column', 'channel,height'],
        ])
    ),
    'lbtc_addresses': new Table(
        new Map([
            ['table', '"lbtc_addresses"'], //表名
            ['pkey', 'accountid'], //主键
            ['column', 'channel,addresses,height'],
        ])
    ),
    'event_multisig': new Table(
        new Map([
            ['table', '"event_multisig"'], //表名
            ['pkey', 'addr,txid'], //主键
            ['column', 'accountid,multisigid,module,call,args,height'],
        ])
    ),
    'contracts': new Table(
        new Map([
            ['table', '"contracts"'], //表名
            ['pkey', 'contract'], //主键
            ['column', 'code_hash,account,name,abi,tx,height'],
        ])
    ),
    'contracts_transation': new Table(
        new Map([
            ['table', '"contracts_transation"'], //表名
            ['pkey', 'contract'], //主键
            ['column', 'tx,height'],
        ])
    ),
}


module.exports = {
    Bussiness,
    handicap
}