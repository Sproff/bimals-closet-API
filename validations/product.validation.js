const Joi = require("joi");

// Validate product
const productSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  desc: Joi.string().min(6).max(255).required(),
  image: Joi.object({
    id: Joi.string().required(),
    url: Joi.string().required(),
  }),
  price: Joi.number().required(),
});

module.exports = { productSchema };
