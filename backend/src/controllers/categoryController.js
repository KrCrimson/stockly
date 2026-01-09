const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Obtener todas las categorías
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ user: req.user._id }).sort({ name: 1 });
  
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Obtener categorías activas
// @route   GET /api/categories/active
// @access  Private
const getActiveCategories = asyncHandler(async (req, res) => {
  const categories = await Category.getActiveCategories(req.user._id);
  
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Obtener una categoría por ID
// @route   GET /api/categories/:id
// @access  Private
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
  
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
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  const categoryData = {
    ...req.body,
    user: req.user._id
  };
  
  const category = await Category.create(categoryData);
  
  res.status(201).json({
    success: true,
    message: 'Categoría creada exitosamente',
    data: category
  });
});

// @desc    Actualizar categoría
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
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
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
  
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