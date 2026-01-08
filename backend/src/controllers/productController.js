const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  const filter = { user: req.user._id };
  
  // Filtros
  if (req.query.category) {
    filter.category = req.query.category;
  }
  
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }
  
  if (req.query.lowStock === 'true') {
    filter.$expr = { $lte: ['$currentStock', '$minStockLevel'] };
  }
  
  // Búsqueda por texto
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  
  const products = await Product.find(filter)
    .sort(req.query.sort ? { [req.query.sort]: req.query.order === 'desc' ? -1 : 1 } : { createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Product.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: products
  });
});

// @desc    Obtener producto por ID
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Crear nuevo producto
// @route   POST /api/products
// @access  Public
const createProduct = asyncHandler(async (req, res) => {
  const productData = {
    ...req.body,
    user: req.user._id
  };
  
  const product = await Product.create(productData);
  
  res.status(201).json({
    success: true,
    message: 'Producto creado exitosamente',
    data: product
  });
});

// @desc    Actualizar producto
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
  console.log('📝 Datos recibidos para actualización:', req.body);
  console.log('🔍 ID del producto:', req.params.id);
  
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Producto actualizado exitosamente',
    data: product
  });
});

// @desc    Eliminar producto
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }
  
  // Soft delete - marcar como inactivo
  product.isActive = false;
  await product.save();
  
  res.status(200).json({
    success: true,
    message: 'Producto eliminado exitosamente',
    data: {}
  });
});

// @desc    Actualizar stock de producto
// @route   PATCH /api/products/:id/stock
// @access  Public
const updateStock = asyncHandler(async (req, res) => {
  const { quantity, operation } = req.body;
  
  if (!quantity || !operation) {
    return res.status(400).json({
      success: false,
      message: 'Cantidad y operación son obligatorias'
    });
  }
  
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }
  
  try {
    await product.updateStock(quantity, operation);
    
    res.status(200).json({
      success: true,
      message: 'Stock actualizado exitosamente',
      data: product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Obtener productos con stock bajo
// @route   GET /api/products/low-stock
// @access  Public
const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.findLowStock();
  
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Obtener categorías disponibles
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.getActiveCategories();
  res.json({
    success: true,
    data: categories.map(cat => cat.name)
  });
});

// @desc    Obtener proveedores disponibles
// @route   GET /api/products/suppliers
// @access  Public
const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.getActiveSuppliers();
  res.json({
    success: true,
    data: suppliers.map(supplier => ({
      name: supplier.name,
      contact: supplier.primaryContact
    }))
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getCategories,
  getSuppliers
};