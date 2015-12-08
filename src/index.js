#!/usr/bin/env node
'use strict';

var chalk = require('chalk');
var _ = require('lodash');
var fsUtils = require('./utils/fsUtils');
var gitUtils = require('./utils/gitUtils');
var flags = require('./utils/flags');
var params = require('./utils/params');
var defaultReject = require('./utils/promiseUtils').defaultReject;
var exit = defaultReject;

var log = require('./utils/logUtils');
var shouldLog, skipMerge;

var exec = require('child_process').exec;
var prompt = require('./utils/prompt.js');

const TMP_FOLDER = process.env.HOME + '/.gbh/tmp/';
//comment
function toMaster() {
    return toBranch('master');
}


function toBranch(branch) {
    branch = branch || params.branch;
    log.task('tobranch: ' + branch);
    //!branch && exit({err: 'no branch specified'});
    var promise;
    if (branch) {
        promise = status();
    } else {
        var currBranch;
        promise = gitUtils.currBranch(true)
            .then((currBranchResponse)=>{ currBranch = currBranchResponse; })
            .then(()=>prompt.question('select branch: '))
            .then((branch)=> { return params.setBranch(branch) })
            .then((b)=> { branch = b })
            .then(()=>{
                if(currBranch === branch){
                    throw {
                        err: 'selected branch is same as current branch.\ncan\'t merge into self'
                    };
                }
            })
            .then(status);
    }
    return promise
        .then((statusObj)=> {
            log.task('verify no commit pending');
            if (!_.all(statusObj, (arr)=> arr.length === 0)) {
                log.err('commit pending');
                log.err('commit your changes before proceeding');
                return gitUtils.commit()
                    .then(status);
            }
            return statusObj;
        })
        .then(()=>(flags.skipMerge && diff(branch)) || gitUtils.merge(branch).then(()=>diff(branch)))
        .then((files)=> {
            prepareFiles(files);
            transferFilesToBranch(files, branch);

        });
}

function transferFilesToBranch(files, branch) {
    log.task('transfer files to branch ' + branch);
    branch = branch || params.branch;
    return gitUtils.run('git checkout ' + branch)
        .then(()=> {
            log.task('copying into ' + branch);
            log.info(files.modified.concat(files.created));
            _.forEach(files.modified.concat(files.created), (file)=> {
                fsUtils.copy(TMP_FOLDER + file, file)
            });
        })
        .then(()=> {
            log.task('deleting from master');
            exec('rm -rf ' + TMP_FOLDER);
            _.forEach(files.deleted, (file)=>exec('rm ' + file));
        });
}


function prepareFiles(files) {
    log.task('prepare files');
    _.forEach(files.modified.concat(files.created), (_file)=>fsUtils.copy(_file, TMP_FOLDER + _file));
}


function status() {
    log.task('status');
    return gitUtils.run("git status --porcelain")
        .then(gitUtils.parseStatus)
        .then(log.status);
}

function diff(branch) {
    log.task('diff');
    branch = branch || params.branch || 'master';
    return gitUtils.run('git diff ' + branch + ' --name-status')
        .then(gitUtils.parseStatus)
        .then(log.status);
}

var cmds = {
    status: status,
    diff: diff,
    toMaster: toMaster,
    toBranch: toBranch,
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
    simplecommit: cmds.simpleCommit,
    tobranch: toBranch
};
_.assign(cmds, shortCuts, tmp);

function performCmdsInOrder(userArgs) {
    var cmdNames = _.filter(userArgs, (arg)=>!_.startsWith(arg, '-'));
    var cmd = cmdNames.shift();
    var promise = (cmds[cmd] && cmds[cmd]()) || defaultReject({err: 'uknown cmd: ' + cmd});
    while ((cmd = cmdNames.shift())) {
        let cacheCmd = cmd;
        promise = promise.then(cmds[cmd] || (()=> {throw {err: 'uknown cmd: ' + cacheCmd}}));
    }
    promise.then(()=> {
        log.task('end');
        prompt.end()
    })
        .catch(defaultReject);
}
performCmdsInOrder(process.argv.slice(2));


