const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getSuppliers,
  getActiveSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(protect);

// Rutas especiales
router.get('/active', getActiveSuppliers);

// Rutas CRUD básicas
router.route('/')
  .get(getSuppliers)
  .post(authorize('admin', 'manager'), createSupplier);

router.route('/:id')
  .get(getSupplier)
  .put(authorize('admin', 'manager'), updateSupplier)
  .delete(authorize('admin'), deleteSupplier);

module.exports = router;