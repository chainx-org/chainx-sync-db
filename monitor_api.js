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
        let api_best = 0
        let warn_count = 0 //告警次数 超过5次自动退出
        while (true) {
            try {
                request('https://api.chainx.org.cn/chain/status?r=' + Math.random(), function (error, response, body) {
                    let warn = ''
                    if (!error && response.statusCode == 200) {
                        let data = JSON.parse(body)
                        logger.debug('api高度', api_best, data.best)
                        if (api_best > 0 && api_best >= data.best) {
                            warn = 'api数据掉线'
                        } else {
                            api_best = data.best
                            if (warn_count > 0)
                                warn_count--
                        }
                    } else {
                        warn = 'api超时'
                        logger.error(error)
                    }
                    if (warn) {
                        logger.error("告警", warn, api_best, data.best)
                        request('http://x.x.x.x:xxx/sms?message=' + encodeURI(warn) + '&pass=ChainX.org', function (error, response, body) {
                            if (!error && response.statusCode == 200) {} else {
                                logger.error(error)
                            }
                        })
                        warn_count++
                    }
                })

            } catch (e) {
                logger.error(e)
                await substrate.runtimeUp
                continue
            }
            await sleep(15000)
        }

    } catch (e) {
        logger.error(e)
    }
})()