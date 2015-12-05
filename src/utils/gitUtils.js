/**
 * Created by davidsu on 04/12/2015.
 */
var _ = require('lodash-node');
var chalk = require('chalk');
var prompt = require('./prompt');
var flags = require('./flags');
var exec = require('child_process').exec;
var log = console.log;
var logErr = (err)=>log(chalk.red(err));
var logUnderline = (msg)=>log(chalk.underline(msg));

function _run(cmd) {
    return new Promise((resolve, reject)=> {
        exec(cmd, (err, stdin, stderr)=> {
            err && reject(err, stderr, stdin);
            resolve(stdin);
        })
    })
}
function parseStatus(status) {
    var line;
    var lines = status.trim().split('\n');

    var not_added = [];
    var deleted = [];
    var modified = [];
    var created = [];

    var whitespace = /\s+/;

    while (line = lines.shift()) {
        line = line.trim().split(whitespace);

        switch (line.shift()) {
            case "??":
                not_added.push(line.join());
                break;
            case "D":
                deleted.push(line.join());
                break;
            case "M":
                modified.push(line.join());
                break;
            case "A":
            case "AM":
                created.push(line.join());
                break;
        }
    }

    return {
        not_added: not_added,
        deleted: deleted,
        modified: modified,
        created: created
    };
};

function commit(msg, isRecursing) {
    !isRecursing && logUnderline('commit');
    if (!msg) {
        return prompt.question('commit message:\n')
            .then((cmsg)=> {
                commit(cmsg, true);
            })
    }
    return _run('git add . && git commit -m"' + msg + '"');
}

function currBranch(showAll) {
    return _run('git branch')
        .then((stdin)=> {
            var currBranchName = null;
            _.forEach(stdin.split('\n'), (branch)=> {
                if (branch[0] === '*') {
                    currBranchName = branch.substring(1).trim();
                }
                (flags.shouldLog || showAll) && log(branch.trim());

            });
            return currBranchName;
        });
}

function checkout(branchName, isRecursing) {
    !isRecursing && log(chalk.underline('checkout ' + branchName));
    if (!branchName) {
        return currBranch(true)
            .then(log(chalk.cyan.underline('no branch selected')))
            .then(()=>prompt.question(chalk.cyan.underline('choose branch to checkout:')))
            .then((bname)=>checkout(bname));
    }
    return _run('git checkout ' + branchName);
}

function merge() {
    log(chalk.underline('merging'));
    return _run('git merge master')
        .then(()=>{});
}

module.exports.simpleCommit = ()=>commit('.');
module.exports.commit = commit;
module.exports.currBranch = currBranch;
module.exports.checkout = checkout;
module.exports.merge = merge;
module.exports.parseStatus = parseStatus;
