const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getStockMovements,
  getStockMovement,
  createStockMovement,
  reverseStockMovement,
  getProductMovementHistory,
  getMovementStats
} = require('../controllers/stockMovementController');
const { validateRequest, stockMovementSchemas } = require('../middleware/validation');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(protect);

// Rutas especiales
router.get('/stats', getMovementStats);
router.get('/product/:productId/history', getProductMovementHistory);

// Rutas CRUD básicas
router.route('/')
  .get(getStockMovements)
  .post(authorize('admin', 'manager', 'employee'), validateRequest(stockMovementSchemas.create), createStockMovement);

router.get('/:id', getStockMovement);

// Ruta para reversar movimiento
router.post('/:id/reverse', authorize('admin', 'manager'), reverseStockMovement);

module.exports = router;