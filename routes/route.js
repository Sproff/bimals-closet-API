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
  updateProduct,
  deleteProduct,
  searchProduct,
} = require('../controllers/product.controller');
const { isLoggedIn } = require('../middlewares/auth');

const router = express.Router();

router.route('/').get(welcomePage);

router.post('/order', isLoggedIn, createOrder);
router.get('/order', isLoggedIn, getMyOrders);
router.get('/order/:id', isLoggedIn, getParticularOrder);

router.route('/products').get(getAllProductsList).post(createProduct);

router.get('/products/search', searchProduct);

router
  .route('/product/:slug')
  .get(getParticularProduct)
  .patch(updateProduct)
  .delete(deleteProduct);

module.exports = router;
