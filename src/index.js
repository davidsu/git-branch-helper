#!/usr/bin/env node

//var simpleGit = require('simple-git')(process.cwd);

var chalk = require('chalk');
var _ = require('lodash-node');
var file = require('./utils/file');

var log = console.log;
var errLog = (err)=>log(chalk.red(err));
var greenLog = (msg)=>log(chalk.green(msg));


var exec = require('child_process').exec;

var prompt = require('./utils/prompt.js');
function toMaster(cb) {
    var transferFilesToMaster = (files)=> {
        console.log('checking out');
        exec('git checkout master', (err, stdout, stderr)=> {
            if (err) {
                throw new Error(err);
            }
            _.forEach(files.add, (_file)=>file.copy('tmp/' + _file, _file));
            exec('rm -rf tmp');
            _.forEach(files.del, (file)=>exec('rm ' + file));
        });
    };
    var prepareFiles = (files)=> {
        _.forEach(files.add, (_file)=>file.copy(_file, 'tmp/' + _file));
    };


    merge(()=> {
        diff((files)=> {
            console.log('preparing');
            prepareFiles(files);
            transferFilesToMaster(files);
            cb();
        }, true)
    }, true);
}

function status(callback) {

    exec("git status", (error, stdout, stderr)=> {
        var resArr = stdout.match(/modified:[^\n]*/g);
        var res = {
            modified: _.map(resArr, (item)=> {
                return item.split('modified:')[1].trim();
            })
        };
        console.log(res);
        callback();
    });
}



function merge(callback, dontLog) {
    console.log('merging');
    exec('git merge master', (err, stdin, stderr)=> {
        !dontLog && console.log('error', err, '\n\n\nin', stdin, '\n\n\nout', stderr);
        if (err && stdin.indexOf('Automatic merge failed; fix conflicts and then commit the result.') !== -1) {
            exec('git reset --hard');
            throw new Error('unable to merge automatic');
        } else if (callback) {
            callback();
        }
    });

}

function diff(callback, dontLog) {
    log('diffing');
    exec("git diff master --name-status", (error, stdout, stderr)=> {
        if (error) {
            throw new Error(error);
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
        !dontLog && console.log(res);
        res.add = res.M.concat(res.C).concat(res.A);
        res.del = res.D;
        callback && callback(res);
    });
}


function checkoutBranch(){

}

function currBranch(callback){
    exec('git branch', (err,stdin,oer)=>{
        if(err){
            errLog(err);
            errLog(oer);
            return;
        }
        var cb;
        _.forEach(stdin.split('\n'), (branch)=>{
            if(branch[0]==='*'){
                cb = branch.substring(1).trim();
                greenLog(branch);
            } else{
                log(branch);
            }
        });
        callback && callback(cb);
    });
}

function commit(cb, msg){
    var gitcommit = (cmsg)=>{
        exec('git add . && git commit -m"'+cmsg+'"', (err, i, oerr)=>{
            if(err){
                errLog(err);
                errLog(oerr);
            }
            cb();
        })
    };

    if(!msg){
        prompt('commit message:\n', (cmsg)=>{
            gitcommit(cmsg);
        })
    }else{
        gitcommit(msg);
    }

}

var tmp = {
    currBranch: currBranch,
    currbranch: currBranch,
    simplecommit: (cb)=>{
        exec('git add . && git commit -m"."');
        cb();
    }
};

var shortCuts = {
    cob: checkoutBranch,
    checkoutbranch : checkoutBranch,
    tomaster: toMaster
};

var cmds = {
    status: status,
    diff: diff,
    toMaster: toMaster,
    checkoutBranch: checkoutBranch,
    merge: merge
};

_.assign(cmds, shortCuts, tmp);
function performCmdsInOrder(){
    var userArgs = process.argv.slice(2);
    var flags = _.filter(userArgs, (arg)=>_.startsWith(arg, '--'));
    var cmdNames = _.filter(userArgs, (arg)=>!_.startsWith(arg, '--'));
    var execArr = [];
    for(var i = cmdNames.length-1; i>=0; i--){
        var cmd = cmds[cmdNames[i+1]] || prompt.end;
        execArr.push(cmds[cmdNames[i]].bind(null, cmd));
    }
    execArr[execArr.length-1]();
}
performCmdsInOrder();


