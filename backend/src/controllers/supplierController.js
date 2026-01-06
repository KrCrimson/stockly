const Supplier = require('../models/Supplier');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Obtener todos los proveedores
// @route   GET /api/suppliers
// @access  Public
const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().sort({ name: 1 });
  
  res.status(200).json({
    success: true,
    count: suppliers.length,
    data: suppliers
  });
});

// @desc    Obtener proveedores activos
// @route   GET /api/suppliers/active
// @access  Public
const getActiveSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.getActiveSuppliers();
  
  res.status(200).json({
    success: true,
    count: suppliers.length,
    data: suppliers
  });
});

// @desc    Obtener un proveedor por ID
// @route   GET /api/suppliers/:id
// @access  Public
const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  
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
// @access  Public
const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Proveedor creado exitosamente',
    data: supplier
  });
});

// @desc    Actualizar proveedor
// @route   PUT /api/suppliers/:id
// @access  Public
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
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
// @access  Public
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  
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