var config = require('./config');
const request = require('request');
var logger = config.logger();


function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(' enough sleep~');
        }, time);
    })
}

function post(opts) {
    return new Promise((resolve, reject) => {
        request.post(opts, function (err, response, body) {
            //console.log('返回结果：', err, body);
            if (!err && response.statusCode == 200) {
                if (body !== 'null') {
                    // results=JSON.parse(body);
                    resolve(body);
                }
            }
            else{
                logger.error(err,body)
                reject();
            }
        });
    });
}

let ip_list = [{
        name: "xxx",
        url: 'http://x.x.x.x:xxx'
    }
];

let max_diff = 50;

(async function () {
    try {

        let warn_count = 0 //告警次数 超过5次自动退出
        let max = 0
        let last_max = 0
        let has_offline=false
        while (true) {
            has_offline=false
            for (var i = 0; i < ip_list.length; i++) {
                try {
                    var options = {
                        uri: ip_list[i].url,
                        method: 'POST',
                        json: {
                            "jsonrpc": "2.0",
                            "id": 1,
                            "method": "chain_getHeader",
                            "params": []
                        }
                    };
                    let header = await post(options);

                    let last = parseInt(header.result.number, 16)
                    logger.debug(ip_list[i].name, last)
                    ip_list[i].last = last

                    if (last > max) {
                        max = last
                    }
                } catch (e) {
                    logger.error(e)
                    let warn= ip_list[i].name+'掉线'
                    logger.error("告警", warn)
                    request('http://x.x.x.x:xxx/sms?message=' + encodeURI(warn) + '&pass=ChainX.org', function (error, response, body) {
                        if (!error && response.statusCode == 200) {} else {
                            logger.error(error)
                        }
                    })
                    has_offline=true
                    break;
                }
            }
            if( false == has_offline ){
                for (var i = 0; i < ip_list.length; i++) {
                    if (max > 0 && ip_list[i].last + max_diff < max) {
                        let warn = ip_list[i].name  + ip_list[i].last +'落后'
                        logger.error("告警", warn)
    
                        request('http://x.x.x.x:xxx/sms?message=' + encodeURI(warn) + '&pass=ChainX.org', function (error, response, body) {
                            if (!error && response.statusCode == 200) {} else {
                                logger.error(error)
                            }
                        })
    
                        warn_count++
                    } else if (warn_count > 0)
                        warn_count--
                }
            }
            

            if (warn_count > 20) {
                process.exit(1)
            }
            await sleep(60000)
        }

    } catch (e) {
        logger.error(e)
    }
})()