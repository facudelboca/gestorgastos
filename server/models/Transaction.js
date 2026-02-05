const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'El texto es obligatorio'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', TransactionSchema);

