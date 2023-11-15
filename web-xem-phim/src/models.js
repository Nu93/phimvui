const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    numberphone: String,
    email: String,
});

const filmSchema = new mongoose.Schema({
    movieTitle: String,
    movieDescription: String,
    linkfilm: String,
    thumbnail: Buffer,
});

const adminSchema = new mongoose.Schema({
    name: String,
    pass: String,
    email: String,
});

const User = mongoose.model('User', userSchema);
const Film = mongoose.model('Film', filmSchema);
const Admin = mongoose.model('Admin', adminSchema);

module.exports = { User, Film, Admin };