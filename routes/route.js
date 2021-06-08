const express = require('express');
const {
  welcomePage,
  getAllProductsList,
  getParticularProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
} = require('../controllers/product.controller');

const router = express.Router();

router.route('/').get(welcomePage);

router.route('/products').get(getAllProductsList).post(createProduct);

router.get('/products/search', searchProduct);

router
  .route('/product/:slug')
  .get(getParticularProduct)
  .patch(updateProduct)
  .delete(deleteProduct);

module.exports = router;
