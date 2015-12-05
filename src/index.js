#!/usr/bin/env node

var chalk = require('chalk');
var _ = require('lodash-node');
var fsUtils = require('./utils/fsUtils');
var gitUtils = require('./utils/gitUtils');
var flags = require('./utils/flags');

var log = console.log;
var logErr = (err)=>log(chalk.red(err));
var logUnderline = (msg)=>log(chalk.underline(msg));
var shouldLog, skipMerge;


var exec = require('child_process').exec;

var prompt = require('./utils/prompt.js');
function toMaster() {
    logUnderline('tomaster');
    var transferFilesToMaster = (files)=> {
        shouldLog && console.log('checking out');
        return new Promise((resolve, reject)=> {
            exec('git checkout master', (err, stdout, stderr)=> {
                if (err) {
                    reject(err, stderr);
                }
                _.forEach(files.add, (_file)=>fsUtils.copy('tmp/' + _file, _file));
                exec('rm -rf tmp');
                _.forEach(files.del, (file)=>exec('rm ' + file));
                resolve();
            });
        });

    };
    var prepareFiles = (files)=> {
        _.forEach(files.add, (_file)=>fsUtils.copy(_file, 'tmp/' + _file));
    };

    var promis = (skipMerge && diff()) || merge().then(diff, defaultReject);
    return promis.then((files)=> {
        prepareFiles(files);
        transferFilesToMaster(files);
    }, defaultReject);
}
//a
function status() {
    logUnderline('status');
    return new Promise((resolve, reject)=> {
        exec("git status --porcelain", (error, stdout, stderr)=> {
            error && reject(chalk.red(error, stderr));
            resolve(stdout);
        });
    })
        .then(gitUtils.parseStatus)
        .then((statusObj)=> {
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

        });

}
//b

function merge() {
    shouldLog && log(chalk.underline('merging'));
    return new Promise((resolve, reject)=> {
        exec('git merge master', (err, stdin, stderr)=> {
            if (err && stdin.indexOf('Automatic merge failed; fix conflicts and then commit the result.') !== -1) {
                exec('git reset --hard');
                reject(err, stderr);
            } else if (err) {
                reject(err, stderr);
            }
            resolve();
        });
    });


}

function diff() {

    shouldLog && log('diffing');
    return new Promise((resolve, reject)=> {
        exec("git diff master --name-status", (error, stdout, stderr)=> {
            if (error) {
                reject('diff rejected: ' + stderr);
            }
            var res = {
                A: [],
                C: [],
                D: [],
                M: []
            };

            _.forEach(stdout.split('\n'), (input)=> {
                if (!res[input[0]]) {
                    input[0] && log(input[0]);
                } else {
                    res[input[0]].push(input.substring(2).trim());
                }
            });
            console.log(res);
            res.add = res.M.concat(res.C).concat(res.A);
            res.del = res.D;
            resolve(res);
        });
    });
}





function setFlags(flagsArg) {
    Log = flags.shouldLog = _.contains(flagsArg, '--log');
    skipMerge = flags.skipMerge = _.contains(flagsArg, '--skipMerge')
}

function defaultReject(err, stderr) {
    err && logErr(err);
    stderr && logErr(stderr);
    process.exit(1);
}

var cmds = {
    status: status,
    diff: diff,
    toMaster: toMaster,
    checkout: gitUtils.checkout,
    merge: merge,
    simpleCommit: gitUtils.simpleCommit,
    commit: gitUtils.commit
};

var tmp = {
    currBranch: gitUtils.currBranch,
    currbranch: gitUtils.currBranch
};

var shortCuts = {
    cob: cmds.checkoutBranch,
    checkoutbranch: cmds.checkoutBranch,
    tomaster: cmds.toMaster,
    simplecommit: cmds.simpleCommit
};
_.assign(cmds, shortCuts, tmp);

function performCmdsInOrder(userArgs) {
    setFlags(_.chain(userArgs)
            .filter((arg)=>_.startsWith(arg, '--'))
            .map((arg)=>arg.toLowerCase())
            .value()
    );
    var cmdNames = _.filter(userArgs, (arg)=>!_.startsWith(arg, '--'));
    var cmd, promise = cmds[cmdNames.shift()]();
    while ((cmd = cmdNames.shift())) {
        promise = promise.then(cmds[cmd], defaultReject);
    }
    promise.then(prompt.end, defaultReject);
}
//console.log(process.argv);
//process.exit(0);
performCmdsInOrder(process.argv.slice(2));


