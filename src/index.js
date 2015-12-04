#!/usr/bin/env node

//var simpleGit = require('simple-git')(process.cwd);

var chalk = require('chalk');
var _ = require('lodash-node');
var grunt = require('grunt');

var log = console.log;
var errLog = (err)=>log(chalk.red(err));
var greenLog = (msg)=>log(chalk.green(msg));

var userArgs = process.argv.slice(2);
var exec = require('child_process').exec;


function toMaster() {
    var transferFilesToMaster = (files)=> {
        exec('git checkout master', (err, stdout, stderr)=> {
            if (err) {
                throw new Error(err);
            }
            _.forEach(files.add, (file)=>grunt.file.copy('tmp/' + file, file));
            exec('rm -rf tmp');
            _.forEach(files.del, (file)=>exec('rm ' + file));
        });
    };
    var prepareFiles = (files)=> {
        _.forEach(files.add, (file)=>grunt.file.copy(file, 'tmp/' + file));
    };


    merge(true, ()=> {
        diff(true, (files)=> {
            prepareFiles(files);
            transferFilesToMaster(files);
        })
    });
}

function status() {

    exec("git status", (error, stdout, stderr)=> {
        var resArr = stdout.match(/modified:[^\n]*/g);
        var res = {
            modified: _.map(resArr, (item)=> {
                return item.split('modified:')[1].trim();
            })
        };
        console.log(res);
    });
}



function merge(dontLog, callback) {
    exec('git merge master', (err, stdin, stderr)=> {
        !dontLog && console.log('error', err, '\n\n\nin', stdin, '\n\n\nout', stderr);
        if (err && stdin.indexOf('Automatic merge failed; fix conflicts and then commit the result.') !== -1) {
            exec('git reset --hard');
        } else if (callback) {
            callback();
        }
    });

}

function diff(dontLog, callback) {
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

var tmp = {
    currBranch: currBranch,
    currbranch: currBranch,
    simplecommit: ()=>exec('git add . && git commit -m"."')
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
_.forEach(userArgs, (arg)=>{
    cmds[arg]();
});
