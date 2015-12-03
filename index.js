#!/usr/bin/env node

var simpleGit = require('simple-git')(process.cwd);

var userArgs = process.argv.slice(2);

var cmds = {};
cmds.status = simpleGit.status((err, statusObj)=>{
    console.log(statusObj);
});
