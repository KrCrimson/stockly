import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Star } from 'lucide-react';
import { Supplier } from '../types';
import apiService from '../services/api';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar proveedores por búsqueda
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contact?.email && supplier.contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.representative?.name && supplier.representative.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Cargar proveedores
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await apiService.suppliers.getAll();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Error al cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Manejar eliminación
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el proveedor "${name}"?`)) {
      return;
    }

    try {
      await apiService.suppliers.delete(id);
      await fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setError('Error al eliminar el proveedor');
    }
  };

  // Manejar edición
  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  // Manejar creación
  const handleCreate = () => {
    setEditingSupplier(null);
    setShowForm(true);
  };

  // Cerrar formulario
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSupplier(null);
  };

  // Éxito en formulario
  const handleFormSuccess = async () => {
    await fetchSuppliers();
    handleCloseForm();
  };

  // Renderizar estrellas de rating
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-600">Gestiona los proveedores de productos</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Tabla de proveedores */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando proveedores...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Representante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron proveedores' : 'No hay proveedores registrados'}
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {supplier.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {supplier.paymentTerms || 'Sin términos'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {supplier.contact?.email || supplier.contact?.phone || 'Sin contacto'}
                      </div>
                      {supplier.contact?.address && (
                        <div className="text-sm text-gray-500">
                          {supplier.contact.address}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {supplier.representative?.name || 'Sin representante'}
                      </div>
                      {supplier.representative?.position && (
                        <div className="text-sm text-gray-500">
                          {supplier.representative.position}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(supplier.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        supplier.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {supplier.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier._id, supplier.name)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Formulario modal */}
      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

// Componente de formulario para proveedores
interface SupplierFormProps {
  supplier?: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contact: {
      email: supplier?.contact?.email || '',
      phone: supplier?.contact?.phone || '',
      address: supplier?.contact?.address || ''
    },
    representative: {
      name: supplier?.representative?.name || '',
      position: supplier?.representative?.position || ''
    },
    paymentTerms: supplier?.paymentTerms || '',
    notes: supplier?.notes || '',
    rating: supplier?.rating || 3,
    isActive: supplier?.isActive !== false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof formData] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : type === 'number' 
            ? parseInt(value) || 0
            : value
      }));
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (formData.name.length > 100) newErrors.name = 'El nombre no puede exceder 100 caracteres';
    
    if (formData.contact.email && !formData.contact.email.includes('@')) {
      newErrors['contact.email'] = 'El email debe tener un formato válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      if (supplier) {
        await apiService.suppliers.update(supplier._id, formData);
      } else {
        await apiService.suppliers.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving supplier:', error);
      setErrors({ submit: 'Error al guardar el proveedor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Proveedor *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Nombre del proveedor"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="contact.email"
                value={formData.contact.email}
                onChange={handleChange}
                className={`input-field ${errors['contact.email'] ? 'border-red-500' : ''}`}
                placeholder="email@proveedor.com"
              />
              {errors['contact.email'] && <p className="text-red-500 text-xs mt-1">{errors['contact.email']}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+34 900 123 456"
              />
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="contact.address"
                value={formData.contact.address}
                onChange={handleChange}
                className="input-field"
                placeholder="Dirección completa"
              />
            </div>

            {/* Representante Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Representante
              </label>
              <input
                type="text"
                name="representative.name"
                value={formData.representative.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Juan Pérez"
              />
            </div>

            {/* Representante Cargo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo del Representante
              </label>
              <input
                type="text"
                name="representative.position"
                value={formData.representative.position}
                onChange={handleChange}
                className="input-field"
                placeholder="Gerente Comercial"
              />
            </div>

            {/* Términos de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Términos de Pago
              </label>
              <input
                type="text"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="input-field"
                placeholder="30 días"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="input-field"
              >
                <option value={1}>1 estrella</option>
                <option value={2}>2 estrellas</option>
                <option value={3}>3 estrellas</option>
                <option value={4}>4 estrellas</option>
                <option value={5}>5 estrellas</option>
              </select>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Notas adicionales sobre el proveedor..."
            />
          </div>

          {/* Estado activo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Proveedor activo
            </label>
          </div>

          {errors.submit && (
            <div className="text-red-500 text-sm">{errors.submit}</div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (supplier ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Suppliers;