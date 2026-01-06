const express = require('express');
const { protect, authorize } = require('../middleware/auth');
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

// Aplicar autenticación a todas las rutas
router.use(protect);

// Rutas especiales (deben ir antes de las rutas con parámetros)
router.get('/low-stock', getLowStockProducts);
router.get('/categories', getCategories);
router.get('/suppliers', getSuppliers);

// Rutas CRUD básicas
router.route('/')
  .get(getProducts)
  .post(authorize('admin', 'manager'), validateRequest(productSchemas.create), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(authorize('admin', 'manager'), validateRequest(productSchemas.update), updateProduct)
  .delete(authorize('admin'), deleteProduct);

// Ruta para actualizar stock
router.patch('/:id/stock', authorize('admin', 'manager', 'employee'), updateStock);

module.exports = router;