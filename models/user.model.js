const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'fullName is required'],
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
    },
    phoneNumber: {
      type: Number,
      required: [true, 'phoneNumber is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'password is required'],
    },
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
