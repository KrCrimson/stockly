const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Obtener todas las categorías
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Obtener categorías activas
// @route   GET /api/categories/active
// @access  Public
const getActiveCategories = asyncHandler(async (req, res) => {
  const categories = await Category.getActiveCategories();
  
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Obtener una categoría por ID
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Categoría no encontrada'
    });
  }
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Crear nueva categoría
// @route   POST /api/categories
// @access  Public
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Categoría creada exitosamente',
    data: category
  });
});

// @desc    Actualizar categoría
// @route   PUT /api/categories/:id
// @access  Public
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Categoría no encontrada'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Categoría actualizada exitosamente',
    data: category
  });
});

// @desc    Eliminar categoría
// @route   DELETE /api/categories/:id
// @access  Public
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Categoría no encontrada'
    });
  }
  
  // En lugar de eliminar, desactivar
  category.isActive = false;
  await category.save();
  
  res.status(200).json({
    success: true,
    message: 'Categoría desactivada exitosamente'
  });
});

module.exports = {
  getCategories,
  getActiveCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};