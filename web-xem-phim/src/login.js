const { User } = require('./models');

function findUser(username, password, callback) {
    User.findOne({ username, password }, (error, username) => {
        callback(error, username);
    });
}

module.exports = findUser;