// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const userSchema = new Schema({
//     fullName: { type: String },
//     email: { type: String},
//     password: { type: String },
//     createdOn: { type: Date, default: new Date().getTime },
// });

// module.exports = mongoose.model("User", userSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    createdOn: { type: Date, default: Date.now } // Ensure it's defined as a Date
});

const User = mongoose.model('User', userSchema);
module.exports = mongoose.model("User", userSchema);