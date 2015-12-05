/**
 * Created by davidsu on 05/12/2015.
 */
var chalk = require('chalk');
function defaultReject(rejectObj) {
    rejectObj.err && log(chalk.red(rejectObj.err));
    rejectObj.stderr && logErr(rejectObj.stderr);
    process.exit(1);
}

