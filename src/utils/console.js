/**
 * Created by davidsu on 04/12/2015.
 */
var chalk = require('chalk');

module.exports.log = console.log;
module.exports.errLog = (err)=>log(chalk.red(err));
module.exports.greenLog = (msg)=>log(chalk.green(msg));