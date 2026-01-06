const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El producto es obligatorio'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'El tipo de movimiento es obligatorio'],
    enum: {
      values: ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER'],
      message: 'El tipo debe ser IN, OUT, ADJUSTMENT o TRANSFER'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: [1, 'La cantidad debe ser mayor a 0']
  },
  reason: {
    type: String,
    required: [true, 'La razón del movimiento es obligatoria'],
    enum: {
      values: [
        'PURCHASE', 'SALE', 'RETURN', 'DAMAGED', 'EXPIRED', 
        'THEFT', 'INVENTORY_ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT'
      ],
      message: 'Razón de movimiento no válida'
    }
  },
  reference: {
    type: String,
    trim: true,
    maxlength: [100, 'La referencia no puede exceder 100 caracteres']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  },
  unitCost: {
    type: Number,
    min: [0, 'El costo unitario no puede ser negativo'],
    default: 0
  },
  totalCost: {
    type: Number,
    min: [0, 'El costo total no puede ser negativo'],
    default: 0
  },
  previousStock: {
    type: Number,
    required: [true, 'El stock anterior es obligatorio'],
    min: [0, 'El stock anterior no puede ser negativo']
  },
  newStock: {
    type: Number,
    required: [true, 'El nuevo stock es obligatorio'],
    min: [0, 'El nuevo stock no puede ser negativo']
  },
  performedBy: {
    type: String,
    required: [true, 'El usuario que realizó el movimiento es obligatorio'],
    trim: true,
    maxlength: [50, 'El usuario no puede exceder 50 caracteres']
  },
  warehouse: {
    type: String,
    trim: true,
    maxlength: [50, 'El almacén no puede exceder 50 caracteres'],
    default: 'MAIN'
  },
  batchNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'El número de lote no puede exceder 50 caracteres']
  },
  expirationDate: {
    type: Date
  },
  isReversed: {
    type: Boolean,
    default: false
  },
  reversalReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockMovement'
  }
}, {
  timestamps: true
});

// Índices
stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ reason: 1 });
stockMovementSchema.index({ createdAt: -1 });
stockMovementSchema.index({ performedBy: 1 });
stockMovementSchema.index({ warehouse: 1 });

// Virtual para calcular el costo total automáticamente
stockMovementSchema.virtual('calculatedTotalCost').get(function() {
  return this.quantity * this.unitCost;
});

// Middleware pre-save para calcular costos y validaciones
stockMovementSchema.pre('save', function(next) {
  // Calcular costo total si no está establecido
  if (this.unitCost && !this.totalCost) {
    this.totalCost = this.quantity * this.unitCost;
  }
  
  // Validar lógica de stock
  if (this.type === 'IN' || this.type === 'TRANSFER') {
    if (this.newStock !== this.previousStock + this.quantity) {
      return next(new Error('Cálculo de stock incorrecto para movimiento de entrada'));
    }
  } else if (this.type === 'OUT') {
    if (this.newStock !== this.previousStock - this.quantity) {
      return next(new Error('Cálculo de stock incorrecto para movimiento de salida'));
    }
  }
  
  next();
});

// Método estático para obtener movimientos por producto
stockMovementSchema.statics.getProductMovements = function(productId, limit = 50) {
  return this.find({ product: productId })
             .sort({ createdAt: -1 })
             .limit(limit)
             .populate('product', 'name sku');
};

// Método estático para obtener estadísticas de movimientos
stockMovementSchema.statics.getMovementStats = function(dateFrom, dateTo, productId = null) {
  const matchFilter = {
    createdAt: { $gte: dateFrom, $lte: dateTo },
    isReversed: false
  };
  
  if (productId) {
    matchFilter.product = mongoose.Types.ObjectId(productId);
  }
  
  return this.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          type: '$type',
          reason: '$reason'
        },
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalCost: { $sum: '$totalCost' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Método para reversar un movimiento
stockMovementSchema.methods.reverse = async function(performedBy, notes) {
  if (this.isReversed) {
    throw new Error('Este movimiento ya ha sido reversado');
  }
  
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.product);
  
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  
  // Crear movimiento de reversión
  const reversalType = this.type === 'IN' ? 'OUT' : 'IN';
  const reversalReason = this.type === 'IN' ? 'INVENTORY_ADJUSTMENT' : 'INVENTORY_ADJUSTMENT';
  
  const reversal = new this.constructor({
    product: this.product,
    type: reversalType,
    quantity: this.quantity,
    reason: reversalReason,
    reference: `REVERSAL-${this._id}`,
    notes: `Reversión: ${notes}`,
    previousStock: product.currentStock,
    newStock: reversalType === 'IN' ? 
      product.currentStock + this.quantity : 
      product.currentStock - this.quantity,
    performedBy: performedBy,
    warehouse: this.warehouse
  });
  
  // Actualizar stock del producto
  await product.updateStock(this.quantity, reversalType === 'IN' ? 'add' : 'subtract');
  
  // Marcar movimiento original como reversado
  this.isReversed = true;
  this.reversalReference = reversal._id;
  
  await Promise.all([this.save(), reversal.save()]);
  
  return reversal;
};

module.exports = mongoose.model('StockMovement', stockMovementSchema);