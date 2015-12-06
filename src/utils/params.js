/**
 * Created by davidsu on 06/12/2015.
 */

var _ = require('lodash');
var params = _.chain(process.argv)
    .filter((arg)=>_.startsWith(arg, '-') && _.contains(arg, '='))
    .map((arg)=>{
        var i = _.startsWith(arg, '--')?2:1;
        return arg.toLowerCase().substring(i).split('=');
    })
    .zipObject()
    .value();

console.log('params', JSON.stringify(params));
module.exports.branch = params.b || params.branch;

