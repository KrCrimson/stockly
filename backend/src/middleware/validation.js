const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    console.log('🔍 Validando datos:', req.body);
    const { error } = schema.validate(req.body);
    if (error) {
      console.log('❌ Error de validación:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    console.log('✅ Validación exitosa');
    next();
  };
};

const productSchemas = {
  create: Joi.object({
    name: Joi.string().trim().max(100).required()
      .messages({
        'string.empty': 'El nombre es obligatorio',
        'string.max': 'El nombre no puede exceder 100 caracteres'
      }),
    description: Joi.string().trim().max(500).allow(''),
    sku: Joi.string().trim().max(50).optional()
      .messages({
        'string.max': 'El SKU no puede exceder 50 caracteres'
      }),
    category: Joi.string().trim().max(50).required()
      .messages({
        'string.empty': 'La categoría es obligatoria',
        'string.max': 'La categoría no puede exceder 50 caracteres'
      }),
    unitPrice: Joi.number().min(0).required()
      .messages({
        'number.min': 'El precio no puede ser negativo',
        'any.required': 'El precio unitario es obligatorio'
      }),
    currentStock: Joi.number().min(0).default(0),
    minStockLevel: Joi.number().min(0).default(0),
    maxStockLevel: Joi.number().min(0),
    supplier: Joi.object({
      name: Joi.string().trim().max(100).allow(''),
      contact: Joi.string().trim().max(100).allow('')
    }),
    tags: Joi.array().items(Joi.string().trim().max(30)),
    expirationDate: Joi.date().iso()
  }),

  update: Joi.object({
    name: Joi.string().trim().max(100),
    description: Joi.string().trim().max(500).allow(''),
    sku: Joi.string().trim().max(50),
    category: Joi.string().trim().max(50),
    unitPrice: Joi.number().min(0),
    minStockLevel: Joi.number().min(0),
    maxStockLevel: Joi.number().min(0),
    currentStock: Joi.number().min(0),
    supplier: Joi.object({
      name: Joi.string().trim().max(100).allow(''),
      contact: Joi.string().trim().max(100).allow('')
    }),
    tags: Joi.array().items(Joi.string().trim().max(30)),
    expirationDate: Joi.date().iso(),
    isActive: Joi.boolean()
  })
};

const stockMovementSchemas = {
  create: Joi.object({
    product: Joi.string().required()
      .messages({
        'string.empty': 'El ID del producto es obligatorio'
      }),
    type: Joi.string().valid('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER').required()
      .messages({
        'any.only': 'El tipo debe ser IN, OUT, ADJUSTMENT o TRANSFER'
      }),
    quantity: Joi.number().min(1).required()
      .messages({
        'number.min': 'La cantidad debe ser mayor a 0',
        'any.required': 'La cantidad es obligatoria'
      }),
    reason: Joi.string()
      .valid('PURCHASE', 'SALE', 'RETURN', 'DAMAGED', 'EXPIRED', 
             'THEFT', 'INVENTORY_ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT')
      .required(),
    reference: Joi.string().trim().max(100),
    notes: Joi.string().trim().max(500),
    unitCost: Joi.number().min(0),
    performedBy: Joi.string().trim().max(50).required()
      .messages({
        'string.empty': 'El usuario es obligatorio'
      }),
    warehouse: Joi.string().trim().max(50).default('MAIN'),
    batchNumber: Joi.string().trim().max(50),
    expirationDate: Joi.date().iso()
  })
};

module.exports = {
  validateRequest,
  productSchemas,
  stockMovementSchemas
};