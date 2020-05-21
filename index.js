/*
 *	入口
 */
var path = require('path');
var http = require("http");

var config = require("./config");
var router = require("./router");
var handlers = require("./handlers").handlers;
var {
	register
} = require("./register.js")

var logger = config.logger();

try {
	http.createServer(function (request, response) {
		router.route(handlers, response, request);
	}).listen(config.listen_port, config.listen_ip);
} catch (e) {
	logger.error("启动服务器异常e=" + e);
}
register();

logger.debug("Server has started." + " port:" + config.listen_port + ' ip:' + config.listen_ip);
