const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Otros', 'Casa']
  },
  limit: {
    type: Number,
    required: true,
    min: 0
  },
  month: {
    type: String,
    required: true,
    // Formato: "2024-01"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Crear índice único para userId, category y month
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
