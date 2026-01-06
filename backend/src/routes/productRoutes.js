const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getCategories,
  getSuppliers
} = require('../controllers/productController');
const { validateRequest, productSchemas } = require('../middleware/validation');

const router = express.Router();

// Rutas especiales (deben ir antes de las rutas con parámetros)
router.get('/low-stock', getLowStockProducts);
router.get('/categories', getCategories);
router.get('/suppliers', getSuppliers);

// Rutas CRUD básicas
router.route('/')
  .get(getProducts)
  .post(validateRequest(productSchemas.create), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(validateRequest(productSchemas.update), updateProduct)
  .delete(deleteProduct);

// Ruta para actualizar stock
router.patch('/:id/stock', updateStock);

module.exports = router;