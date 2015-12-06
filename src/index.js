#!/usr/bin/env node

var chalk = require('chalk');
var _ = require('lodash-node');
var fsUtils = require('./utils/fsUtils');
var gitUtils = require('./utils/gitUtils');
var flags = require('./utils/flags');
var defaultReject = require('./utils/promiseUtils').defaultReject;

var log = require('./utils/logUtils');
var shouldLog, skipMerge;

var exec = require('child_process').exec;

var prompt = require('./utils/prompt.js');
function toMaster() {
    log.task('tomaster');
    var transferFilesToMaster = (files)=> {
        flags.shouldLog && console.log('checking out');
        return gitUtils.run('git checkout master')
            .then(()=> {
                _.forEach(files.add, (_file)=>fsUtils.copy('tmp/' + _file, _file));
            })
            .then(()=> {
                exec('rm -rf tmp');
                _.forEach(files.del, (file)=>exec('rm ' + file));
            });

    };
    var prepareFiles = (files)=> {
        _.forEach(files.add, (_file)=>fsUtils.copy(_file, 'tmp/' + _file));
    };

    var promis = (flags.skipMerge && diff()) || gitUtils.merge().then(diff);
    return promis.then((files)=> {
        prepareFiles(files);
        return transferFilesToMaster(files);

    });
}

function status() {
    log.task('status');
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

function diff(dontLog) {
    log.task('diff');
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
            //todo log same as in status
            !dontLog && log.info(res);
            res.add = res.M.concat(res.C).concat(res.A);
            res.del = res.D;
            resolve(res);
        });
    });
}

var cmds = {
    status: status,
    diff: diff,
    toMaster: toMaster,
    checkout: gitUtils.checkout,
    merge: gitUtils.merge,
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
    var cmdNames = _.filter(userArgs, (arg)=>!_.startsWith(arg, '--'));
    var cmd, promise = cmds[cmdNames.shift()]();
    while ((cmd = cmdNames.shift())) {
        promise = promise.then(cmds[cmd]);
    }
    promise.then(prompt.end)
        .catch(defaultReject);
}
//console.log(process.argv);
//process.exit(0);
performCmdsInOrder(process.argv.slice(2));


