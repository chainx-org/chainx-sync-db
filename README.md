# chainx-sync-db

同步ChainX链数据，结构化入库供第三方业务使用。


# 安装
```
git clone https://github.com/chainx-org/chainx-oo7.git
cd chainx-oo7
npm link 
cd ..
git clone https://github.com/chainx-org/chainx-sync-db.git
npm install
npm link oo7-substrate
```

# 切换主网/测试网环境变量
```
export chainx=testnet
```

# 使用步骤
1. 确认主网或测试网环境
2. 确认数据库表结构完好
3. 确认同步解析程序已经启动(https://github.com/chainx-org/chainx-sync-parse)
4. 确认链节点已开启websocker
5. 安装
6. 更新配置文件相应配置项
7. 启动接收同步程序数据（在下文常用命令中）
8. 定时更新统计数据（在下文常用命令中）
9. 同步区块数据（在下文常用命令中）
10. 查看日志（在下文常用命令中）

# 配置信息
查看  ./config.js
```
log_path: 日志路径
maxLogSize: 最大日志文件大小
listen_port: 监听端口
listen_ip: '0.0.0.0',
register_ip:注册到同步解析程序的IP（即当前机器IP，用于接收同步解析程序的返回数据包 ） 
state_url: 同步解析程序的URL
db: DB 信息,
node: 链节点的websocket,
table_version: 业务库版本号
```
# 常用命令

## 清空表数据（慎用）
```
node refresh.js
```
## 接收同步程序数据
```
pm2 start index.js
```
## 定时更新统计数据
```
pm2 start stat_and_fix.js
```

## 同步区块数据
```
cd chain
# rewrite height.lock 先修改height.lock中的块高度，指定开始同步的块高
pm2 start sync.js
```

## 查看日志
```
tail -f debug.log
tail -f chain/chain.log #同步区块日志
```

## 修正所有账户Balance信息
```
node sync_account.js
```

