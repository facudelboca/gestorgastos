const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

// Función auxiliar para generar JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId, email: '' }, // Se puede agregar más data aquí
    process.env.JWT_SECRET || 'tu-secreto-super-secreto',
    { expiresIn: '30d' }
  );
};

// POST /api/v1/auth/register
// Registra un nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validaciones básicas
    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos',
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        error: 'Las contraseñas no coinciden',
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado',
      });
    }

    // Crear nuevo usuario
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generar token
    const token = generateToken(user._id);

    // Responder sin la contraseña
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Error en registro:', error);

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

// POST /api/v1/auth/login
// Inicia sesión y retorna un token JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos',
      });
    }

    // Buscar usuario y obtener su contraseña (select('+password'))
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
      });
    }

    // Comparar contraseña
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
      });
    }

    // Generar token
    const token = generateToken(user._id);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    res.json({
      success: true,
      message: 'Sesión iniciada exitosamente',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor',
    });
  }
});

module.exports = router;
