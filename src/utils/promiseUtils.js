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
    rejectObj.err || rejectObj.stderr || log.warn('bad reject format\n'+rejectObj);
    process.exit(1);
}

module.exports.defaultReject = defaultReject;

