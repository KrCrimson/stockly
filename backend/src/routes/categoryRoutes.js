const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getCategories,
  getActiveCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(protect);

// Rutas especiales
router.get('/active', getActiveCategories);

// Rutas CRUD básicas
router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/:id')
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;