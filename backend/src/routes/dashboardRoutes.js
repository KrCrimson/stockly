const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getDashboard,
  getTrends,
  getCustomReport
} = require('../controllers/dashboardController');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(protect);

router.get('/', getDashboard);
router.get('/trends', getTrends);
router.post('/reports', getCustomReport);

module.exports = router;