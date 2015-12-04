/**
 * Created by davidsu on 04/12/2015.
 */
process.stdin.setEncoding('utf8');
var util = require('util');

var callback = function (text) {
    console.log('received data:', util.inspect(text));
};
process.stdin.on('data', (text)=>{
    console.log(text);
    callback(text);
});

module.exports.question = (question, cb)=>{
    console.log(question);
    callback = cb;
};

module.exports.end = ()=>{
      process.stdin.pause();
};


