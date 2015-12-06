/**
 * Created by davidsu on 04/12/2015.
 */
var _ = require('lodash-node');
var chalk = require('chalk');
var prompt = require('./prompt');
var flags = require('./flags');
var exec = require('child_process').exec;
var log = require('./logUtils');

function run(cmd) {
    log.task('gitUtils.run ===>  ' + cmd);
    return new Promise((resolve, reject)=> {
        exec(cmd, (err, stdout, stderr)=> {
            err && reject({
                err: err
                , stderr: stderr
                , stdin: stdout
            });
            resolve(stdout);
        });
    });
}
function merge() {
    log.task('merging');
    return run('git merge master')
        .catch((rejectObj)=> {
            if (rejectObj.stdin.indexOf('Automatic merge failed; fix conflicts and then commit the result.') !== -1) {
                log(chalk.underline('merge rejected, reseting'));
                return run('git reset --hard')
                    .then(()=> { throw rejectObj; });
            }
            throw rejectObj;
        });
}
function parseStatus(status) {
    log.task('gitUtils.parseStatus');
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
}

function commit(msg, isRecursing) {
    !isRecursing && log.task('commit');
    if (!msg) {
        return run('git log --format=%B -1')
            .then((stdout)=> {log.info('last commit:\n' + stdout);})
            .then(()=>prompt.question('commit message:\n'))
            .then((cmsg)=> {
                commit(cmsg, true);
            })
    }
    return run('git add . && git commit -m"' + msg + '"');
}

function currBranch(showAll) {
    return run('git branch')
        .then((stdin)=> {
            var currBranchName = null;
            _.forEach(stdin.split('\n'), (branch)=> {
                if (branch[0] === '*') {
                    currBranchName = branch.substring(1).trim();
                }
                (flags.shouldLog || showAll) && log(branch.trim());

            });
            if (currBranchName) {
                throw 'can\'t find current branch, are you in a git repo folder?'
            }
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
    return run('git checkout ' + branchName);
}


module.exports.simpleCommit = ()=>commit('.');
module.exports.commit = commit;
module.exports.currBranch = currBranch;
module.exports.checkout = checkout;
module.exports.merge = merge;
module.exports.run = run;
module.exports.parseStatus = parseStatus;
