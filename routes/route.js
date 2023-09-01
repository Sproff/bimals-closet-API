const express = require('express');
const {
  createOrder,
  getParticularOrder,
  getMyOrders,
} = require('../controllers/order.controller');
const {
  welcomePage,
  getAllProductsList,
  getParticularProduct,
  createProduct,
  // updateProduct,
  // deleteProduct,
  searchProduct,
} = require('../controllers/product.controller');
const { isLoggedIn } = require('../middlewares/auth');
const {
  addFavorite,
  removeFavorite,
  getMyFavoriteProducts,
} = require('../controllers/favorite.controller');

const router = express.Router();

router.route('/').get(welcomePage);

router.post('/order', isLoggedIn, createOrder);
router.get('/order', isLoggedIn, getMyOrders);
router.get('/order/:id', isLoggedIn, getParticularOrder);

router.route('/products').get(getAllProductsList);

router.get('/products/search', searchProduct);
router.get('/products/:slug', getParticularProduct);
router.post('/products', createProduct);

router.post('/favorite/add', addFavorite);
router.delete('/favorite/remove', removeFavorite);
router.get('/favorite/my-favorites', isLoggedIn, getMyFavoriteProducts);

// router
//   .route('/product/:slug')
//   .patch(updateProduct)
//   .delete(deleteProduct);

module.exports = router;
