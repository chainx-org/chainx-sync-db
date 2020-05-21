/*
 *	工具
 */

var config = require("./config");
var program = require('commander');
const substrate = require('oo7-substrate');
const {
  chase_event
} = require('./chain/handler_event');
const handler_block = require('./chain/handler_block');
var logger = config.logger();

substrate.setNodeUri(config.node.ws);

program
  .version('0.1.0')
  .option('-f, --height <n>', 'chase  block?', parseInt)
  .parse(process.argv);

if (program.height) {
  (async function () {
    await substrate.runtimeUp
    var hash = await substrate.chain.hash(program.height);
    var header = await substrate.chain.header(hash);
    var block = await substrate.chain.block(hash);
    logger.debug('chase  block', program.height, hash);

    let block_tx = await handler_block.handle_block(hash, header, block, false);
    await chase_event(program.height, hash, block_tx)
  })()

}
