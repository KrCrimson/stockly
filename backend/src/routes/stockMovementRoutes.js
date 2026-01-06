const express = require('express');
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

// Rutas especiales
router.get('/stats', getMovementStats);
router.get('/product/:productId/history', getProductMovementHistory);

// Rutas CRUD básicas
router.route('/')
  .get(getStockMovements)
  .post(validateRequest(stockMovementSchemas.create), createStockMovement);

router.get('/:id', getStockMovement);

// Ruta para reversar movimiento
router.post('/:id/reverse', reverseStockMovement);

module.exports = router;