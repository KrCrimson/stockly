const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const StockMovement = require('../models/StockMovement');

/**
 * Script para limpiar datos huérfanos (sin campo user)
 * Este script eliminará todos los datos que no tienen un usuario asignado
 */
const cleanDatabase = async () => {
  try {
    console.log('🧹 Iniciando limpieza de base de datos...');
    
    // Eliminar productos sin usuario
    const deletedProducts = await Product.deleteMany({ user: { $exists: false } });
    console.log(`✅ Productos eliminados: ${deletedProducts.deletedCount}`);
    
    // Eliminar categorías sin usuario
    const deletedCategories = await Category.deleteMany({ user: { $exists: false } });
    console.log(`✅ Categorías eliminadas: ${deletedCategories.deletedCount}`);
    
    // Eliminar proveedores sin usuario
    const deletedSuppliers = await Supplier.deleteMany({ user: { $exists: false } });
    console.log(`✅ Proveedores eliminados: ${deletedSuppliers.deletedCount}`);
    
    // Eliminar movimientos de stock sin usuario
    const deletedMovements = await StockMovement.deleteMany({ user: { $exists: false } });
    console.log(`✅ Movimientos eliminados: ${deletedMovements.deletedCount}`);
    
    console.log('🎉 Limpieza completada exitosamente');
    console.log('📊 Resumen:');
    console.log(`   - Productos: ${deletedProducts.deletedCount}`);
    console.log(`   - Categorías: ${deletedCategories.deletedCount}`);
    console.log(`   - Proveedores: ${deletedSuppliers.deletedCount}`);
    console.log(`   - Movimientos: ${deletedMovements.deletedCount}`);
    
    return {
      products: deletedProducts.deletedCount,
      categories: deletedCategories.deletedCount,
      suppliers: deletedSuppliers.deletedCount,
      movements: deletedMovements.deletedCount
    };
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  }
};

/**
 * Script alternativo para asignar datos huérfanos a un usuario específico
 * Solo usar si quieres conservar los datos existentes
 */
const assignOrphanDataToUser = async (userId) => {
  try {
    console.log(`🔧 Asignando datos huérfanos al usuario: ${userId}`);
    
    // Asignar productos sin usuario
    const updatedProducts = await Product.updateMany(
      { user: { $exists: false } },
      { $set: { user: userId } }
    );
    console.log(`✅ Productos actualizados: ${updatedProducts.modifiedCount}`);
    
    // Asignar categorías sin usuario
    const updatedCategories = await Category.updateMany(
      { user: { $exists: false } },
      { $set: { user: userId } }
    );
    console.log(`✅ Categorías actualizadas: ${updatedCategories.modifiedCount}`);
    
    // Asignar proveedores sin usuario
    const updatedSuppliers = await Supplier.updateMany(
      { user: { $exists: false } },
      { $set: { user: userId } }
    );
    console.log(`✅ Proveedores actualizados: ${updatedSuppliers.modifiedCount}`);
    
    // Asignar movimientos sin usuario
    const updatedMovements = await StockMovement.updateMany(
      { user: { $exists: false } },
      { $set: { user: userId } }
    );
    console.log(`✅ Movimientos actualizados: ${updatedMovements.modifiedCount}`);
    
    console.log('🎉 Asignación completada exitosamente');
    
    return {
      products: updatedProducts.modifiedCount,
      categories: updatedCategories.modifiedCount,
      suppliers: updatedSuppliers.modifiedCount,
      movements: updatedMovements.modifiedCount
    };
    
  } catch (error) {
    console.error('❌ Error durante la asignación:', error);
    throw error;
  }
};

module.exports = {
  cleanDatabase,
  assignOrphanDataToUser
};