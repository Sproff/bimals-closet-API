const Favorite = require('../models/favorite.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
// Add a product to a user's favorites
const addFavorite = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product) {
      return res.status(404).json({ error: 'User or product not found.' });
    }

    // Check if the favorite already exists
    const existingFavorite = await Favorite.findOne({
      user: userId,
      product: productId,
    });
    if (existingFavorite) {
      return res
        .status(400)
        .json({ error: 'Product is already in favorites.' });
    }

    // Create and save the favorite
    const favorite = new Favorite({ user: userId, product: productId });
    product.isFavorite = true;
    await product.save();
    await favorite.save();

    res.json({ message: 'Product added to favorites.' });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'An error occurred while adding the favorite.' });
  }
};

// Remove a product from a user's favorites
const removeFavorite = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product) {
      return res.status(404).json({ error: 'User or product not found.' });
    }

    // Find and delete the favorite
    await Favorite.findOneAndDelete({ user: userId, product: productId });
    product.isFavorite = false;
    await product.save();

    res.json({ message: 'Product removed from favorites.' });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'An error occurred while removing the favorite.' });
  }
};

const getMyFavoriteProducts = async (req, res) => {
  const userId = req.user._id;

  try {
    const favoriteProducts = await Favorite.find({ user: userId }).populate(
      'product'
    );

    res.json(favoriteProducts.map((fav) => fav.product));
  } catch (error) {
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving favorite products.' });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getMyFavoriteProducts,
};
