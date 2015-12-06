/**
 * Created by davidsu on 04/12/2015.
 */
//inspired in grunt file.js
var fs = require('fs');
var path = require('path');
var pathSeparatorRe = /[\/\\]/g;
var errLog = require('./logUtils').errLog;
var log = require('./logUtils').log;
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
}