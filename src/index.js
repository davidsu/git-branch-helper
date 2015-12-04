#!/usr/bin/env node

var simpleGit = require('simple-git')(process.cwd);

var _ = require('lodash-node');
var grunt = require('grunt');

var userArgs = process.argv.slice(2);
var exec = require('child_process').exec;
var log = console.log;


function toMaster() {
    merge(true, ()=> {
        diff(true, (files)=> {
            _.forEach(files.add, (file)=>grunt.file.copy(file, 'tmp/' + file));
            exec('git checkout master', (err, stdout, stderr)=> {
                if (err) {
                    throw new Error(err);
                }
                _.forEach(files.add, (file)=>grunt.file.copy('tmp/' + file, file));
                exec('rm -rf tmp');
                _.forEach(files.del, (file)=>exec('rm ' + file));
            });

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
    exec('git merge master', (e, i, o)=> {
        !dontLog && console.log('error', e, '\n\n\nin', i, '\n\n\nout', o);
        if (e && i.indexOf('Automatic merge failed; fix conflicts and then commit the result.') !== -1) {
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
var cmds = {
    status: status,
    diff: diff,
    tomaster: toMaster,
    toMaster: toMaster,
    merge: merge
};

userArgs[0] && cmds[userArgs[0]]();
