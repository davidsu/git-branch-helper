/**
 * Created by davidsu on 05/12/2015.
 */
var chalk = require('chalk');
var log = console.log;

module.exports = (str) =>{ log(str) };
module.exports.err = (str) => { log(chalk.red(str)); };
module.exports.info = (str) => { log(chalk.cyan(str)); };
module.exports.task = (str) => { log(chalk.underline(str)); };
module.exports.warn = (str) => { log(chalk.yellow(str)); };


