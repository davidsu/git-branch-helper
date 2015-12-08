/**
 * Created by davidsu on 06/12/2015.
 */

var _ = require('lodash');
var branch;
var params = _.chain(process.argv)
    .filter((arg)=>_.startsWith(arg, '-') && _.contains(arg, '='))
    .map((arg)=>{
        var i = _.startsWith(arg, '--')?2:1;
        return arg.toLowerCase().substring(i).split('=');
    })
    .zipObject()
    .value();

function setBranch(branchArg){
    branch = branchArg;
    return branchArg;
}
branch = params.b || params.branch;
module.exports.branch = branch;
module.exports.setBranch = setBranch;
module.exports.getBranch = function(){return branch;};

