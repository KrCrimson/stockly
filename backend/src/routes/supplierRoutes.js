const express = require('express');
const {
  getSuppliers,
  getActiveSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

const router = express.Router();

// Rutas especiales
router.get('/active', getActiveSuppliers);

// Rutas CRUD básicas
router.route('/')
  .get(getSuppliers)
  .post(createSupplier);

router.route('/:id')
  .get(getSupplier)
  .put(updateSupplier)
  .delete(deleteSupplier);

module.exports = router;