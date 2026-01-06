const express = require('express');
const {
  getDashboard,
  getTrends,
  getCustomReport
} = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', getDashboard);
router.get('/trends', getTrends);
router.post('/reports', getCustomReport);

module.exports = router;