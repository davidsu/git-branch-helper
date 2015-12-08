/**
 * Created by davidsu on 04/12/2015.
 */
process.stdin.setEncoding('utf8');
var util = require('util');
var gitUtils = require('./gitUtils');
var params = require('./params');
var chalk = require('chalk');
var resolvePromise;

process.stdin.on('data', (text)=> {
    resolvePromise(text);
});

function question(q){
    process.stdout.write(chalk.yellow(q )+ ' ');
    return new Promise((resolve)=> {
        resolvePromise = resolve;
    });
}


module.exports.branch = ()=> {
    var currBranch;
    return gitUtils.currBranch(true)
        .then((currBranchResponse)=> { currBranch = currBranchResponse; })
        .then(()=>question('select branch: '))
        .then((b)=> {
            params.setBranch(b.trim());
            return{
                currBranch: currBranch,
                selectedBranch: b
            };
        })
};
module.exports.question = question;

module.exports.end = ()=> {
    process.stdin.pause();
};


