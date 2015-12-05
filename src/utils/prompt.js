/**
 * Created by davidsu on 04/12/2015.
 */
process.stdin.setEncoding('utf8');
var util = require('util');
var resolvePromise;

process.stdin.on('data', (text)=>{
    console.log(text);
    resolvePromise(text);
});

module.exports.question = (question)=>{
    process.stdout.write(question+' ');
    return new Promise((resolve)=>{
        resolvePromise = resolve;
    });
};

module.exports.end = ()=>{
      process.stdin.pause();
};


