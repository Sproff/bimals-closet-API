const Joi = require('joi');

// Validate new user account
const registerUserSchema = Joi.object({
  fullname: Joi.string().min(6).max(255).required(),
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string()
    .pattern(
      new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})')
    )
    .required(),
  confirm_password: Joi.ref('password'),
});

// Validate login access
const loginUserSchema = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().required(),
});

module.exports = {registerUserSchema, loginUserSchema};
