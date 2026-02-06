const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

// Obtener presupuestos del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { month } = req.query;
    let query = { userId: req.userId };
    
    if (month) {
      query.month = month;
    }
    
    const budgets = await Budget.find(query).sort({ category: 1 });
    
    // Calcular gasto actual para cada presupuesto
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              userId: req.userId,
              category: budget.category,
              date: {
                $gte: new Date(`${budget.month}-01`),
                $lt: new Date(`${budget.month}-32`)
              }
            }
          },
          {
            $group: { _id: null, total: { $sum: '$amount' } }
          }
        ]);
        
        return {
          ...budget.toObject(),
          spent: spent.length > 0 ? spent[0].total : 0,
          remaining: budget.limit - (spent.length > 0 ? spent[0].total : 0),
          percentage: Math.round((spent.length > 0 ? spent[0].total : 0) / budget.limit * 100)
        };
      })
    );
    
    res.json(budgetsWithSpent);
  } catch (error) {
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
