/**
 * Created by davidsu on 05/12/2015.
 */
var chalk = require('chalk');
var log = require('./logUtils');
function defaultReject(rejectObj) {
    log.task('defaultReject');
    rejectObj.err && log.err(rejectObj.err);
    rejectObj.stderr && log.info(chalk.cyan('STDERR'));
    rejectObj.stderr && log.err(rejectObj.stderr);
    process.exit(1);
}

module.exports.defaultReject = defaultReject;

