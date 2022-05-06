const Joi = require('joi');

// Validate new user account
const registerUserSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    fullName: Joi.string().min(6).max(255).required().messages({
      'string.base': `"fullName" should be a type of text`,
      'string.empty': `"fullName" cannot be an empty field`,
      'string.min': `"fullName" should have a minimum of {#limit} characters`,
      'any.required': `"fullName" is a required field`,
    }),
    email: Joi.string().min(6).max(255).required().email().messages({
      'string.empty': `"email" cannot be an empty field`,
      'string.min': `"email" should have a minimum of {#limit} characters`,
      'any.required': `"email" is a required field`,
    }),
    phoneNumber: Joi.string()
      .length(13)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'string.empty': `"phoneNumber" cannot be an empty field`,
        'string.min': `"phoneNumber" should have a minimum of {#limit} characters`,
        'any.required': `"phoneNumber" is a required field`,
      }),
    password: Joi.string()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$'))
      .required()
      .messages({
        'string.base': `"password" should be a type of text`,
        'string.empty': `"password" cannot be an empty field`,
        'any.required': `"password" is a required field`,
        'string.pattern.base': `"password" should have a minimum of eight characters, at least one capital letter and one number`,
      }),

    confirm_password: Joi.ref('password'),
  });

// Validate login access
const loginUserSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    email: Joi.string().min(6).max(255).required().email().messages({
      'string.base': `"email" should be a type of text`,
      'string.empty': `"email" cannot be an empty field`,
      'string.min': `"email" should have a minimum of {#limit} characters`,
      'any.required': `"email" is a required field`,
    }),
    password: Joi.string()
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$'))
      .messages({
        'string.base': `"password" should be a type of text`,
        'string.empty': `"password" cannot be an empty field`,
        'any.required': `"password" is a required field`,
        'string.pattern.base': `"password" should have a minimum of eight characters, at least one capital letter and one number`,
      }),
  });

module.exports = { registerUserSchema, loginUserSchema };
