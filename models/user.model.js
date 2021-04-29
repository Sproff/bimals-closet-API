const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, 'fullname is required'],
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'password is required'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  token: {
    type: String,
  },
});

module.exports = mongoose.model('User', userSchema);
