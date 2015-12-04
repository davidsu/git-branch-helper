/**
 * Created by davidsu on 04/12/2015.
 */
//inspired in grunt file.js
var fs = require('fs');
var path = require('path');
var pathSeparatorRe = /[\/\\]/g;
var errLog = require('./console').errLog;
var log = require('./console').log;
module.exports.copy = function (srcpath, destpath) {

    try{
        var contents=fs.readFileSync(String(srcpath));
        mkdir(path.dirname(destpath));
        fs.writeFileSync(destpath, contents);
    }catch(e){
        throw new Error(e);
    }
};

function exists () {
    var filepath = path.join.apply(path, arguments);
    return fs.existsSync(filepath);
}

function mkdir(dirpath) {
    dirpath.split(pathSeparatorRe).reduce(function(parts, part) {
        parts += part + '/';
        var subpath = path.resolve(parts);
        if (!exists(subpath)) {
            try {
                fs.mkdirSync(subpath);
            } catch(e) {
                throw new Error('Unable to create directory "' + subpath + '" (Error code: ' + e.code + ').', e);
            }
        }
        return parts;
    }, '');
};
//file.read = function (filepath) {
//    var contents;
//    log('Reading ' + filepath + '...');
//    try {
//        contents = fs.readFileSync(String(filepath));
//        return contents;
//    } catch (e) {
//        throw new Error(e);
//    }
//};
//file.write = function (filepath, contents) {
//    // Create path, if necessary.
//    file.mkdir(path.dirname(filepath));
//    try {
//        fs.writeFileSync(filepath, contents);
//        return true;
//    } catch (e) {
//        grunt.verbose.error();
//        throw grunt.util.error('Unable to write "' + filepath + '" file (Error code: ' + e.code + ').', e);
//    }
//};
//
//file.mkdir = function(dirpath) {
//    dirpath.split(pathSeparatorRe).reduce(function(parts, part) {
//        parts += part + '/';
//        var subpath = path.resolve(parts);
//        if (!file.exists(subpath)) {
//            try {
//                fs.mkdirSync(subpath);
//            } catch(e) {
//                throw new Error('Unable to create directory "' + subpath + '" (Error code: ' + e.code + ').', e);
//            }
//        }
//        return parts;
//    }, '');
//};