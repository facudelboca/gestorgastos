const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header Authorization: "Bearer <token>"
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado. Debes iniciar sesión.',
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-super-secreto');
    req.user = decoded;
    req.userId = decoded.userId; // Agregar userId directamente para compatibilidad
    next();
  } catch (error) {
    console.error('Error en autenticación:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado',
    });
  }
};

module.exports = authMiddleware;
