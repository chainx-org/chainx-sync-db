/*
 *	路由器
 */

var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var crypto = require('crypto');
var Tokens = require('csrf');
var util = require("util");

var template = require('art-template');

var path = require('path');
var config = require('./config');

var logger = config.logger();


function getClientIp(req) {
	return req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
}

function route(handlers, response, request) {

	logger.debug('request:' + request.url);
	logger.debug("request ip:" + getClientIp(request));

	try {
		checkLogin(handlers, response, request);
	} catch (e) {
		logger.debug("router 异常：" + e);
	}


} //fun

function checkLogin(handlers, response, request) {
	var input = url.parse(request.url, true).query;
	//var cookies = helper.parseCookie(request.headers.cookie);
	var pathname = url.parse(request.url).pathname;
	logger.debug("path=" + pathname + ",request.url=" + request.url);

	try {
		if ('/' == pathname) { //首页
			handlers['/index'](response, request);
		} else if (typeof handlers[pathname] === 'function') {
			handlers[pathname](response, request);
		} else {
			var html = ''; //template(__dirname+'/html/404.html', {});
			response.writeHead(200, {
				"Content-Type": "text/html",
				'X-FRAME-OPTIONS': 'DENY',
				'Cache-Control': 'no-cache'
			});
			response.end(html);

		}

	} catch (e) {
		response.writeHead(200, {
			"Content-Type": "text/html",
			'X-FRAME-OPTIONS': 'DENY',
			'Cache-Control': 'no-cache'
		});
		response.end('');
		logger.error("Error!!!!" + e);
	}

} //fun


exports.route = route;
