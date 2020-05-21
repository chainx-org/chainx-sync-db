var path = require('path');
var config = require('./config');
var logger = config.logger();
const {
    Bussiness
} = require('./bussiness');
const request = require('request');

function register() {
    var options = {
        uri: config.state_url,
        method: 'POST',
        json: {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "deregister",
            "params": [
                'http://' + config.register_ip + ':' + config.listen_port + '/write'
            ]
        }
    };
    logger.debug('取消注册:' + JSON.stringify(options))
    request(options, (err, res, body) => {
        if (err) {
            return logger.error("Fail deregister" + err);
        }
        logger.debug(body)

        setTimeout(function () {
            var prefix = []
            for (var table in Bussiness) {
                if (Bussiness[table].get('prefix')) {
                    prefix.push(Bussiness[table].get('prefix'))
                }
            }

            var options = {
                uri: config.state_url,
                method: 'POST',
                json: {
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "register",
                    "params": [
                        prefix,
                        'http://' + config.register_ip + ':' + config.listen_port + '/write',
                        config.table_version.toString()
                    ]
                }
            };
            logger.debug('注册:' + JSON.stringify(options))
            request(options, (err, res, body) => {
                if (err) {
                    return logger.error("Fail register" + err);
                }
                logger.debug(body)
            });
        }, 10000)
    });

} //fun

exports.register = register;