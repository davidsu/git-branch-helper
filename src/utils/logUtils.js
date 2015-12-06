/**
 * Created by davidsu on 04/12/2015.
 */
var chalk = require('chalk');

var log = console.log;
module.exports = console.log;
module.exports.err = (err)=>log(chalk.red(err));
module.exports.task = (msg)=>log(chalk.underline('\n'+msg));
module.exports.info = (msg)=>log(chalk.blue(msg));
module.exports.greenLog = (msg)=>log(chalk.green(msg));
