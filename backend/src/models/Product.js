const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  sku: {
    type: String,
    required: false, // Se generará automáticamente si no se proporciona
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'El SKU no puede exceder 50 caracteres']
  },
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    trim: true,
    maxlength: [50, 'La categoría no puede exceder 50 caracteres']
  },
  unitPrice: {
    type: Number,
    required: [true, 'El precio unitario es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  currentStock: {
    type: Number,
    required: [true, 'El stock actual es obligatorio'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  minStockLevel: {
    type: Number,
    required: [true, 'El nivel mínimo de stock es obligatorio'],
    min: [0, 'El nivel mínimo no puede ser negativo'],
    default: 0
  },
  maxStockLevel: {
    type: Number,
    min: [0, 'El nivel máximo no puede ser negativo']
  },
  supplier: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'El nombre del proveedor no puede exceder 100 caracteres']
    },
    contact: {
      type: String,
      trim: true,
      maxlength: [100, 'El contacto del proveedor no puede exceder 100 caracteres']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Los tags no pueden exceder 30 caracteres']
  }],
  lastRestockDate: {
    type: Date
  },
  expirationDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ currentStock: 1 });
productSchema.index({ isActive: 1 });

// Virtual para determinar si el stock está bajo
productSchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.minStockLevel;
});

// Virtual para determinar si el stock está alto
productSchema.virtual('isOverStock').get(function() {
  return this.maxStockLevel && this.currentStock >= this.maxStockLevel;
});

// Virtual para calcular el valor total del inventario
productSchema.virtual('totalValue').get(function() {
  return this.currentStock * this.unitPrice;
});

// Función para generar SKU automático
const generateSKU = async (category, name) => {
  // Buscar la categoría para obtener un prefijo más específico
  const Category = require('./Category');
  let prefix = 'PROD';
  
  try {
    const categoryDoc = await Category.findOne({ name: category });
    if (categoryDoc) {
      prefix = category.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
    }
  } catch (error) {
    // Si hay error, usar prefijo por defecto
  }
  
  const namePrefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const timestamp = Date.now().toString().slice(-4);
  
  return `${prefix}-${namePrefix}-${timestamp}`;
};

// Middleware pre-save para validaciones y SKU automático
productSchema.pre('save', async function(next) {
  // Generar SKU automático si no existe
  if (!this.sku && this.isNew) {
    let attempts = 0;
    let isUnique = false;
    
    while (!isUnique && attempts < 10) {
      this.sku = await generateSKU(this.category, this.name);
      const existingProduct = await this.constructor.findOne({ sku: this.sku });
      if (!existingProduct) {
        isUnique = true;
      } else {
        attempts++;
        // Agregar número aleatorio para mayor unicidad
        this.sku += Math.floor(Math.random() * 100).toString().padStart(2, '0');
      }
    }
    
    if (!isUnique) {
      return next(new Error('No se pudo generar un SKU único'));
    }
  }
  
  // Validación de niveles de stock
  if (this.maxStockLevel && this.minStockLevel >= this.maxStockLevel) {
    return next(new Error('El nivel mínimo debe ser menor al nivel máximo'));
  }
  
  next();
});

// Índices para optimización y unicidad por usuario
productSchema.index({ user: 1, sku: 1 }, { unique: true });
productSchema.index({ user: 1, name: 1 });
productSchema.index({ user: 1, category: 1 });
productSchema.index({ user: 1, isActive: 1 });

// Método estático para buscar productos con stock bajo por usuario
productSchema.statics.findLowStock = function(userId) {
  return this.find({
    user: userId,
    $expr: { $lte: ['$currentStock', '$minStockLevel'] },
    isActive: true
  });
};

// Método para actualizar el stock
productSchema.methods.updateStock = function(quantity, operation = 'add') {
  if (operation === 'add') {
    this.currentStock += quantity;
  } else if (operation === 'subtract') {
    if (this.currentStock < quantity) {
      throw new Error('Stock insuficiente');
    }
    this.currentStock -= quantity;
  } else if (operation === 'set') {
    this.currentStock = quantity;
  }
  
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);