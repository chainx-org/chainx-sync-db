var log4js = require('log4js')
var pg = require('pg')

var config = {
  bitcoin_node:'http://x.x.x.x:xxx',
  bitcoin: 'testnet',
  log_path: __dirname + '/debug.log', // 日志路径
  maxLogSize: 104857600, // 最大日志文件大小
  listen_port: 8096, // 监听端口
  listen_ip: '0.0.0.0',
  register_ip: '127.0.0.1', // 注册到同步程序的IP
  state_url: 'http://127.0.0.1:3030', // 状态同步库注册服务的地址
  db: { // DB 信息
    dev:{
      host: 'x.x.x.x:xxx',
      port: 'xxx',
      user: 'xxx',
      password: 'xxxx',
      database: 'xxxx'
    },
    testnet: {
      host: '',
      port: '',
      user: '',
      password: '',
      database: ''
    },
    mainnet: {
      host: '',
      port: '',
      user: '',
      password: '',
      database: ''
    }
  },
  node: { // 节点websocket
    ws: ['ws://127.0.0.1:8087']
  },
  table_version: '1.0.0' // 业务库版本号
}
let db = process.env.chainx ? config.db[process.env.chainx] : config.db.dev

console.log('DB:', process.env.chainx, db)

config.db = new pg.Client(db)
config.db.connect()

config.logger = function (name) {
  log4js.configure({
    appenders: {
      out: {
        type: 'console'
      },
      app: {
        type: 'file',
        filename: name ? name : config.log_path,
        'maxLogSize': config.maxLogSize,
        'backups': 0
      }
    },
    categories: {
      default: {
        appenders: ['out', 'app'],
        level: 'debug'
      }
    }
  })

  var logger = log4js.getLogger()
  return logger
}

module.exports = config
