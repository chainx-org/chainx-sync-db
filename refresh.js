var path = require('path');
var config = require('./config');
var logger = config.logger();
const {
    Bussiness
} = require('./bussiness');
const request = require('request');
const db = config.db;

function refresh() {

    var sql = '';
    for (var table in Bussiness) {
        if (Bussiness[table].get('table')) {
            sql += 'delete from ' + Bussiness[table].get('table') + ';';
        }
    }
    if (sql != '') {
        logger.debug(sql)
        db.query(sql, (err, res) => {
            if (err && err.code != 23505) {
                logger.error(sql, err)
                //throw err;
            }
        });
    }

} //fun

refresh()