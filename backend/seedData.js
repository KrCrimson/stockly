require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Supplier = require('./src/models/Supplier');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Limpiar datos existentes
    await Category.deleteMany({});
    await Supplier.deleteMany({});
    console.log('Datos existentes limpiados');

    // Crear categorías iniciales
    const categories = [
      { name: 'Electrónica', description: 'Dispositivos y componentes electrónicos', color: '#3b82f6' },
      { name: 'Oficina', description: 'Suministros y mobiliario de oficina', color: '#10b981' },
      { name: 'Muebles', description: 'Mobiliario y decoración', color: '#8b5cf6' },
      { name: 'Herramientas', description: 'Herramientas manuales y eléctricas', color: '#f59e0b' },
      { name: 'Consumibles', description: 'Productos de uso frecuente', color: '#ef4444' },
      { name: 'Ropa', description: 'Vestimenta y accesorios', color: '#ec4899' },
      { name: 'Hogar', description: 'Artículos para el hogar', color: '#06b6d4' },
      { name: 'Deportes', description: 'Equipamiento deportivo', color: '#84cc16' }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('Categorías creadas:', createdCategories.length);

    // Crear proveedores iniciales
    const suppliers = [
      {
        name: 'TechSupplier SA',
        contact: {
          email: 'ventas@techsupplier.com',
          phone: '+34 900 123 456',
          address: 'Calle Tecnología 123, Madrid'
        },
        representative: {
          name: 'Juan Carlos Pérez',
          position: 'Gerente Comercial'
        },
        paymentTerms: '30 días',
        rating: 4
      },
      {
        name: 'OfficeMax Corp',
        contact: {
          email: 'pedidos@officemax.com',
          phone: '+34 900 789 012',
          address: 'Avenida Oficina 456, Barcelona'
        },
        representative: {
          name: 'María González',
          position: 'Directora de Ventas'
        },
        paymentTerms: '15 días',
        rating: 5
      },
      {
        name: 'MueblesPro Ltd',
        contact: {
          email: 'info@mueblespro.com',
          phone: '+34 900 345 678',
          address: 'Plaza Muebles 789, Valencia'
        },
        representative: {
          name: 'Carlos Rodríguez',
          position: 'Representante Comercial'
        },
        paymentTerms: '45 días',
        rating: 4
      },
      {
        name: 'ToolMaster Inc',
        contact: {
          email: 'sales@toolmaster.com',
          phone: '+34 900 567 890',
          address: 'Industrial Park 321, Sevilla'
        },
        representative: {
          name: 'Ana Martín',
          position: 'Account Manager'
        },
        paymentTerms: '30 días',
        rating: 3
      },
      {
        name: 'Global Supplies',
        contact: {
          email: 'contacto@globalsupplies.com',
          phone: '+34 900 234 567',
          address: 'Calle Global 654, Bilbao'
        },
        representative: {
          name: 'Pedro López',
          position: 'Gerente Regional'
        },
        paymentTerms: '60 días',
        rating: 4
      },
      {
        name: 'ProveMax SA',
        contact: {
          email: 'atencion@provemax.com',
          phone: '+34 900 876 543',
          address: 'Avenida Proveedores 987, Zaragoza'
        },
        representative: {
          name: 'Laura Fernández',
          position: 'Directora Comercial'
        },
        paymentTerms: '30 días',
        rating: 5
      }
    ];

    const createdSuppliers = await Supplier.insertMany(suppliers);
    console.log('Proveedores creados:', createdSuppliers.length);

    console.log('Datos iniciales creados exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error creando datos iniciales:', error);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();