const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    default: 'expense',
    required: true,
  },
}, {
  timestamps: true,
});

// único por usuario
CategorySchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
