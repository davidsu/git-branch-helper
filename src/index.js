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
        log.task('checking out');
        log.info(files.modified.concat(files.created));
        throw'';
        return gitUtils.run('git checkout master')
            .then(()=> {
                log.task('copying into master');
                log.info(files.modified.concat(files.created));
                _.forEach(files.modified.concat(files.created), (file)=>{
                    log('tmp/' + file, file);
                    fsUtils.copy('tmp/' + file, file)
                });
                throw '';
            })
            .then(()=> {
                log.task('deleting from master');
                exec('rm -rf tmp');
                _.forEach(files.deleted, (file)=>exec('rm ' + file));
            });

    };
    var prepareFiles = (files)=> {
        log.task('prepare files');
        _.forEach(files.modified.concat(files.created), (_file)=>fsUtils.copy(_file, 'tmp/' + _file));
    };

    return status()
        .then((statusObj)=> {
            log.task('verify no commit pending');
            //log.info(_.all(statusObj, (arr)=> arr.length === 0));
            //if (!_.all(statusObj, (arr)=> arr.length === 0)) {
            //    log.err('commit pending');
            //    throw {
            //        err: 'ERROR: commit your changes before transfering to master',
            //        stderr: JSON.stringify(statusObj, null, '\t')
            //    }
            //}
            return statusObj;
        })
        .then((flags.skipMerge && diff()) || gitUtils.merge().then(diff))
        .then((files)=> {
            log(files);
            prepareFiles(files);
            return transferFilesToMaster(files);

        });
}

function logStatus(statusObj) {
    log.task('log status');
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
    return statusObj;
}
function status() {
    log.task('status');
    return gitUtils.run("git status --porcelain")
        .then(gitUtils.parseStatus)
        .then(logStatus);
}

function diff() {
    log.task('diff');
    return gitUtils.run('git diff master --name-status')
        .then(gitUtils.parseStatus)
        .then(logStatus);
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
    promise.then(()=> {
        log.task('end');
        prompt.end()
    })
        .catch(defaultReject);
}
performCmdsInOrder(process.argv.slice(2));


