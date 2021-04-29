const express = require('express');
const {
  welcomePage,
  getAllProductsList,
  getParticularProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');

const router = express.Router();

router.route('/').get(welcomePage);

router.route('/products').get(getAllProductsList)
router.route('/product').post(createProduct);

router
  .route('/product/:slug')
  .get(getParticularProduct)
  .patch(updateProduct)
  .delete(deleteProduct);

module.exports = router;
