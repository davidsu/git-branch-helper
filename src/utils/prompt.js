/**
 * Created by davidsu on 04/12/2015.
 */
process.stdin.setEncoding('utf8');
var util = require('util');
var gitUtils = require('./gitUtils');
var params = require('./params');
var chalk = require('chalk');
var promiseUtils = require('./promiseUtils');
var _ = require('lodash');
var resolvePromise;

process.stdin.on('data', (text)=> {
    resolvePromise(text);
});

function question(q) {
    process.stdout.write(chalk.yellow(q) + ' ');
    return new Promise((resolve)=> {
        resolvePromise = resolve;
    });
}

function branch(possibleBranchesList, currBranch) {
    if(!possibleBranchesList || !currBranch){
        console.log('nopossiblebranches');
        return gitUtils.getAllBranches(true)
        .then((branchesObj)=>branch(branchesObj.all, branchesObj.curr));
    }
    return question('select branch: ')
        .then((b)=> {
            b = b.trim();
            if(_.contains(possibleBranchesList, b)){
                possibleBranchesList = [b];
            }else {
                possibleBranchesList = _.filter(possibleBranchesList, (possibleBranch)=> _.startsWith(possibleBranch, b));
            }
            console.log(possibleBranchesList);
            if (possibleBranchesList.length === 1) {
                b = possibleBranchesList[0];
                params.setBranch(b);
                return {
                    currBranch: currBranch,
                    selectedBranch: b
                };
            }
            else if (possibleBranchesList.length === 0) {
                throw {
                    err: 'no known branch that starts with ' + b
                };
            }else {
                return branch(possibleBranchesList, true);
            }

        });
}
module.exports.branch = branch;
module.exports.question = question;

module.exports.end = ()=> {
    process.stdin.pause();
};


