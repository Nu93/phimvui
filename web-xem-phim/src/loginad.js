const {Admin} = require('./models');

function findAdmin(username, password, callback) {
    Admin.findOne({ username, password }, (error, username) => {
        callback(error, username);
    });
}

module.exports = findAdmin;