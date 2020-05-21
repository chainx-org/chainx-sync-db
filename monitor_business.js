var config = require('./config');
const substrate = require('oo7-substrate');
const request = require('request');
var logger = config.logger();

substrate.setNodeUri(config.node.ws);

function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(' enough sleep~');
        }, time);
    })
}

(async function () {
    try {
        let init = await substrate.runtimeUp
        let chainx_best = 0
        let warn_count = 0 //告警次数 超过5次自动退出
        while (true) {
            try {
                let last = await substrate.chain.height
                logger.debug('同步库节点高度', chainx_best, last)
                if (chainx_best > 0 && chainx_best >= last) {
                    let warn = '同步库节点掉线'
                    logger.error("告警", warn, chainx_best, last)

                    request('http://x.x.x.x:xxx/sms?message=' +encodeURI(warn) + '&pass=ChainX.org', function (error, response, body) {
                        if (!error && response.statusCode == 200) {} else {
                            logger.error(error)
                        }
                    })
                    warn_count++
                } else {
                    chainx_best = last
                    if (warn_count > 0)
                        warn_count--
                }
            } catch (e) {
                logger.error(e)
                await substrate.runtimeUp
                continue
            }
            if (warn_count > 5) {
                process.exit(1)
            }
            await sleep(30000)
        }

    } catch (e) {
        logger.error(e)
    }
})()