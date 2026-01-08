const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  name: {
    type: String,
    required: [true, 'El nombre del proveedor es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  contact: {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'El teléfono no puede exceder 20 caracteres']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'La dirección no puede exceder 200 caracteres']
    }
  },
  representative: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'El nombre del representante no puede exceder 100 caracteres']
    },
    position: {
      type: String,
      trim: true,
      maxlength: [50, 'El cargo no puede exceder 50 caracteres']
    }
  },
  paymentTerms: {
    type: String,
    trim: true,
    maxlength: [100, 'Los términos de pago no pueden exceder 100 caracteres']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  }
}, {
  timestamps: true
});

// Índices para optimización y unicidad por usuario
supplierSchema.index({ user: 1, name: 1 }, { unique: true });
supplierSchema.index({ user: 1, isActive: 1 });
supplierSchema.index({ user: 1, 'contact.email': 1 });

// Virtual para obtener contacto principal
supplierSchema.virtual('primaryContact').get(function() {
  return this.contact.email || this.contact.phone || 'Sin contacto';
});

// Método estático para obtener proveedores activos por usuario
supplierSchema.statics.getActiveSuppliers = function(userId) {
  return this.find({ user: userId, isActive: true }).sort({ name: 1 });
};

module.exports = mongoose.model('Supplier', supplierSchema);