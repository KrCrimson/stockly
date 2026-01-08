require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const initUsers = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stock_management');

    // Verificar si ya existen usuarios
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Ya existen usuarios en la base de datos');
      process.exit(0);
    }

    // Crear usuarios de prueba
    const users = [
      {
        name: 'Administrador',
        email: 'admin@stockly.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Gerente',
        email: 'manager@stockly.com',
        password: 'manager123',
        role: 'manager'
      },
      {
        name: 'Empleado',
        email: 'employee@stockly.com',
        password: 'employee123',
        role: 'employee'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Usuario creado: ${user.name} (${user.email})`);
    }

    console.log('Usuarios de prueba creados exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error creando usuarios:', error);
    process.exit(1);
  }
};

initUsers();