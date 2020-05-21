/*
 *	自动加载处理器
 */
var querystring = require("querystring");
var fs = require("fs");
var path = require('path');
var config = require('./config');

var logger = config.logger();


var handlers = {};

logger.debug("读取目录" + process.cwd());


var files = fs.readdirSync(process.cwd());

files.forEach(function (file) {
	var pathname = process.cwd() + '/' + file,
		stat = fs.lstatSync(pathname);
	if (!stat.isDirectory()) {
		if (file.match("handler_")) {
			logger.debug("加载处理器" + file);
			var handler = require('./' + file).handler;

			var name = "/" + file.replace("handler_", "").replace(".js", "");
			handlers[name] = handler;
		}

	} else {
		logger.debug("跳过目录" + file);
	}
});

for (var h in handlers) {
	logger.debug("成功加载处理器" + h);

}

exports.handlers = handlers;
