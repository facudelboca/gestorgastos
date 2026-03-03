const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/v1/categories
// devolver todas las categorías del usuario
router.get('/', async (req, res) => {
  try {
    const cats = await Category.find({ userId: req.userId }).sort({ name: 1 });
    res.json(cats);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST crear categoría nueva
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const cat = new Category({ userId: req.userId, name });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    console.error('Error creating category:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar nombre de categoría
router.put('/:id', async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    if (cat.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta categoría' });
    }
    const { name } = req.body;
    if (name) {
      const oldName = cat.name;
      cat.name = name;
      await cat.save();
      // also update transactions with the old category name
      await Transaction.updateMany(
        { userId: req.userId, category: oldName },
        { $set: { category: name } }
      );
    }
    res.json(cat);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE eliminar
router.delete('/:id', async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    if (cat.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta categoría' });
    }
    await cat.deleteOne();
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;