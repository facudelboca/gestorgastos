const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const mongoose = require('mongoose');

// Obtener presupuestos del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { month } = req.query;
    // req.user is set by authMiddleware, and req.userId is also set for convenience
    // We use req.userId as established in middleware
    let query = { userId: req.userId };

    if (month) {
      query.month = month;
    }

    const budgets = await Budget.find(query).sort({ category: 1 });

    // Calcular gasto actual para cada presupuesto
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        // Calcular inicio del mes (UTC) y inicio del mes siguiente (exclusivo)
        const [yearStr, monthStr] = (budget.month || '').split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10); // 1-12

        const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
        const startOfNextMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

        console.log('Start of month:', startOfMonth, 'Start of next month:', startOfNextMonth);

        const spent = await Transaction.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(req.userId), // Explicitly cast to ObjectId
              category: budget.category,
              amount: { $lt: 0 }, // Only count expenses (negative amounts)
              date: {
                $gte: startOfMonth,
                $lt: startOfNextMonth
              }
            }
          },
          {
            $group: { _id: null, total: { $sum: '$amount' } }
          }
        ]);

        console.log('Spent result for budget category', budget.category, ':', spent);

        // Expenses are negative, so we take absolute value
        const totalSpent = spent.length > 0 ? Math.abs(spent[0].total) : 0;

        // Evitar división por cero y valores NaN
        const percentage = (budget.limit && budget.limit > 0)
          ? Math.round((totalSpent / budget.limit) * 100)
          : 0;

        const isExceeded = totalSpent > budget.limit;

        return {
          ...budget.toObject(),
          spent: totalSpent,
          remaining: budget.limit - totalSpent,
          percentage,
          isExceeded
        };
      })
    );

    res.json(budgetsWithSpent);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear presupuesto
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { category, limit, month } = req.body;

    if (!category || !limit || !month) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const budget = new Budget({
      userId: req.userId,
      category,
      limit,
      month
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Ya existe un presupuesto para esta categoría en este mes' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Actualizar presupuesto
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    if (budget.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar este presupuesto' });
    }

    const { limit } = req.body;
    if (limit !== undefined) {
      budget.limit = limit;
    }

    budget.updatedAt = Date.now();
    await budget.save();

    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar presupuesto
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    if (budget.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este presupuesto' });
    }

    await budget.deleteOne();
    res.json({ message: 'Presupuesto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
