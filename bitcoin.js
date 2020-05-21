/*
 *	工具
 */

const Address = require('btc-address')
const binConv = require('binstring')
var request = require('request')
const bitcoin = require('bitcoinjs-lib')
const bscript = bitcoin.script
const OPS = require('bitcoin-ops')
const OP_INT_BASE = OPS.OP_RESERVED; // OP_1 - 1
var config = require('./config')
var path = require('path')
var logger = config.logger()
const substrate = require('oo7-substrate')

const {
  decode
} = require('oo7-substrate/src/codec.js')
const {
  toBtcAddress,
  bytesToRIHex,
  bytesToHex,
  hexToBytes
} = require('oo7-substrate/src/utils')

// XAccounts_CrossChainAddressMapOf #ADDRESS
// ->bitcoin address 
function pubkeyToBtcAddress(pub, network) {
  let n = network == 'mainnet' ? bitcoin.networks.mainnet : bitcoin.networks.testnet

  var pubKeyBuffer = Buffer.from(pub, 'hex')
  var addr = bitcoin.ECPair.fromPublicKeyBuffer(pubKeyBuffer, n).getAddress()

  return addr
}

function hashToBtcAdress(hash, kind, network) {
  let h = hexToBytes(hash)
  let n = 'testnet'
  let t = 'pubkeyhash'

  switch (kind) {
    case 'P2SH':
      t = 'scripthash'
      break
    default:
      t = 'pubkeyhash'
      break
  }
  switch (network) {
    case 'Mainnet':
      n = 'mainnet'
      break
    default:
      n = 'testnet'
      break
  }

  var address = new Address(
    binConv(h, {
      in: 'hex',
      out: 'bytes'
    }),
    t,
    n
  )
  console.log(h, n, t, address.toString())
  return address.toString()
}

function layoutToBtcAddress(btc_layout) {
  let b = hexToBytes(btc_layout)
  let v = b.slice(0, 1)
  let h = b.slice(1, 21)
  let c = b.slice(22, 25)

  let n = 'testnet'
  let t = 'pubkeyhash'
  switch (v) {
    case 0:
      n = 'mainnet'
      t = 'pubkeyhash'
      break
    case 5:
      n = 'mainnet'
      t = 'scripthash'
      break
    case 111:
      n = 'testnet'
      t = 'pubkeyhash'
      break
    case 196:
      n = 'testnet'
      t = 'scripthash'
      break
    default:
      break
  }

  var address = new Address(
    binConv(h, {
      in: 'hex',
      out: 'bytes'
    }),
    t,
    n
  )
  console.log(v, n, t, address.toString())

  return address.toString()
}

function queryBTCBalance(hash, kind, network, callback) {
  let address = hashToBtcAdress(hash, kind, network)
  let url = 'http://api.blockcypher.com/v1/btc/'+(('Testnet' == network)?'test3':'main')+'/addrs/' + address + '?unspentOnly=true&confirmations=1&r=' + Math.random()
  console.log(address, url)

  request(url, function (error, response, body) {

    if (!error && response.statusCode == 200) {
      let data = JSON.parse(body)
      callback({
        address: address,
        balance: data.balance
      })
    } else {
      logger.error(error)
    }
  })
}

function parseTrusteeAddrInfo(hex, callback) {
  let TrusteeAddrInfo = decode(hexToBytes(hex), 'TrusteeAddrInfo')
  let address = TrusteeAddrInfo.addr.toString()

  let redeem_script = bytesToHex(TrusteeAddrInfo.redeem_script)
  redeem_script = parseRedeemScript(redeem_script)

  request('https://api.chainx.org/bitx/testnet/' + address.address + '/balance?r=' + Math.random(), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let data = JSON.parse(body)
      callback({
        address: address,
        balance: data.balance
      })
    } else {
      // logger.error(error)
    }
  })
}

function parseRedeemScript(hex) {

  var data = bscript.decompile(Buffer.from(hex.toString(), 'hex'))
  // console.log(data)
  // console.log('OP_INT_BASE ',OP_INT_BASE,OPS.OP_0)

  var m = data[0] - OP_INT_BASE
  var n = data[data.length - 2] - OP_INT_BASE
  var pubkeys = data.slice(1, -2)
  var keys = []
  // console.log('MultilSig:' + m + '/' + n)
  for (var i = 0; i < pubkeys.length; i++) {
    keys[i] = bytesToHex(pubkeys[i])

    console.log('pubkey[' + i + ']=' + bytesToHex(pubkeys[i]), pubkeyToBtcAddress(bytesToHex(pubkeys[i])))
  }

  return {
    m: m,
    n: n,
    keys: keys
  }
}

exports.parseTrusteeAddrInfo = parseTrusteeAddrInfo
exports.parseRedeemScript = parseRedeemScript
exports.pubkeyToBtcAddress = pubkeyToBtcAddress
exports.queryBTCBalance = queryBTCBalance
exports.hashToBtcAdress = hashToBtcAdress