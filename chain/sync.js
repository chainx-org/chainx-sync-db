var fs = require('fs')
var config = require('../config');
var logger = config.logger(__dirname + "/chain.log");
const {
	chase_event
} = require('./handler_event');
const handler_block = require('./handler_block');
const substrate = require('oo7-substrate');
const chain = substrate.chain;
const db = config.db;

function sleep(time) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(' enough sleep~');
		}, time);
	})
}

(async function () {
	let height_path = __dirname + "/height.lock"

	let init = await substrate.runtimeUp
	var height = fs.readFileSync(height_path, 'utf8');
	height = parseInt(height)


	try {
		handler_block.finalized = await db.query(" select max(finalized) as finalized  from  status_chain ")
		handler_block.finalized = handler_block.finalized.rows[0].finalized
		logger.debug('sync finalized=', handler_block.finalized)
	} catch (e) {
		logger.error('finalized error ', handler_block.finalized)
		return 
	}
	handler_block.transactions = await db.query("select sum(num) from transaction_daily")
	handler_block.transactions = (handler_block.transactions.rows[0] && handler_block.transactions.rows[0].sum) ? parseInt(handler_block.transactions.rows[0].sum) : 0
	logger.debug('sync transactions=', handler_block.transactions)

	while (true) {
		try {
			let last = await chain.height
			if (height <= last) {
				var hash = await chain.hash(height);
				var header = await chain.header(hash);
				var block = await chain.block(hash);
				logger.debug('chase  block', height, hash);

				let block_tx = await handler_block.handle_block(hash, header, block);
				await chase_event(height, hash, block_tx)

				fs.writeFileSync(height_path, height)
				height++
			} else {
				await sleep(2000)
			}
		} catch (e) {
			logger.error(e)
			process.exit(1);
		}
	}


})()