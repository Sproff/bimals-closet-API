const User = require('../models/user.model');
const {registerUserSchema, loginUserSchema} = require('../validations/user.validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {ErrorHandler} = require('../utils/errorHandler');

const createUser = async (req, res, next) => {
  try {
    // Validate data
    const data = req.body;
    const {error} = await registerUserSchema.validateAsync(data);
    if (error) throw new ErrorHandler(400, error.message);

    // Verify if email exist
    let user = await User.findOne({email: data.email});
    if (user) throw new ErrorHandler(400, 'Email already exists');

    data.email = data.email.toLowerCase();

    const salt = await bcrypt.genSalt(8);
    data.password = await bcrypt.hash(data.password, salt);

    // Save user to the DB
    user = await User.create(data);
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    next(new ErrorHandler(error.statusCode || 500, error.message));
  }
};

const loginUser = async (req, res, next) => {
  try {
    // Validate data
    const data = req.body;
    const {error} = await loginUserSchema.validateAsync(data);
    if (error) throw new ErrorHandler(400, error.message);

    // Verify email and password
    const user = await User.findOne({email: data.email.toLowerCase()});

    if (!user)
      throw new ErrorHandler(400, 'User not found, proceed to the signup page');

    const validatePassword = await bcrypt.compare(data.password, user.password);
    if (!validatePassword) throw new ErrorHandler(400, 'Incorrect password');

    // Generate token for access
    const token = jwt.sign({sub: user._id}, process.env.JWT_TOKEN, {
      expiresIn: '2h',
    });

    // user.token = token;
    // user.save();

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user,
        token
      },
    });
  } catch (error) {
    next(new ErrorHandler(error.statusCode || 500, error.message));
  }
};

module.exports = {createUser, loginUser};
