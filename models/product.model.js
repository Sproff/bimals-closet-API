const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
    },
    desc: {
      type: String,
      required: [true, "Field can't be blank"],
    },
    image: {
      type: [String],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
    },
    price: {
      type: Number,
      required: true,
    },
    isFavorite: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
