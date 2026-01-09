const express = require('express');
const { cleanDatabase, assignOrphanDataToUser } = require('../utils/cleanDatabase');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Limpiar datos huérfanos (sin usuario)
// @route   DELETE /api/admin/clean-orphan-data
// @access  Private
router.delete('/clean-orphan-data', protect, asyncHandler(async (req, res) => {
  const result = await cleanDatabase();
  
  res.status(200).json({
    success: true,
    message: 'Datos huérfanos eliminados exitosamente',
    data: result
  });
}));

// @desc    Asignar datos huérfanos a usuario actual
// @route   POST /api/admin/assign-orphan-data
// @access  Private
router.post('/assign-orphan-data', protect, asyncHandler(async (req, res) => {
  const result = await assignOrphanDataToUser(req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'Datos huérfanos asignados al usuario actual',
    data: result
  });
}));

module.exports = router;