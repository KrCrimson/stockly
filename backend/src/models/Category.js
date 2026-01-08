const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  name: {
    type: String,
    required: [true, 'El nombre de la categoría es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'La descripción no puede exceder 200 caracteres']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    trim: true,
    default: '#3b82f6' // Color para la UI
  }
}, {
  timestamps: true
});

// Índices para optimización y unicidad por usuario
categorySchema.index({ user: 1, name: 1 }, { unique: true });
categorySchema.index({ user: 1, isActive: 1 });

// Método estático para obtener categorías activas por usuario
categorySchema.statics.getActiveCategories = function(userId) {
  return this.find({ user: userId, isActive: true }).sort({ name: 1 });
};

module.exports = mongoose.model('Category', categorySchema);