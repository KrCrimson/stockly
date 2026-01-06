import React, { useState, useEffect } from 'react';
import { Plus, Filter, TrendingUp, TrendingDown, Package, ArrowUpRight, Eye } from 'lucide-react';
import { StockMovement, Product, MovementFilters } from '../types';
import apiService from '../services/api';

const Movements: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState<MovementFilters>({
    productId: '',
    type: '',
    startDate: '',
    endDate: '',
    performedBy: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      await fetchMovements();
      await fetchProducts();
    };
    loadData();
  }, []);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await apiService.movements.getAll(filters);
      setMovements(response.data);
    } catch (error) {
      console.error('Error fetching movements:', error);
      setError('Error al cargar los movimientos');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiService.products.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Aplicar filtros
  const handleFilterChange = (key: keyof MovementFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchMovements();
  };

  const clearFilters = () => {
    setFilters({
      productId: '',
      type: '',
      startDate: '',
      endDate: '',
      performedBy: ''
    });
    setTimeout(() => fetchMovements(), 100);
  };

  // Obtener el ícono según el tipo de movimiento
  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'OUT':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'ADJUSTMENT':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'TRANSFER':
        return <ArrowUpRight className="h-4 w-4 text-purple-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  // Obtener el color según el tipo de movimiento
  const getMovementColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'bg-green-100 text-green-800';
      case 'OUT':
        return 'bg-red-100 text-red-800';
      case 'ADJUSTMENT':
        return 'bg-blue-100 text-blue-800';
      case 'TRANSFER':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewMovementDetails = (movement: StockMovement) => {
    setSelectedMovement(movement);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimientos de Stock</h1>
          <p className="text-gray-600">Historial de entradas y salidas de inventario</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Movimiento
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Entradas Hoy</p>
              <p className="text-lg font-semibold text-gray-900">
                {movements.filter(m => 
                  m.type === 'IN' && 
                  new Date(m.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Salidas Hoy</p>
              <p className="text-lg font-semibold text-gray-900">
                {movements.filter(m => 
                  m.type === 'OUT' && 
                  new Date(m.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Movimientos</p>
              <p className="text-lg font-semibold text-gray-900">{movements.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ArrowUpRight className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Productos Activos</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Set(movements.map(m => m.product.name)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Producto</label>
            <select
              value={filters.productId || ''}
              onChange={(e) => handleFilterChange('productId', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">Todos los productos</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">Todos los tipos</option>
              <option value="IN">Entrada</option>
              <option value="OUT">Salida</option>
              <option value="ADJUSTMENT">Ajuste</option>
              <option value="TRANSFER">Transferencia</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Realizado por</label>
            <input
              type="text"
              value={filters.performedBy || ''}
              onChange={(e) => handleFilterChange('performedBy', e.target.value)}
              placeholder="Usuario"
              className="input-field text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={applyFilters} className="btn-primary text-sm px-3 py-1">
            Aplicar Filtros
          </button>
          <button onClick={clearFilters} className="btn-secondary text-sm px-3 py-1">
            Limpiar
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Tabla de movimientos */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando movimientos...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Anterior
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Nuevo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Realizado por
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(movement.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMovementIcon(movement.type)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMovementColor(movement.type)}`}>
                          {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {movement.product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        SKU: {movement.product.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.previousStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.newStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.performedBy || 'Sistema'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewMovementDetails(movement)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <CreateMovementForm
          products={products}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            fetchMovements();
            setShowCreateForm(false);
          }}
        />
      )}

      {/* Modal de detalles */}
      {showDetails && selectedMovement && (
        <MovementDetailsModal
          movement={selectedMovement}
          onClose={() => {
            setShowDetails(false);
            setSelectedMovement(null);
          }}
        />
      )}
    </div>
  );
};

// Componente para crear movimientos
interface CreateMovementFormProps {
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMovementForm: React.FC<CreateMovementFormProps> = ({ products, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    productId: '',
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER',
    quantity: '',
    reason: '',
    performedBy: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) newErrors.productId = 'Selecciona un producto';
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }
    if (!formData.reason.trim()) newErrors.reason = 'La razón es obligatoria';
    if (!formData.performedBy.trim()) newErrors.performedBy = 'Indica quién realizó el movimiento';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await apiService.movements.create({
        productId: formData.productId,
        type: formData.type,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        performedBy: formData.performedBy,
        notes: formData.notes || undefined
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating movement:', error);
      setErrors({ submit: 'Error al crear el movimiento' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Nuevo Movimiento de Stock</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className={`input-field ${errors.productId ? 'border-red-500' : ''}`}
            >
              <option value="">Seleccionar producto</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} (Stock: {product.currentStock})
                </option>
              ))}
            </select>
            {errors.productId && <p className="text-red-500 text-xs mt-1">{errors.productId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
            >
              <option value="IN">Entrada</option>
              <option value="OUT">Salida</option>
              <option value="ADJUSTMENT">Ajuste</option>
              <option value="TRANSFER">Transferencia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className={`input-field ${errors.quantity ? 'border-red-500' : ''}`}
              placeholder="Cantidad"
            />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Razón del Movimiento *</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={`input-field ${errors.reason ? 'border-red-500' : ''}`}
              placeholder="Compra, Venta, Ajuste de inventario, etc."
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Realizado por *</label>
            <input
              type="text"
              name="performedBy"
              value={formData.performedBy}
              onChange={handleChange}
              className={`input-field ${errors.performedBy ? 'border-red-500' : ''}`}
              placeholder="Nombre del usuario"
            />
            {errors.performedBy && <p className="text-red-500 text-xs mt-1">{errors.performedBy}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Notas adicionales..."
            />
          </div>

          {errors.submit && (
            <div className="text-red-500 text-sm">{errors.submit}</div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente para detalles del movimiento
interface MovementDetailsModalProps {
  movement: StockMovement;
  onClose: () => void;
}

const MovementDetailsModal: React.FC<MovementDetailsModalProps> = ({ movement, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Detalles del Movimiento</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">ID</p>
              <p className="text-sm text-gray-900 font-mono">{movement._id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha</p>
              <p className="text-sm text-gray-900">
                {new Date(movement.createdAt).toLocaleString('es-ES')}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Producto</p>
            <p className="text-sm text-gray-900">{movement.product.name}</p>
            <p className="text-xs text-gray-500">SKU: {movement.product.sku}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Tipo</p>
              <p className="text-sm text-gray-900 capitalize">{movement.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Cantidad</p>
              <p className="text-sm text-gray-900">{movement.quantity}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Precio Unitario</p>
              <p className="text-sm text-gray-900">
                ${movement.unitPrice?.toFixed(2) || 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Stock Anterior</p>
              <p className="text-sm text-gray-900">{movement.previousStock}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Stock Nuevo</p>
              <p className="text-sm text-gray-900">{movement.newStock}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Razón</p>
            <p className="text-sm text-gray-900">{movement.reason}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Realizado por</p>
            <p className="text-sm text-gray-900">{movement.performedBy}</p>
          </div>

          {movement.notes && (
            <div>
              <p className="text-sm font-medium text-gray-500">Notas</p>
              <p className="text-sm text-gray-900">{movement.notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={onClose} className="btn-primary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Movements;