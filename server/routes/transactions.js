const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET /api/v1/transactions
// Obtiene todas las transacciones ordenadas por fecha (más reciente primero)
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor',
    });
  }
});

// POST /api/v1/transactions
// Crea una nueva transacción
router.post('/', async (req, res) => {
  try {
    const { text, amount, category, date } = req.body;

    if (!text || typeof amount !== 'number' || !category) {
      return res.status(400).json({
        success: false,
        error:
          'Campos inválidos. Se requieren: text (string), amount (number), category (string).',
      });
    }

    const transaction = await Transaction.create({
      text,
      amount,
      category,
      // Permitimos que el cliente envíe fecha, si no, usamos el default del modelo
      ...(date && { date }),
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error al crear transacción:', error);

    // Manejo de errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error del servidor',
    });
  }
});

// DELETE /api/v1/transactions/:id
// Elimina una transacción por ID
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transacción no encontrada',
      });
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error al eliminar transacción:', error);

    // IDs inválidos de Mongo lanzan CastError
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error del servidor',
    });
  }
});

module.exports = router;

