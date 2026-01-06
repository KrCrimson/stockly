const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rutas
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Obtener token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // O de las cookies
    else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // Verificar si existe token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No tienes autorización para acceder a esta ruta'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Obtener usuario del token
      const currentUser = await User.findById(decoded.userId);
      
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: 'El usuario ya no existe'
        });
      }

      // Verificar si el usuario está activo
      if (!currentUser.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Usuario desactivado'
        });
      }

      // Añadir usuario a request
      req.user = currentUser;
      next();
      
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
  } catch (error) {
    console.error('Error en middleware auth:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles específicos
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Rol ${req.user.role} no tiene autorización para esta acción`
      });
    }
    next();
  };
};

// Middleware opcional - no bloquea si no hay token
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    // Obtener token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // O de las cookies
    else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // Si no hay token, continuar sin autenticación
    if (!token) {
      return next();
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Obtener usuario del token
      const currentUser = await User.findById(decoded.userId);
      
      if (currentUser && currentUser.isActive) {
        req.user = currentUser;
      }
      
      next();
      
    } catch (jwtError) {
      // Si hay error en JWT, continuar sin autenticación
      next();
    }
    
  } catch (error) {
    console.error('Error en middleware auth opcional:', error);
    next();
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};