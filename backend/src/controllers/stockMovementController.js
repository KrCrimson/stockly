const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Obtener todos los movimientos de stock
// @route   GET /api/stock-movements
// @access  Private
const getStockMovements = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  const filter = { isReversed: false, user: req.user._id };
  
  // Filtros
  if (req.query.product) {
    filter.product = req.query.product;
  }
  
  if (req.query.type) {
    filter.type = req.query.type;
  }
  
  if (req.query.reason) {
    filter.reason = req.query.reason;
  }
  
  if (req.query.warehouse) {
    filter.warehouse = req.query.warehouse;
  }
  
  if (req.query.dateFrom || req.query.dateTo) {
    filter.createdAt = {};
    if (req.query.dateFrom) {
      filter.createdAt.$gte = new Date(req.query.dateFrom);
    }
    if (req.query.dateTo) {
      filter.createdAt.$lte = new Date(req.query.dateTo);
    }
  }
  
  const movements = await StockMovement.find(filter)
    .populate('product', 'name sku category unitPrice')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await StockMovement.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: movements.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: movements
  });
});

// @desc    Obtener movimiento por ID
// @route   GET /api/stock-movements/:id
// @access  Private
const getStockMovement = asyncHandler(async (req, res) => {
  const movement = await StockMovement.findOne({ _id: req.params.id, user: req.user._id })
    .populate('product', 'name sku category unitPrice');
  
  if (!movement) {
    return res.status(404).json({
      success: false,
      message: 'Movimiento de stock no encontrado'
    });
  }
  
  res.status(200).json({
    success: true,
    data: movement
  });
});

// @desc    Crear movimiento de stock
// @route   POST /api/stock-movements
// @access  Private
const createStockMovement = asyncHandler(async (req, res) => {
  const { product: productId, type, quantity, reason, ...otherData } = req.body;
  
  // Verificar que el producto existe y pertenece al usuario
  const product = await Product.findOne({ _id: productId, user: req.user._id });
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }
  
  // Verificar stock suficiente para movimientos de salida
  if ((type === 'OUT' || type === 'TRANSFER') && product.currentStock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Stock insuficiente. Stock actual: ${product.currentStock}, Cantidad solicitada: ${quantity}`
    });
  }
  
  const previousStock = product.currentStock;
  let newStock;
  
  // Calcular nuevo stock basado en el tipo de movimiento
  switch (type) {
    case 'IN':
    case 'TRANSFER':
      newStock = previousStock + quantity;
      break;
    case 'OUT':
      newStock = previousStock - quantity;
      break;
    case 'ADJUSTMENT':
      // Para ajustes, la cantidad representa el nuevo stock total
      newStock = quantity;
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Tipo de movimiento no válido'
      });
  }
  
  // Crear el movimiento
  const movement = await StockMovement.create({
    product: productId,
    type,
    quantity: type === 'ADJUSTMENT' ? Math.abs(newStock - previousStock) : quantity,
    reason,
    previousStock,
    newStock,
    user: req.user._id,
    ...otherData
  });
  
  // Actualizar stock del producto
  await Product.findByIdAndUpdate(productId, { 
    currentStock: newStock,
    lastRestockDate: ['IN', 'TRANSFER'].includes(type) ? new Date() : undefined
  });
  
  // Poblar los datos del producto en la respuesta
  await movement.populate('product', 'name sku category unitPrice');
  
  res.status(201).json({
    success: true,
    message: 'Movimiento de stock creado exitosamente',
    data: movement
  });
});

// @desc    Reversar movimiento de stock
// @route   POST /api/stock-movements/:id/reverse
// @access  Private
const reverseStockMovement = asyncHandler(async (req, res) => {
  const { performedBy, notes } = req.body;
  
  if (!performedBy) {
    return res.status(400).json({
      success: false,
      message: 'El usuario que realiza la reversión es obligatorio'
    });
  }
  
  const movement = await StockMovement.findOne({ _id: req.params.id, user: req.user._id });
  
  if (!movement) {
    return res.status(404).json({
      success: false,
      message: 'Movimiento de stock no encontrado'
    });
  }
  
  try {
    const reversalMovement = await movement.reverse(performedBy, notes || 'Reversión de movimiento');
    
    res.status(200).json({
      success: true,
      message: 'Movimiento reversado exitosamente',
      data: {
        originalMovement: movement,
        reversalMovement
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Obtener historial de movimientos de un producto
// @route   GET /api/stock-movements/product/:productId/history
// @access  Public
const getProductMovementHistory = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const limit = parseInt(req.query.limit, 10) || 50;
  
  const movements = await StockMovement.getProductMovements(productId, limit);
  
  res.status(200).json({
    success: true,
    count: movements.length,
    data: movements
  });
});

// @desc    Obtener estadísticas de movimientos
// @route   GET /api/stock-movements/stats
// @access  Public
const getMovementStats = asyncHandler(async (req, res) => {
  const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : new Date();
  const productId = req.query.productId || null;
  
  const stats = await StockMovement.getMovementStats(dateFrom, dateTo, productId);
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = {
  getStockMovements,
  getStockMovement,
  createStockMovement,
  reverseStockMovement,
  getProductMovementHistory,
  getMovementStats
};