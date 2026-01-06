import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Filter, Edit, Power, PowerOff } from 'lucide-react';
import { Product } from '../types';
import { ProductForm } from '../components';

const Products: React.FC = () => {
  const { products, loading, error, fetchProducts, updateProduct } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // Por defecto mostrar solo activos

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Obtener categorías únicas
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesStock = !stockFilter || 
                        (stockFilter === 'low' && product.currentStock <= product.minStockLevel) ||
                        (stockFilter === 'normal' && product.currentStock > product.minStockLevel);
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive) ||
                         statusFilter === 'all';
    
    return matchesSearch && matchesCategory && matchesStock && matchesStatus;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleToggleStatus = async (product: Product) => {
    const action = product.isActive ? 'desactivar' : 'activar';
    const confirmMessage = `¿Estás seguro de que quieres ${action} este producto?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        // Enviar solo el campo isActive para evitar conflictos
        console.log('📤 Enviando datos:', { isActive: !product.isActive });
        await updateProduct(product._id, { isActive: !product.isActive });
        console.log('✅ Producto actualizado exitosamente');
      } catch (error) {
        console.error('❌ Error updating product status:', error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : (error as any)?.response?.data?.message || 'Error desconocido';
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Productos</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tu inventario de productos
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="btn-primary inline-flex items-center"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
              <input
                type="text"
                className="input-field pl-10 w-full min-w-0"
                placeholder="Nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-span-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              className="input-field w-full min-w-0"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Todas</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <select
              className="input-field w-full min-w-0"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="low">Stock Bajo</option>
              <option value="normal">Stock Normal</option>
            </select>
          </div>

          <div className="col-span-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              className="input-field w-full min-w-0"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="active">Solo Activos</option>
              <option value="inactive">Solo Inactivos</option>
              <option value="all">Todos</option>
            </select>
          </div>

          <div className="col-span-1 flex items-end min-w-0">
            <button
              type="button"
              className="btn-secondary inline-flex items-center w-full justify-center min-w-0"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setStockFilter('');
                setStatusFilter('active');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <span className="text-red-800">Error: {error}</span>
        </div>
      )}

      {/* Tabla de productos */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span>{product.currentStock}</span>
                      <span className="text-xs text-gray-500">
                        Min: {product.minStockLevel}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.currentStock <= product.minStockLevel
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.currentStock <= product.minStockLevel ? 'Stock Bajo' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Editar producto"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`p-1 ${
                          product.isActive 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={product.isActive ? 'Desactivar producto' : 'Activar producto'}
                      >
                        {product.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Modal del formulario */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseForm}
          onSuccess={() => {
            handleCloseForm();
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

export default Products;