/**
 * Created by davidsu on 05/12/2015.
 */
var _ = require('lodash-node');
var flags = _.chain(process.argv)
    .filter((arg)=>_.startsWith(arg, '--'))
    .map((arg)=>arg.toLowerCase())
    .value();

module.exports.shouldLog = _.contains(flags, '--log');
module.exports.skipMerge = _.contains(flags, '--skip-merge');
