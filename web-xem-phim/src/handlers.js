const { User, Film, Admin } = require('./models');

//User
function addUser(userData, callback) {
    const newUser = new User(userData);
    return newUser.save()
        .then(savedUser => {
            return savedUser;
        })
        .catch(error => {
            throw error;
        });
}

//Film
function addFilm(filmData, callback) {
    const newFilm = new Film(filmData);
    return newFilm.save()
        .then(savedFilm => {
            return savedFilm;
        })
        .catch(error => {
            throw error;
        });
}


//Admin
function addAdmin(adminData, callback) {
    const newAdmin = new Admin(adminData);
    return newAdmin.save()
    .then(savedAdmin => {
        return savedAdmin;
    })
    .catch(error => {
        throw error;
    });
}


module.exports = { addUser, addFilm, addAdmin};