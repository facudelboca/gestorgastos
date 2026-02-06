const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// GET /api/v1/transactions
// Obtiene las transacciones del usuario con filtros opcionales y paginación
// Query params: category, minAmount, maxAmount, searchText, startDate, endDate, sortBy, page, limit
router.get('/', async (req, res) => {
  try {
    const { category, minAmount, maxAmount, searchText, startDate, endDate, sortBy = 'date', page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Min 1, Max 100
    const skip = (pageNum - 1) * limitNum;

    // Construir filtro base (solo transacciones del usuario autenticado)
    let filter = { userId: req.user.userId };

    // Filtro por categoría (case-insensitive)
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    // Filtro por rango de montos
    if (minAmount !== undefined || maxAmount !== undefined) {
      filter.amount = {};
      if (minAmount !== undefined) {
        filter.amount.$gte = parseFloat(minAmount);
      }
      if (maxAmount !== undefined) {
        filter.amount.$lte = parseFloat(maxAmount);
      }
    }

    // Filtro por texto de búsqueda (en text y category)
    if (searchText) {
      filter.$or = [
        { text: { $regex: searchText, $options: 'i' } },
        { category: { $regex: searchText, $options: 'i' } },
      ];
    }

    // Filtro por rango de fechas
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Determinar ordenamiento
    let sortOption = {};
    if (sortBy === 'amount') {
      sortOption = { amount: -1 };
    } else if (sortBy === 'category') {
      sortOption = { category: 1 };
    } else {
      // Por defecto, ordena por fecha descendente
      sortOption = { date: -1 };
    }

    // Contar total de documentos que coinciden con el filtro
    const total = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email');

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      filters: {
        category,
        minAmount,
        maxAmount,
        searchText,
        startDate,
        endDate,
      },
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
// Crea una nueva transacción para el usuario autenticado
router.post('/', async (req, res) => {
  try {
    const { text, amount, category, date } = req.body;

    if (!text || typeof amount !== 'number' || !category) {
      return res.status(400).json({
        success: false,
        error: 'Campos inválidos. Se requieren: text (string), amount (number), category (string).',
      });
    }

    const transaction = await Transaction.create({
      userId: req.user.userId,
      text,
      amount,
      category,
      ...(date && { date }),
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error al crear transacción:', error);

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

// PUT /api/v1/transactions/:id
// Actualiza una transacción existente (solo si pertenece al usuario)
router.put('/:id', async (req, res) => {
  try {
    const { text, amount, category, date } = req.body;

    // Buscar la transacción y verificar que pertenece al usuario
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transacción no encontrada',
      });
    }

    // Verificar que la transacción pertenece al usuario autenticado
    if (transaction.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para editar esta transacción',
      });
    }

    // Actualizar solo los campos que se enviaron
    if (text !== undefined) transaction.text = text;
    if (amount !== undefined) transaction.amount = amount;
    if (category !== undefined) transaction.category = category;
    if (date !== undefined) transaction.date = date;

    await transaction.save();

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error al actualizar transacción:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
      });
    }

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
// Elimina una transacción (solo si pertenece al usuario)
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transacción no encontrada',
      });
    }

    // Verificar que la transacción pertenece al usuario autenticado
    if (transaction.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar esta transacción',
      });
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error al eliminar transacción:', error);

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

