const Product = require('../models/product.model');
const slugify = require('slugify');
const { ErrorHandler } = require('../utils/errorHandler');

// Welcome
const welcomePage = (req, res, next) => {
  try {
    res.send(
      'Hey buddy! Feel free to create stuffs with this API. Try /products to get all products.'
    );
  } catch (error) {
    next(error);
  }
};

// Get the list of products
const getAllProductsList = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      status: 'success',
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a particular product
const getParticularProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });

    if (!product) throw new ErrorHandler(404, 'Product does not exist');

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Post/Create a particular product
const createProduct = async (req, res, next) => {
  try {
    const data = req.body;
    data.slug = slugify(data.name, { lower: true });
    const findProduct = await Product.findOne({ slug: data.slug });

    if (findProduct) throw new ErrorHandler(400, 'Product already exit!');

    const product = await Product.create(data);

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a particular product
const updateProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const data = req.body;

    const product = await Product.findOneAndUpdate({ slug }, data, {
      new: true,
    });

    if (!product) throw new ErrorHandler(404, 'Product does not exist');

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a particular product
const deleteProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOneAndDelete({ slug });

    if (!product) throw new ErrorHandler(404, 'Product does not exist');

    res.status(201).json({
      status: 'success',
      message: 'Product has been deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const searchProduct = async (req, res, next) => {
  try {
    const { q } = req.query;
    const products = await Product.find({ name: { $regex: q, $options: 'i' } });

    if (products.length < 1) throw new ErrorHandler(404, 'No product found');

    res.status(201).json({
      status: 'success',
      message: 'Product has been found successfully',
      products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  welcomePage,
  getAllProductsList,
  getParticularProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
};
