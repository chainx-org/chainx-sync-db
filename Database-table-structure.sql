/****** Object:  table;"public"."Balances_FreeBalance"  Script Date: 2020-05-18 15:21:59 ******/
create  table "public"."Balances_FreeBalance"
(
    "accountid" varchar(128) NOT NULL ,
    "balance" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_Balances_FreeBalance" PRIMARY KEY ("accountid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON TABLE "public"."Balances_FreeBalance" IS '账户PCX可用余额表';
/****** Object:  table;"public"."Balances_TotalIssuance"  Script Date: 2020-05-18 15:21:59 ******/
create  table "public"."Balances_TotalIssuance"
(
    "balance" bigint NOT NULL ,
    "height" integer NOT NULL ,
CONSTRAINT "pk_public_Balances_TotalIssuance" PRIMARY KEY ("height") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."Consensus_OriginalAuthorities"  Script Date: 2020-05-18 15:22:00 ******/
create  table "public"."Consensus_OriginalAuthorities"
(
    "height" bigint NOT NULL ,
    "sessionkey" text ,
CONSTRAINT "pk_public_Consensus_OriginalAuthorities" PRIMARY KEY ("height") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."System_AccountNonce"  Script Date: 2020-05-18 15:22:00 ******/
create  table "public"."System_AccountNonce"
(
    "accountid" varchar(128) NOT NULL ,
    "nonce" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_System_AccountNonce" PRIMARY KEY ("accountid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON TABLE "public"."System_AccountNonce" IS '账户nonce表';
/****** Object:  table;"public"."XAccounts_IntentionOf"  Script Date: 2020-05-18 15:22:00 ******/
create  table "public"."XAccounts_IntentionOf"
(
    "name" varchar(128) NOT NULL ,
    "accountid" varchar(128) ,
    "height" bigint ,
CONSTRAINT "pk_public_XAccounts_IntentionOf" PRIMARY KEY ("name") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XAccounts_IntentionPropertiesOf"  Script Date: 2020-05-18 15:22:00 ******/
create  table "public"."XAccounts_IntentionPropertiesOf"
(
    "accountid" varchar(128) NOT NULL ,
    "url" varchar(256) ,
    "is_active" varchar(16) ,
    "about" varchar(256) ,
    "height" bigint ,
    "session_key" varchar(128) ,
CONSTRAINT "pk_public_XAccounts_IntentionPropertiesOf" PRIMARY KEY ("accountid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."XAccounts_IntentionPropertiesOf"."session_key" IS '出块地址';
/****** Object:  table;"public"."XAccounts_TrusteeAddress"  Script Date: 2020-05-18 15:22:00 ******/
create  table "public"."XAccounts_TrusteeAddress"
(
    "chain" varchar(64) NOT NULL ,
    "hot_address" varchar(256) ,
    "cold_address" varchar(256) ,
    "height" bigint ,
CONSTRAINT "pk_public_XAccounts_TrusteeAddress" PRIMARY KEY ("chain") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XAssetsRecords_ApplicationMap"  Script Date: 2020-05-18 15:22:01 ******/
create  table "public"."XAssetsRecords_ApplicationMap"
(
    "id" bigint NOT NULL ,
    "accountid" varchar(124) ,
    "token" varchar(32) ,
    "balance" bigint ,
    "addr" varchar(128) ,
    "ext" varchar(128) ,
    "time" bigint ,
    "txid" varchar(32) ,
    "status" varchar(32) ,
    "height" bigint ,
CONSTRAINT "pk_public_XAssetsRecords_ApplicationMap" PRIMARY KEY ("id") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON TABLE "public"."XAssetsRecords_ApplicationMap" IS '提现记录';
/****** Object:  table;"public"."XAssets_AssetBalance"  Script Date: 2020-05-18 15:22:01 ******/
create  table "public"."XAssets_AssetBalance"
(
    "accountid" varchar(128) NOT NULL ,
    "token" varchar(32) NOT NULL ,
    "Free" bigint ,
    "ReservedStaking" bigint ,
    "ReservedStakingRevocation" bigint ,
    "ReservedWithdrawal" bigint ,
    "ReservedDexSpot" bigint ,
    "ReservedDexFuture" bigint ,
    "height" bigint ,
    "ReservedErc20" bigint DEFAULT 0 ,
CONSTRAINT "pk_public_XAssets_AssetBalance" PRIMARY KEY ("accountid","token") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON TABLE "public"."XAssets_AssetBalance" IS '资产表';
/****** Object:  table;"public"."XAssets_AssetInfo"  Script Date: 2020-05-18 15:22:01 ******/
create  table "public"."XAssets_AssetInfo"
(
    "token" varchar(64) NOT NULL ,
    "token_name" varchar(64) ,
    "chain" varchar(64) ,
    "precision" bigint ,
    "des" varchar(256) ,
    "ok" varchar(16) ,
    "num" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_XAssets_AssetInfo" PRIMARY KEY ("token") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XAssets_TotalAssetBalance"  Script Date: 2020-05-18 15:22:01 ******/
create  table "public"."XAssets_TotalAssetBalance"
(
    "token" varchar(64) NOT NULL ,
    "Free" bigint ,
    "ReservedStaking" bigint ,
    "ReservedStakingRevocation" bigint ,
    "ReservedWithdrawal" bigint ,
    "ReservedDexSpot" bigint ,
    "ReservedDexFuture" bigint ,
    "height" bigint ,
    "ReservedErc20" bigint DEFAULT 0 ,
CONSTRAINT "pk_public_XAssets_TotalAssetBalance" PRIMARY KEY ("token") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XBridgeCommon_CrossChainBinding"  Script Date: 2020-05-18 15:22:02 ******/
create  table "public"."XBridgeCommon_CrossChainBinding"
(
    "token" varchar(64) NOT NULL ,
    "accountid" varchar(128) NOT NULL ,
    "channel" varchar(128) NOT NULL ,
    "height" bigint NOT NULL ,
CONSTRAINT "pk_public_XBridgeCommon_CrossChainBinding" PRIMARY KEY ("token","accountid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XBridgeFeatures_BitcoinCrossChainOf"  Script Date: 2020-05-18 15:22:02 ******/
create  table "public"."XBridgeFeatures_BitcoinCrossChainOf"
(
    "address" varchar(128) NOT NULL ,
    "accountid" varchar(128) NOT NULL ,
    "channel" varchar(128) ,
    "height" bigint NOT NULL ,
    "display_address" varchar(128) ,
CONSTRAINT "pk_public_XBridgeFeatures_BitcoinCrossChainOf" PRIMARY KEY ("address") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XBridgeFeatures_BitcoinTrusteeIntentionPropertiesOf"  Script Date: 2020-05-18 15:22:02 ******/
create  table "public"."XBridgeFeatures_BitcoinTrusteeIntentionPropertiesOf"
(
    "accountid" varchar(128) NOT NULL ,
    "about" varchar(256) ,
    "hot_entity" varchar(256) ,
    "cold_entity" varchar(256) ,
    "height" bigint ,
CONSTRAINT "pk_public_XBridgeFeatures_BitcoinTrusteeIntentionPropertiesOf" PRIMARY KEY ("accountid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XBridgeFeatures_BitcoinTrusteeSessionInfoOf"  Script Date: 2020-05-18 15:22:02 ******/
create  table "public"."XBridgeFeatures_BitcoinTrusteeSessionInfoOf"
(
    "id" bigint NOT NULL ,
    "trustee_list" varchar(20480) NOT NULL ,
    "hot_address" varchar(2048) NOT NULL ,
    "cold_address" varchar(2048) NOT NULL ,
    "height" bigint NOT NULL ,
    "hot_address_list" varchar(20480) ,
    "cold_address_list" varchar(20480) ,
CONSTRAINT "pk_public_XBridgeFeatures_BitcoinTrusteeSessionInfoOf" PRIMARY KEY ("id") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XBridgeFeatures_EthereumCrossChainOf"  Script Date: 2020-05-18 15:22:03 ******/
create  table "public"."XBridgeFeatures_EthereumCrossChainOf"
(
    "address" varchar(128) NOT NULL ,
    "accountid" varchar(128) NOT NULL ,
    "channel" varchar(128) ,
    "height" bigint NOT NULL ,
CONSTRAINT "pk_public_XBridgeFeatures_EthereumCrossChainOf" PRIMARY KEY ("address") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XBridgeFeatures_TrusteeSessionInfoLen"  Script Date: 2020-05-18 15:22:03 ******/
create  table "public"."XBridgeFeatures_TrusteeSessionInfoLen"
(
    "chain" varchar(64) NOT NULL ,
    "length" bigint NOT NULL ,
    "height" bigint NOT NULL ,
CONSTRAINT "pk_public_XBridgeFeatures_TrusteeSessionInfoLen" PRIMARY KEY ("chain") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON TABLE "public"."XBridgeFeatures_TrusteeSessionInfoLen" IS '信托届数';
/****** Object:  table;"public"."XBridgeOfBTC_BlockHeaderFor"  Script Date: 2020-05-18 15:22:03 ******/
create  table "public"."XBridgeOfBTC_BlockHeaderFor"
(
    "header" varchar(128) NOT NULL ,
    "version" bigint ,
    "parent" varchar(128) ,
    "merkle" varchar(128) ,
    "time" bigint ,
    "bits" bigint ,
    "nonce" bigint ,
    "confirmed" varchar(32) ,
    "height" bigint ,
    "bitcoin_height" bigint ,
    "txid" varchar(20480) ,
    "chainx_tx" varchar(128) ,
    "relay" varchar(128) ,
    "insert_height" bigint NOT NULL DEFAULT 0 ,
CONSTRAINT "pk_public_XBridgeOfBTC_BlockHeaderFor" PRIMARY KEY ("header") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."XBridgeOfBTC_BlockHeaderFor"."chainx_tx" IS 'chainx的交易哈希';
COMMENT ON COLUMN "public"."XBridgeOfBTC_BlockHeaderFor"."relay" IS '中继人';
COMMENT ON COLUMN "public"."XBridgeOfBTC_BlockHeaderFor"."insert_height" IS '插入时块高';
COMMENT ON TABLE "public"."XBridgeOfBTC_BlockHeaderFor" IS 'BTC 区块头表';
/****** Object:  table;"public"."XBridgeOfBTC_PendingDepositMap"  Script Date: 2020-05-18 15:22:03 ******/
create  table "public"."XBridgeOfBTC_PendingDepositMap"
(
    "address" varchar(128) NOT NULL ,
    "txid_balance" varchar(102400) NOT NULL ,
    "height" bigint NOT NULL ,
CONSTRAINT "pk_public_XBridgeOfBTC_PendingDepositMap" PRIMARY KEY ("address") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XBridgeOfBTC_TxFor"  Script Date: 2020-05-18 15:22:03 ******/
create  table "public"."XBridgeOfBTC_TxFor"
(
    "txid" varchar(128) NOT NULL ,
    "tx_type" varchar(128) ,
    "version" bigint ,
    "inputs" varchar(204800) ,
    "outputs" varchar(204800) ,
    "lock_time" bigint ,
    "height" bigint ,
    "chainx_tx" varchar(128) ,
    "relay" varchar(128) ,
    "bitcoin_height" bigint ,
    "header" varchar(128) ,
    "value" bigint DEFAULT 0 ,
CONSTRAINT "pk_public_XBridgeOfBTC_TxFor" PRIMARY KEY ("txid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."XBridgeOfBTC_TxFor"."chainx_tx" IS 'chainx的交易哈希';
COMMENT ON COLUMN "public"."XBridgeOfBTC_TxFor"."relay" IS '中继人';
COMMENT ON COLUMN "public"."XBridgeOfBTC_TxFor"."bitcoin_height" IS '比特币块高';
COMMENT ON COLUMN "public"."XBridgeOfBTC_TxFor"."header" IS '比特币块哈希';
COMMENT ON COLUMN "public"."XBridgeOfBTC_TxFor"."value" IS '金额';
COMMENT ON TABLE "public"."XBridgeOfBTC_TxFor" IS 'BTC 交易表';
/****** Object:  table;"public"."XBridgeOfSDOT_Claims"  Script Date: 2020-05-18 15:22:04 ******/
create  table "public"."XBridgeOfSDOT_Claims"
(
    "address" varchar(64) NOT NULL ,
    "balance" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_XBridgeOfSDOT_Claims" PRIMARY KEY ("address") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XSpot_HandicapOf"  Script Date: 2020-05-18 15:22:04 ******/
create  table "public"."XSpot_HandicapOf"
(
    "pairid" bigint NOT NULL ,
    "buy" bigint NOT NULL DEFAULT 0 ,
    "sell" bigint NOT NULL DEFAULT 0 ,
    "height" bigint NOT NULL DEFAULT 0 ,
CONSTRAINT "pk_public_XSpot_HandicapOf" PRIMARY KEY ("pairid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XSpot_OrderCountOf"  Script Date: 2020-05-18 15:22:04 ******/
create  table "public"."XSpot_OrderCountOf"
(
    "accountid" varchar(128) NOT NULL ,
    "id" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_XSpot_OrderCountOf" PRIMARY KEY ("accountid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XSpot_OrderInfoOf"  Script Date: 2020-05-18 15:22:05 ******/
create  table "public"."XSpot_OrderInfoOf"
(
    "accountid" varchar(128) NOT NULL ,
    "id" bigint NOT NULL ,
    "pairid" bigint ,
    "price" bigint ,
    "index" bigint ,
    "account" varchar(128) ,
    "class" varchar(32) ,
    "direction" varchar(32) ,
    "amount" bigint ,
    "hasfill_amount" bigint ,
    "create_time" bigint ,
    "lastupdate_time" bigint ,
    "status" varchar(32) ,
    "reserve_last" bigint ,
    "fill_index" varchar(1024) ,
    "height" bigint ,
CONSTRAINT "pk_public_XSpot_OrderInfoOf" PRIMARY KEY ("accountid","id") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON TABLE "public"."XSpot_OrderInfoOf" IS '用户挂单';
/****** Object:  table;"public"."XSpot_QuotationsOf"  Script Date: 2020-05-18 15:22:05 ******/
create  table "public"."XSpot_QuotationsOf"
(
    "pairid" bigint NOT NULL ,
    "price" bigint NOT NULL ,
    "accountid_id" varchar(51200) ,
    "height" bigint ,
CONSTRAINT "pk_public_XSpot_QuotationsOf" PRIMARY KEY ("pairid","price") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XSpot_TradeHisotryIndexOf"  Script Date: 2020-05-18 15:22:05 ******/
create  table "public"."XSpot_TradeHisotryIndexOf"
(
    "pairid" bigint NOT NULL ,
    "id" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_XSpot_TradeHisotryIndexOf" PRIMARY KEY ("pairid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XSpot_TradingPairInfoOf"  Script Date: 2020-05-18 15:22:05 ******/
create  table "public"."XSpot_TradingPairInfoOf"
(
    "pairid" bigint NOT NULL ,
    "last_price" bigint ,
    "aver_price" bigint ,
    "update_height" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_XSpot_TradingPairInfoOf" PRIMARY KEY ("pairid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XSpot_TradingPairOf"  Script Date: 2020-05-18 15:22:06 ******/
create  table "public"."XSpot_TradingPairOf"
(
    "pairid" bigint NOT NULL ,
    "currency_pair" varchar(128) ,
    "precision" bigint ,
    "unit_precision" bigint ,
    "online" varchar(16) ,
    "height" bigint ,
CONSTRAINT "pk_public_XSpot_TradingPairOf" PRIMARY KEY ("pairid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON TABLE "public"."XSpot_TradingPairOf" IS '交易对';
/****** Object:  table;"public"."XStaking_IntentionProfiles"  Script Date: 2020-05-18 15:22:06 ******/
create  table "public"."XStaking_IntentionProfiles"
(
    "accountid" varchar(128) NOT NULL ,
    "total_nomination" bigint ,
    "last_total_vote_weight" bigint ,
    "last_total_vote_weight_update" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_XStaking_IntentionProfiles" PRIMARY KEY ("accountid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XStaking_Intentions"  Script Date: 2020-05-18 15:22:06 ******/
create  table "public"."XStaking_Intentions"
(
    "intentions" text ,
    "height" bigint 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XStaking_NominationRecords"  Script Date: 2020-05-18 15:22:06 ******/
create  table "public"."XStaking_NominationRecords"
(
    "nominator" varchar(128) NOT NULL ,
    "nominee" varchar(128) NOT NULL ,
    "nomination" bigint ,
    "last_vote_weight" numeric(128,0) ,
    "last_vote_weight_update" bigint ,
    "revocations" varchar(10240) ,
    "height" bigint ,
CONSTRAINT "pk_public_XStaking_NominationRecords" PRIMARY KEY ("nominator","nominee") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XStaking_SlashedPerSession"  Script Date: 2020-05-18 15:22:07 ******/
create  table "public"."XStaking_SlashedPerSession"
(
    "accountid" text ,
    "height" bigint 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XStaking_StakeWeight"  Script Date: 2020-05-18 15:22:07 ******/
create  table "public"."XStaking_StakeWeight"
(
    "accountid" varchar(128) NOT NULL ,
    "balance" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_XStaking_StakeWeight" PRIMARY KEY ("accountid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XTokens_DepositRecords"  Script Date: 2020-05-18 15:22:07 ******/
create  table "public"."XTokens_DepositRecords"
(
    "accountid" varchar(128) NOT NULL ,
    "token" varchar(64) NOT NULL ,
    "last_deposit_weight" bigint ,
    "last_deposit_weight_update" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_XTokens_DepositRecords" PRIMARY KEY ("accountid","token") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XTokens_PseduIntentionProfiles"  Script Date: 2020-05-18 15:22:07 ******/
create  table "public"."XTokens_PseduIntentionProfiles"
(
    "token" varchar(64) NOT NULL ,
    "last_total_deposit_weight" bigint ,
    "last_total_deposit_weight_update" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_XTokens_PseduIntentionProfiles" PRIMARY KEY ("token") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."XTokens_PseduIntentions"  Script Date: 2020-05-18 15:22:08 ******/
create  table "public"."XTokens_PseduIntentions"
(
    "token" text ,
    "height" bigint 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."block"  Script Date: 2020-05-18 15:22:08 ******/
create  table "public"."block"
(
    "number" bigint NOT NULL ,
    "hash" varchar(128) NOT NULL ,
    "parent_hash" varchar(128) ,
    "state_root" varchar(128) ,
    "extrinsics_root" varchar(128) ,
    "digest" text ,
    "justification" text ,
    "extrinsics" bigint ,
    "data" text ,
    "time" bigint ,
    "producer" varchar(128) ,
CONSTRAINT "pk_public_block" PRIMARY KEY ("number","hash") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = TRUE
)
;
COMMENT ON COLUMN "public"."block"."time" IS '时间戳';
COMMENT ON COLUMN "public"."block"."producer" IS '出块人';
COMMENT ON TABLE "public"."block" IS '区块表';
/****** Object:  table;"public"."contracts"  Script Date: 2020-05-18 15:22:08 ******/
create  table "public"."contracts"
(
    "contract" varchar(64) NOT NULL ,
    "code_hash" varchar(64) NOT NULL ,
    "height" bigint NOT NULL ,
    "account" varchar(64) NOT NULL ,
    "name" varchar(64) ,
    "abi" text ,
    "tx" varchar(64) NOT NULL ,
CONSTRAINT "pk_public_contracts" PRIMARY KEY ("contract") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."contracts"."contract" IS '合约地址';
COMMENT ON COLUMN "public"."contracts"."code_hash" IS '代码哈希';
COMMENT ON COLUMN "public"."contracts"."height" IS '部署高度';
COMMENT ON COLUMN "public"."contracts"."account" IS '部署账户';
COMMENT ON COLUMN "public"."contracts"."abi" IS 'ABI';
/****** Object:  table;"public"."contracts_transation"  Script Date: 2020-05-18 15:22:09 ******/
create  table "public"."contracts_transation"
(
    "contract" varchar(64) NOT NULL ,
    "tx" varchar(64) NOT NULL ,
    "height" bigint NOT NULL ,
CONSTRAINT "pk_public_contracts_transation" PRIMARY KEY ("contract","tx") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."contracts_transation"."contract" IS '合约地址';
COMMENT ON COLUMN "public"."contracts_transation"."tx" IS '交易哈希';
/****** Object:  table;"public"."event"  Script Date: 2020-05-18 15:22:09 ******/
create  table "public"."event"
(
    "number" bigint NOT NULL ,
    "index" bigint NOT NULL ,
    "phase" varchar(512) ,
    "module" varchar(64) ,
    "name" varchar(64) ,
    "args" text ,
    "data" text ,
    "transaction_tx" varchar(128) ,
CONSTRAINT "pk_public_event" PRIMARY KEY ("number","index") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."event_ChannelBinding"  Script Date: 2020-05-18 15:22:09 ******/
create  table "public"."event_ChannelBinding"
(
    "token" varchar(64) NOT NULL ,
    "accountid" varchar(128) NOT NULL ,
    "channel" varchar(128) NOT NULL ,
    "height" bigint NOT NULL ,
CONSTRAINT "pk_public_event_ChannelBinding" PRIMARY KEY ("token","accountid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."event_DepositRecord"  Script Date: 2020-05-18 15:22:10 ******/
create  table "public"."event_DepositRecord"
(
    "accountid" varchar(124) NOT NULL ,
    "token" varchar(32) NOT NULL ,
    "balance" bigint ,
    "address" varchar(128) ,
    "memo" varchar(256) ,
    "txid" varchar(128) NOT NULL ,
    "txstate" varchar(32) ,
    "height" bigint NOT NULL ,
    "chain" varchar(64) NOT NULL ,
CONSTRAINT "pk_public_event_DepositRecord" PRIMARY KEY ("accountid","token","txid","height","chain") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON TABLE "public"."event_DepositRecord" IS '充值记录';
/****** Object:  table;"public"."event_WithdrawRecord"  Script Date: 2020-05-18 15:22:10 ******/
create  table "public"."event_WithdrawRecord"
(
    "id" bigint NOT NULL ,
    "accountid" varchar(128) ,
    "token" varchar(64) ,
    "balance" bigint ,
    "memo" varchar(256) ,
    "address" varchar(128) ,
    "txid" varchar(128) ,
    "txstate" varchar(32) ,
    "height" bigint ,
    "chain" varchar(64) ,
    "data" varchar(20480) ,
    "chainx_tx" varchar(128) ,
CONSTRAINT "pk_public_event_WithdrawRecord" PRIMARY KEY ("id") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."event_WithdrawRecord"."id" IS '提现id';
COMMENT ON COLUMN "public"."event_WithdrawRecord"."data" IS '提现原文';
COMMENT ON COLUMN "public"."event_WithdrawRecord"."chainx_tx" IS 'chainx交易哈希';
COMMENT ON TABLE "public"."event_WithdrawRecord" IS '提现表';
/****** Object:  table;"public"."event_lockupbtc"  Script Date: 2020-05-18 15:22:11 ******/
create  table "public"."event_lockupbtc"
(
    "hash" varchar(128) NOT NULL ,
    "index" bigint NOT NULL ,
    "address" varchar(128) ,
    "value" bigint ,
    "relay_hash" varchar(128) ,
    "accountid" varchar(128) ,
    "height" bigint NOT NULL DEFAULT 0 ,
    "pre_hash" varchar(128) ,
    "pre_index" bigint ,
    "channel" varchar(128) ,
    "type" bigint NOT NULL ,
CONSTRAINT "pk_public_event_lockupbtc" PRIMARY KEY ("hash","index","type") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."event_lockupbtc"."hash" IS 'Bitcoin交易哈希 ';
COMMENT ON COLUMN "public"."event_lockupbtc"."index" IS 'Output Index ';
COMMENT ON COLUMN "public"."event_lockupbtc"."address" IS 'Bitcoin地址';
COMMENT ON COLUMN "public"."event_lockupbtc"."value" IS '金额 ';
COMMENT ON COLUMN "public"."event_lockupbtc"."relay_hash" IS 'ChainX中继交易 ';
COMMENT ON COLUMN "public"."event_lockupbtc"."accountid" IS 'ChainX地址 ';
COMMENT ON COLUMN "public"."event_lockupbtc"."pre_hash" IS '上一笔关联的交易哈希';
COMMENT ON COLUMN "public"."event_lockupbtc"."pre_index" IS '上一笔关联的交易的index';
COMMENT ON COLUMN "public"."event_lockupbtc"."channel" IS '渠道';
/****** Object:  table;"public"."event_lockupbtc_total"  Script Date: 2020-05-18 15:22:11 ******/
create  table "public"."event_lockupbtc_total"
(
    "accountid" varchar(128) NOT NULL ,
    "address" varchar NOT NULL ,
    "lock" bigint NOT NULL DEFAULT 0 ,
    "unlock" bigint NOT NULL DEFAULT 0 ,
    "height" bigint NOT NULL ,
CONSTRAINT "pk_public_event_lockupbtc_total" PRIMARY KEY ("accountid","address") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."event_lockupbtc_total"."address" IS 'BTC';
COMMENT ON COLUMN "public"."event_lockupbtc_total"."lock" IS 'Sum Lock Value';
COMMENT ON COLUMN "public"."event_lockupbtc_total"."unlock" IS 'Sum Unlock Value';
/****** Object:  table;"public"."event_multisig"  Script Date: 2020-05-18 15:22:11 ******/
create  table "public"."event_multisig"
(
    "multisigid" varchar(128) NOT NULL ,
    "addr" varchar(128) NOT NULL ,
    "accountid" varchar(128) NOT NULL ,
    "module" varchar(64) NOT NULL ,
    "call" varchar(64) NOT NULL ,
    "confirm_tx" varchar(2048) ,
    "args" text ,
    "yet_needed" bigint DEFAULT 0 ,
    "owners_done" bigint DEFAULT 0 ,
    "height" bigint NOT NULL ,
    "txid" varchar(128) NOT NULL ,
CONSTRAINT "pk_public_event_multisig" PRIMARY KEY ("multisigid","txid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
/****** Object:  table;"public"."event_xspot_AccountOrder"  Script Date: 2020-05-18 15:22:12 ******/
create  table "public"."event_xspot_AccountOrder"
(
    "accountid" varchar(128) NOT NULL ,
    "id" bigint NOT NULL ,
    "pairid" bigint ,
    "price" bigint ,
    "class" varchar(32) ,
    "direction" varchar(32) ,
    "amount" bigint ,
    "hasfill_amount" bigint ,
    "create_time" bigint ,
    "lastupdate_time" bigint ,
    "status" varchar(32) ,
    "reserve_last" bigint ,
    "fill_index" varchar(1024) ,
    "height" bigint ,
    "fill_aver" bigint NOT NULL DEFAULT 0 ,
CONSTRAINT "pk_public_event_xspot_AccountOrder" PRIMARY KEY ("accountid","id") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."event_xspot_AccountOrder"."fill_aver" IS '成交均价';
COMMENT ON TABLE "public"."event_xspot_AccountOrder" IS '挂单表';
/****** Object:  table;"public"."event_xspot_FillsOf"  Script Date: 2020-05-18 15:22:12 ******/
create  table "public"."event_xspot_FillsOf"
(
    "id" bigint NOT NULL ,
    "pairid" bigint NOT NULL ,
    "price" bigint ,
    "maker_user" varchar(128) ,
    "taker_user" varchar(128) ,
    "maker_user_order_index" bigint ,
    "taker_user_order_index" bigint ,
    "amount" bigint ,
    "time" bigint ,
CONSTRAINT "pk_public_event_xspot_FillsOf" PRIMARY KEY ("id","pairid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON TABLE "public"."event_xspot_FillsOf" IS ' 成交表';
/****** Object:  table;"public"."handicap"  Script Date: 2020-05-18 15:22:13 ******/
create  table "public"."handicap"
(
    "pairid" bigint NOT NULL ,
    "direction" varchar(32) NOT NULL ,
    "price" bigint NOT NULL ,
    "amount" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_handicap" PRIMARY KEY ("pairid","direction","price") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON TABLE "public"."handicap" IS '盘口';
/****** Object:  table;"public"."handicap_new"  Script Date: 2020-05-18 15:22:13 ******/
create  table "public"."handicap_new"
(
    "pairid" bigint NOT NULL ,
    "direction" varchar(32) NOT NULL ,
    "price" bigint NOT NULL ,
    "amount" bigint ,
    "height" bigint ,
CONSTRAINT "pk_public_handicap_new" PRIMARY KEY ("pairid","price") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON TABLE "public"."handicap_new" IS '盘口';
/****** Object:  table;"public"."intentions"  Script Date: 2020-05-18 15:22:13 ******/
create  table "public"."intentions"
(
    "accountid" varchar(128) NOT NULL ,
    "about" varchar(128) ,
    "isActive" varchar(16) ,
    "isTrustee" varchar(256) ,
    "isValidator" varchar(16) ,
    "jackpot" bigint ,
    "jackpotAddress" varchar(128) ,
    "lastTotalVoteWeight" numeric(128,0) ,
    "lastTotalVoteWeightUpdate" bigint ,
    "name" varchar(64) ,
    "selfVote" bigint ,
    "sessionKey" varchar(128) ,
    "totalNomination" bigint ,
    "url" varchar(128) ,
    "height" bigint NOT NULL ,
    "blocks" bigint DEFAULT 0 ,
    "missedBlocks" bigint DEFAULT 0 ,
    "weekblocks" bigint DEFAULT 0 ,
    "weekMissedBlocks" bigint DEFAULT 0 ,
CONSTRAINT "pk_public_intentions" PRIMARY KEY ("accountid","height") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."intentions"."blocks" IS '累计出块数';
COMMENT ON COLUMN "public"."intentions"."missedBlocks" IS '漏块';
COMMENT ON COLUMN "public"."intentions"."weekblocks" IS '最近一周出块数';
COMMENT ON COLUMN "public"."intentions"."weekMissedBlocks" IS '最近一周漏块数';
COMMENT ON TABLE "public"."intentions" IS '验证人汇总信息表';
/****** Object:  table;"public"."kline"  Script Date: 2020-05-18 15:22:13 ******/
create  table "public"."kline"
(
    "pairid" bigint NOT NULL ,
    "type" bigint NOT NULL ,
    "time" bigint NOT NULL ,
    "open" bigint ,
    "high" bigint ,
    "low" bigint ,
    "close" bigint ,
    "volume" bigint DEFAULT 0 ,
CONSTRAINT "pk_public_kline" PRIMARY KEY ("pairid","type","time") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."kline"."type" IS '60:一分 300:5分 1800:30分 86400:日 604800：周  2592000：月';
COMMENT ON COLUMN "public"."kline"."time" IS '开始时间';
COMMENT ON COLUMN "public"."kline"."open" IS '开盘';
COMMENT ON COLUMN "public"."kline"."high" IS '最高';
COMMENT ON COLUMN "public"."kline"."low" IS '最低';
COMMENT ON COLUMN "public"."kline"."close" IS '收盘';
COMMENT ON COLUMN "public"."kline"."volume" IS '成交量';
COMMENT ON TABLE "public"."kline" IS 'k线图';
/****** Object:  table;"public"."lbtc_addresses"  Script Date: 2020-05-18 15:22:13 ******/
create  table "public"."lbtc_addresses"
(
    "accountid" varchar(128) NOT NULL ,
    "channel" varchar(128) ,
    "addresses" varchar(65535) ,
    "height" bigint NOT NULL DEFAULT 0 ,
CONSTRAINT "pk_public_lbtc_addresses" PRIMARY KEY ("accountid") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."lbtc_addresses"."addresses" IS 'json';
/****** Object:  table;"public"."missed_blocks_offline_validator"  Script Date: 2020-05-18 15:22:14 ******/
create  table "public"."missed_blocks_offline_validator"
(
    "accountid" varchar(128) NOT NULL ,
    "missed" bigint NOT NULL ,
    "height" bigint NOT NULL ,
CONSTRAINT "pk_public_missed_blocks_offline_validator" PRIMARY KEY ("accountid","height") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."missed_blocks_offline_validator"."height" IS '更新高度';
COMMENT ON TABLE "public"."missed_blocks_offline_validator" IS '验证人漏块数';
/****** Object:  table;"public"."psedu_intentions"  Script Date: 2020-05-18 15:22:14 ******/
create  table "public"."psedu_intentions"
(
    "id" varchar(32) NOT NULL ,
    "circulation" bigint NOT NULL ,
    "jackpot" bigint NOT NULL ,
    "jackpotAddress" varchar(128) NOT NULL ,
    "lastTotalDepositWeight" numeric(128,0) NOT NULL ,
    "lastTotalDepositWeightUpdate" bigint NOT NULL ,
    "power" bigint NOT NULL ,
    "price" bigint NOT NULL ,
    "height" bigint NOT NULL ,
CONSTRAINT "pk_public_psedu_intentions" PRIMARY KEY ("id","height") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."psedu_intentions"."id" IS '链';
COMMENT ON COLUMN "public"."psedu_intentions"."circulation" IS '总余额';
COMMENT ON COLUMN "public"."psedu_intentions"."jackpot" IS '奖池金额';
COMMENT ON COLUMN "public"."psedu_intentions"."jackpotAddress" IS '奖池地址';
COMMENT ON COLUMN "public"."psedu_intentions"."lastTotalDepositWeight" IS '奖池总票龄';
COMMENT ON COLUMN "public"."psedu_intentions"."lastTotalDepositWeightUpdate" IS '奖池更新块高';
COMMENT ON COLUMN "public"."psedu_intentions"."power" IS '算力';
COMMENT ON COLUMN "public"."psedu_intentions"."price" IS '平均价';
COMMENT ON TABLE "public"."psedu_intentions" IS '充值虚拟挖矿';
/****** Object:  table;"public"."status_bitcoin"  Script Date: 2020-05-18 15:22:14 ******/
create  table "public"."status_bitcoin"
(
    "trustee_session" bigint NOT NULL ,
    "hot_balance" bigint NOT NULL ,
    "cold_balance" bigint NOT NULL ,
    "hot_address" varchar(2048) NOT NULL ,
    "cold_address" varchar(2048) NOT NULL ,
    "deposit_count" bigint NOT NULL ,
    "withdraw_count" bigint NOT NULL ,
    "bind_count" bigint NOT NULL ,
    "height" bigint NOT NULL ,
    "lockup_count" bigint NOT NULL DEFAULT 0 ,
    "lockup_balance" bigint NOT NULL DEFAULT 0 ,
    "lockup_address_count" bigint NOT NULL DEFAULT 0 ,
CONSTRAINT "pk_public_status_bitcoin" PRIMARY KEY ("trustee_session") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."status_bitcoin"."trustee_session" IS '信托届数';
COMMENT ON COLUMN "public"."status_bitcoin"."hot_balance" IS '热钱包余额';
COMMENT ON COLUMN "public"."status_bitcoin"."cold_balance" IS '冷钱包余额';
COMMENT ON COLUMN "public"."status_bitcoin"."hot_address" IS '热钱包地址';
COMMENT ON COLUMN "public"."status_bitcoin"."cold_address" IS '冷钱包地址';
COMMENT ON COLUMN "public"."status_bitcoin"."deposit_count" IS '充值总笔数';
COMMENT ON COLUMN "public"."status_bitcoin"."withdraw_count" IS '提现总笔数';
COMMENT ON COLUMN "public"."status_bitcoin"."bind_count" IS '绑定地址数';
COMMENT ON COLUMN "public"."status_bitcoin"."lockup_address_count" IS '锁仓地址数';
COMMENT ON TABLE "public"."status_bitcoin" IS '比特币轻节点状态';
/****** Object:  table;"public"."status_chain"  Script Date: 2020-05-18 15:22:14 ******/
create  table "public"."status_chain"
(
    "best" bigint NOT NULL ,
    "finalized" bigint ,
    "transactions" bigint ,
    "pcx_issuance" bigint ,
    "pcx_destroy" bigint ,
    "deposit_diff" bigint ,
    "vote_diff" bigint ,
    "validators" bigint ,
    "votes" bigint ,
    "dividend_cycle" bigint ,
    "vote_cycle" bigint ,
    "selfvote_count" bigint NOT NULL DEFAULT 0 ,
    "account_count" bigint NOT NULL DEFAULT 0 ,
    "btc_power" bigint NOT NULL DEFAULT 0 ,
    "sdot_power" bigint NOT NULL DEFAULT 0 ,
    "contract_count" bigint NOT NULL DEFAULT 0 ,
    "contract_call_count" bigint NOT NULL DEFAULT 0 ,
CONSTRAINT "pk_public_status_chain" PRIMARY KEY ("best") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."status_chain"."best" IS '最新高度';
COMMENT ON COLUMN "public"."status_chain"."finalized" IS '确认高度';
COMMENT ON COLUMN "public"."status_chain"."transactions" IS '交易总数';
COMMENT ON COLUMN "public"."status_chain"."pcx_issuance" IS 'PCX发行数量';
COMMENT ON COLUMN "public"."status_chain"."pcx_destroy" IS 'PCX销毁数量';
COMMENT ON COLUMN "public"."status_chain"."deposit_diff" IS '充值挖矿难度';
COMMENT ON COLUMN "public"."status_chain"."vote_diff" IS '投票挖矿难度';
COMMENT ON COLUMN "public"."status_chain"."validators" IS '验证人数量';
COMMENT ON COLUMN "public"."status_chain"."votes" IS '总投票数';
COMMENT ON COLUMN "public"."status_chain"."dividend_cycle" IS '分红周期';
COMMENT ON COLUMN "public"."status_chain"."vote_cycle" IS '选举周期';
COMMENT ON COLUMN "public"."status_chain"."selfvote_count" IS '节点自抵押';
COMMENT ON COLUMN "public"."status_chain"."account_count" IS '账户总数';
COMMENT ON COLUMN "public"."status_chain"."contract_count" IS '智能合约数';
COMMENT ON COLUMN "public"."status_chain"."contract_call_count" IS '智能合约调用数';
COMMENT ON TABLE "public"."status_chain" IS '链状态';
/****** Object:  table;"public"."transaction"  Script Date: 2020-05-18 15:22:15 ******/
create  table "public"."transaction"
(
    "number" bigint NOT NULL ,
    "index" bigint NOT NULL ,
    "signed" varchar(128) ,
    "signature" varchar(256) ,
    "account_index" bigint ,
    "era" varchar(128) ,
    "module" varchar(64) ,
    "call" varchar(64) ,
    "help" varchar(512) ,
    "args" text ,
    "data" text ,
    "version" bigint ,
    "acceleration" bigint ,
    "hash" varchar(256) ,
    "time" bigint ,
    "status" varchar(32) NOT NULL DEFAULT '''ExtrinsicSuccess''::character varying' ,
    "payee" varchar(128) ,
    "fee" bigint NOT NULL DEFAULT 0 ,
CONSTRAINT "pk_public_transaction" PRIMARY KEY ("number","index") ,
CONSTRAINT "t_hash" UNIQUE ("hash") WITH (FILLFACTOR=100) 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."transaction"."hash" IS '交易哈希';
COMMENT ON COLUMN "public"."transaction"."time" IS '时间戳';
COMMENT ON COLUMN "public"."transaction"."status" IS 'ExtrinsicSuccess|ExtrinsicFailed';
COMMENT ON TABLE "public"."transaction" IS '交易表';
/****** Object:  table;"public"."transaction_daily"  Script Date: 2020-05-18 15:22:15 ******/
create  table "public"."transaction_daily"
(
    "day" bigint NOT NULL ,
    "num" bigint ,
    "height" bigint NOT NULL ,
CONSTRAINT "pk_public_transaction_daily" PRIMARY KEY ("day") 
)
WITH (
    FILLFACTOR = 100,
    OIDS = FALSE
)
;
COMMENT ON COLUMN "public"."transaction_daily"."day" IS '日期';
COMMENT ON COLUMN "public"."transaction_daily"."num" IS '数量';
COMMENT ON COLUMN "public"."transaction_daily"."height" IS '块高度';
COMMENT ON TABLE "public"."transaction_daily" IS '交易-日统计';
