const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Obtener dashboard principal
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const userId = req.user._id;
  
  // Estadísticas generales filtradas por usuario
  const [
    totalProducts,
    activeProducts,
    lowStockProducts,
    totalMovements,
    recentMovements,
    totalInventoryValue
  ] = await Promise.all([
    Product.countDocuments({ user: userId }),
    Product.countDocuments({ user: userId, isActive: true }),
    Product.countDocuments({
      user: userId,
      $expr: { $lte: ['$currentStock', '$minStockLevel'] },
      isActive: true
    }),
    StockMovement.countDocuments({ user: userId, isReversed: false }),
    StockMovement.countDocuments({
      user: userId,
      createdAt: { $gte: sevenDaysAgo },
      isReversed: false
    }),
    Product.aggregate([
      { $match: { user: userId, isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } }
        }
      }
    ])
  ]);
  
  // Movimientos por tipo (últimos 30 días)
  const movementsByType = await StockMovement.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: thirtyDaysAgo },
        isReversed: false
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }
    }
  ]);
  
  // Top productos por movimientos
  const topProductsByMovement = await StockMovement.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: thirtyDaysAgo },
        isReversed: false
      }
    },
    {
      $group: {
        _id: '$product',
        movementCount: { $sum: 1 },
        totalQuantityMoved: { $sum: '$quantity' }
      }
    },
    { $sort: { movementCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $match: {
        'product.user': userId
      }
    },
    {
      $project: {
        product: { $arrayElemAt: ['$product', 0] },
        movementCount: 1,
        totalQuantityMoved: 1
      }
    }
  ]);
  
  // Productos más valiosos
  const mostValuableProducts = await Product.aggregate([
    { $match: { user: userId, isActive: true, currentStock: { $gt: 0 } } },
    {
      $addFields: {
        totalValue: { $multiply: ['$currentStock', '$unitPrice'] }
      }
    },
    { $sort: { totalValue: -1 } },
    { $limit: 10 },
    {
      $project: {
        name: 1,
        sku: 1,
        currentStock: 1,
        unitPrice: 1,
        totalValue: 1
      }
    }
  ]);
  
  // Productos con stock crítico
  const criticalStockProducts = await Product.find({
    user: userId,
    $expr: { $lte: ['$currentStock', '$minStockLevel'] },
    isActive: true
  }).select('name sku currentStock minStockLevel category').limit(10);
  
  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        totalMovements,
        recentMovements,
        totalInventoryValue: totalInventoryValue[0]?.total || 0
      },
      charts: {
        movementsByType,
        topProductsByMovement,
        mostValuableProducts
      },
      alerts: {
        criticalStockProducts
      }
    }
  });
});

// @desc    Obtener análisis de tendencias
// @route   GET /api/dashboard/trends
// @access  Private
const getTrends = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const userId = req.user._id;
  
  // Tendencias de movimientos por día
  const movementTrends = await StockMovement.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startDate },
        isReversed: false
      }
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          type: '$type'
        },
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);
  
  // Evolución del valor del inventario
  const inventoryValueTrend = await StockMovement.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startDate },
        isReversed: false
      }
    },
    { $sort: { createdAt: 1 } },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productData'
      }
    },
    {
      $addFields: {
        valueChange: {
          $multiply: [
            '$quantity',
            { $arrayElemAt: ['$productData.unitPrice', 0] },
            { $cond: [{ $in: ['$type', ['IN', 'TRANSFER']] }, 1, -1] }
          ]
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        totalValueChange: { $sum: '$valueChange' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      movementTrends,
      inventoryValueTrend
    }
  });
});

// @desc    Obtener reportes personalizados
// @route   POST /api/dashboard/reports
// @access  Private
const getCustomReport = asyncHandler(async (req, res) => {
  const {
    reportType,
    dateFrom,
    dateTo,
    productIds,
    categories,
    warehouses
  } = req.body;
  
  const userId = req.user._id;
  
  const filter = {
    user: userId,
    createdAt: {
      $gte: dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: dateTo ? new Date(dateTo) : new Date()
    }
  };
  
  if (productIds && productIds.length > 0) {
    filter.product = { $in: productIds };
  }
  
  if (warehouses && warehouses.length > 0) {
    filter.warehouse = { $in: warehouses };
  }
  
  let reportData = {};
  
  switch (reportType) {
    case 'MOVEMENT_SUMMARY':
      reportData = await StockMovement.aggregate([
        { $match: { ...filter, isReversed: false } },
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'productData'
          }
        },
        {
          $match: categories && categories.length > 0 ? 
            { 'productData.category': { $in: categories } } : {}
        },
        {
          $group: {
            _id: {
              product: '$product',
              type: '$type'
            },
            totalQuantity: { $sum: '$quantity' },
            totalValue: { $sum: '$totalCost' },
            movementCount: { $sum: 1 },
            productInfo: { $first: { $arrayElemAt: ['$productData', 0] } }
          }
        }
      ]);
      break;
      
    case 'STOCK_VALUATION':
      reportData = await Product.aggregate([
        {
          $match: {
            user: userId,
            isActive: true,
            ...(categories && categories.length > 0 ? { category: { $in: categories } } : {})
          }
        },
        {
          $addFields: {
            totalValue: { $multiply: ['$currentStock', '$unitPrice'] }
          }
        },
        {
          $group: {
            _id: '$category',
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$currentStock' },
            totalValue: { $sum: '$totalValue' },
            lowStockCount: {
              $sum: {
                $cond: [{ $lte: ['$currentStock', '$minStockLevel'] }, 1, 0]
              }
            }
          }
        }
      ]);
      break;
      
    default:
      return res.status(400).json({
        success: false,
        message: 'Tipo de reporte no válido'
      });
  }
  
  res.status(200).json({
    success: true,
    reportType,
    period: {
      from: filter.createdAt.$gte,
      to: filter.createdAt.$lte
    },
    data: reportData
  });
});

module.exports = {
  getDashboard,
  getTrends,
  getCustomReport
};