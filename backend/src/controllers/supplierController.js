const Supplier = require('../models/Supplier');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Obtener todos los proveedores
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({ user: req.user._id }).sort({ name: 1 });
  
  res.status(200).json({
    success: true,
    count: suppliers.length,
    data: suppliers
  });
});

// @desc    Obtener proveedores activos
// @route   GET /api/suppliers/active
// @access  Private
const getActiveSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.getActiveSuppliers(req.user._id);
  
  res.status(200).json({
    success: true,
    count: suppliers.length,
    data: suppliers
  });
});

// @desc    Obtener un proveedor por ID
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ _id: req.params.id, user: req.user._id });
  
  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Proveedor no encontrado'
    });
  }
  
  res.status(200).json({
    success: true,
    data: supplier
  });
});

// @desc    Crear nuevo proveedor
// @route   POST /api/suppliers
// @access  Private
const createSupplier = asyncHandler(async (req, res) => {
  const supplierData = {
    ...req.body,
    user: req.user._id
  };
  
  const supplier = await Supplier.create(supplierData);
  
  res.status(201).json({
    success: true,
    message: 'Proveedor creado exitosamente',
    data: supplier
  });
});

// @desc    Actualizar proveedor
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Proveedor no encontrado'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Proveedor actualizado exitosamente',
    data: supplier
  });
});

// @desc    Eliminar proveedor
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({ _id: req.params.id, user: req.user._id });
  
  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Proveedor no encontrado'
    });
  }
  
  // En lugar de eliminar, desactivar
  supplier.isActive = false;
  await supplier.save();
  
  res.status(200).json({
    success: true,
    message: 'Proveedor desactivado exitosamente'
  });
});

module.exports = {
  getSuppliers,
  getActiveSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier
};