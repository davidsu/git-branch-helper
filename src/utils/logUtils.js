/**
 * Created by davidsu on 04/12/2015.
 */
var chalk = require('chalk');
var _ = require('lodash');

var log = console.log;

function logStatus(statusObj) {
    log(statusObj);
    var res = _.chain([
        chalk.yellow(statusObj.not_added.join('\n')),
        chalk.red(statusObj.deleted.join('\n')),
        chalk.cyan(statusObj.modified.join('\n')),
        chalk.green(statusObj.created.join('\n'))
    ])
        .filter((str)=>str.length !== 0)
        .value();
    log(chalk.yellow('NOT_ADDED ') + chalk.red('DELETED ') + chalk.cyan('MODIFIED ') + chalk.green('CREATED\n'));
    _.forEach(res, (str)=>log(str));
    return statusObj;
}

module.exports = console.log;
module.exports.status = logStatus;
module.exports.err = (err)=>log(chalk.red(err));
module.exports.task = (msg)=>log(chalk.underline('\n'+msg));
module.exports.info = (msg)=>log(chalk.cyan(msg));
module.exports.greenLog = (msg)=>log(chalk.green(msg));
