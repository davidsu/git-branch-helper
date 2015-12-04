/**
 * Created by davidsu on 04/12/2015.
 */
var _ = require('lodash-node');
module.exports.parseStatus = (status) =>{
    var line;
    var lines = status.trim().split('\n');

    var not_added = [];
    var deleted = [];
    var modified = [];
    var created = [];

    var whitespace = /\s+/;

    while (line = lines.shift()) {
        line = line.trim().split(whitespace);

        switch (line.shift()) {
            case "??":
                not_added.push(line.join());
                break;
            case "D":
                deleted.push(line.join());
                break;
            case "M":
                modified.push(line.join());
                break;
            case "A":
            case "AM":
                created.push(line.join());
                break;
        }
    }

    return {
        not_added: not_added,
        deleted: deleted,
        modified: modified,
        created: created
    };
};
