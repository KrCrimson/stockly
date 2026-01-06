import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';
import { Product, CreateProductForm, Supplier } from '../types';
import apiService from '../services/api';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess }) => {
  const { createProduct, updateProduct, loading } = useApp();
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState<CreateProductForm>({
    name: '',
    description: '',
    sku: '', // SKU será opcional y se generará automáticamente
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStockLevel: 0,
    maxStockLevel: undefined,
    supplier: {
      name: '',
      contact: ''
    },
    tags: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagsInput, setTagsInput] = useState(''); // Para manejar la entrada de tags como string

  // Cargar categorías y proveedores al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, suppliersRes] = await Promise.all([
          apiService.products.getCategories(),
          apiService.products.getSuppliersFull()
        ]);
        setCategories(categoriesRes.data);
        setSuppliers(suppliersRes.data);
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        sku: product.sku, // Mostrar SKU existente pero no permitir edición
        category: product.category,
        unitPrice: product.unitPrice,
        currentStock: product.currentStock,
        minStockLevel: product.minStockLevel,
        maxStockLevel: product.maxStockLevel,
        supplier: {
          name: product.supplier?.name || '',
          contact: product.supplier?.contact || ''
        },
        tags: product.tags || []
      });
      // Convertir tags array a string para el input
      setTagsInput(product.tags?.join(', ') || '');
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CreateProductForm] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar cambio de categoría y actualizar contacto del proveedor automáticamente
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setFormData(prev => ({ ...prev, category }));
    
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  // Manejar cambio de proveedor y actualizar contacto automáticamente
  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supplierName = e.target.value;
    const supplier = suppliers.find(s => s.name === supplierName);
    
    // Auto-completar datos del proveedor seleccionado
    let contact = '';
    if (supplier?.contact?.email) {
      contact = supplier.contact.email;
    } else if (supplier?.contact?.phone) {
      contact = supplier.contact.phone;
    } else if (supplier?.primaryContact) {
      contact = supplier.primaryContact;
    }
    
    setFormData(prev => ({
      ...prev,
      supplier: {
        name: supplierName,
        contact: contact
      }
    }));
    
    if (errors['supplier.name']) {
      setErrors(prev => ({ ...prev, 'supplier.name': '' }));
    }
  };

  // Manejar cambio de tags como string separado por comas
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsText = e.target.value;
    setTagsInput(tagsText);
    
    // Convertir string a array de tags
    const tags = tagsText
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    setFormData(prev => ({ ...prev, tags }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    // SKU es opcional - se genera automáticamente si no se proporciona
    if (!formData.category.trim()) newErrors.category = 'La categoría es obligatoria';
    if (formData.unitPrice <= 0) newErrors.unitPrice = 'El precio debe ser mayor a 0';
    if ((formData.currentStock || 0) < 0) newErrors.currentStock = 'El stock no puede ser negativo';
    if ((formData.minStockLevel || 0) < 0) newErrors.minStockLevel = 'El nivel mínimo no puede ser negativo';
    if (formData.maxStockLevel && formData.maxStockLevel <= formData.minStockLevel) {
      newErrors.maxStockLevel = 'El nivel máximo debe ser mayor al mínimo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Preparar datos para envío, omitiendo SKU vacío para nuevos productos
      const submitData = { ...formData };
      if (!product && (!submitData.sku || !submitData.sku.trim())) {
        delete submitData.sku; // El backend generará el SKU automáticamente
      }

      if (product) {
        await updateProduct(product._id, submitData);
      } else {
        await createProduct(submitData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Nombre del producto"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU {product ? '*' : '(automático)'}
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                disabled={!product} // Solo editable en modo edición
                className={`input-field ${errors.sku ? 'border-red-500' : ''} ${!product ? 'bg-gray-100' : ''}`}
                placeholder={product ? formData.sku : "Se generará automáticamente"}
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
              {!product && <p className="text-gray-500 text-xs mt-1">El SKU se generará automáticamente basado en la categoría</p>}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className={`input-field ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario *
              </label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`input-field ${errors.unitPrice ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.unitPrice && <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>}
            </div>

            {/* Stock Actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Actual
              </label>
              <input
                type="number"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                min="0"
                className={`input-field ${errors.currentStock ? 'border-red-500' : ''}`}
                placeholder="0"
              />
              {errors.currentStock && <p className="text-red-500 text-xs mt-1">{errors.currentStock}</p>}
            </div>

            {/* Nivel Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel Mínimo de Stock
              </label>
              <input
                type="number"
                name="minStockLevel"
                value={formData.minStockLevel}
                onChange={handleChange}
                min="0"
                className={`input-field ${errors.minStockLevel ? 'border-red-500' : ''}`}
                placeholder="0"
              />
              {errors.minStockLevel && <p className="text-red-500 text-xs mt-1">{errors.minStockLevel}</p>}
            </div>

            {/* Nivel Máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel Máximo de Stock
              </label>
              <input
                type="number"
                name="maxStockLevel"
                value={formData.maxStockLevel || ''}
                onChange={handleChange}
                min="0"
                className={`input-field ${errors.maxStockLevel ? 'border-red-500' : ''}`}
                placeholder="Opcional"
              />
              {errors.maxStockLevel && <p className="text-red-500 text-xs mt-1">{errors.maxStockLevel}</p>}
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor
              </label>
              <select
                name="supplier.name"
                value={formData.supplier?.name || ''}
                onChange={handleSupplierChange}
                className="input-field"
              >
                <option value="">Selecciona un proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.name} value={supplier.name}>
                    {supplier.name} {supplier.representative?.name ? `- ${supplier.representative.name}` : ''}
                  </option>
                ))}
              </select>
              {formData.supplier?.name && (
                <p className="text-green-600 text-xs mt-1">
                  ✓ Contacto auto-completado: {formData.supplier.contact}
                </p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Descripción del producto..."
            />
          </div>

          {/* Contacto Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contacto Proveedor
            </label>
            <input
              type="text"
              name="supplier.contact"
              value={formData.supplier?.contact || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  supplier: {
                    name: prev.supplier?.name || '',
                    contact: e.target.value
                  }
                }));
              }}
              className="input-field"
              placeholder="Email o teléfono del proveedor"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (separados por coma)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={handleTagsChange}
              className="input-field"
              placeholder="nuevo, popular, oferta"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;