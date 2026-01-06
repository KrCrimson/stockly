import axios from 'axios';
import { 
  Product, 
  StockMovement, 
  CreateProductForm, 
  CreateMovementForm,
  DashboardData,
  ApiResponse,
  ProductFilters,
  MovementFilters,
  Category,
  Supplier
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de errores y tokens expirados
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token ha expirado o es inválido
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// PRODUCTOS
// ============================================================================

export const productService = {
  // Obtener todos los productos
  getAll: async (filters?: ProductFilters): Promise<ApiResponse<Product[]>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  // Obtener producto por ID
  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Crear nuevo producto
  create: async (product: CreateProductForm): Promise<ApiResponse<Product>> => {
    const response = await api.post('/products', product);
    return response.data;
  },

  // Actualizar producto
  update: async (id: string, product: Partial<CreateProductForm>): Promise<ApiResponse<Product>> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  // Eliminar producto (soft delete)
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Actualizar stock
  updateStock: async (id: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<ApiResponse<Product>> => {
    const response = await api.patch(`/products/${id}/stock`, { quantity, operation });
    return response.data;
  },

  // Obtener productos con stock bajo
  getLowStock: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/products/low-stock');
    return response.data;
  },

  // Obtener categorías
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get('/categories/active');
    return {
      ...response.data,
      data: response.data.data.map((cat: any) => cat.name)
    };
  },

  // Obtener categorías completas
  getCategoriesFull: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/categories/active');
    return response.data;
  },

  // Obtener proveedores disponibles
  getSuppliers: async (): Promise<ApiResponse<{ name: string; contact: string }[]>> => {
    const response = await api.get('/suppliers/active');
    return {
      ...response.data,
      data: response.data.data.map((supplier: any) => ({
        name: supplier.name,
        contact: supplier.contact?.email || supplier.contact?.phone || 'Sin contacto'
      }))
    };
  },

  // Obtener proveedores completos  
  getSuppliersFull: async (): Promise<ApiResponse<Supplier[]>> => {
    const response = await api.get('/suppliers/active');
    return response.data;
  },
};

// ============================================================================
// MOVIMIENTOS DE STOCK
// ============================================================================

export const movementService = {
  // Obtener todos los movimientos
  getAll: async (filters?: MovementFilters): Promise<ApiResponse<StockMovement[]>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/stock-movements?${params.toString()}`);
    return response.data;
  },

  // Obtener movimiento por ID
  getById: async (id: string): Promise<ApiResponse<StockMovement>> => {
    const response = await api.get(`/stock-movements/${id}`);
    return response.data;
  },

  // Crear nuevo movimiento
  create: async (movement: CreateMovementForm): Promise<ApiResponse<StockMovement>> => {
    const response = await api.post('/stock-movements', movement);
    return response.data;
  },

  // Reversar movimiento
  reverse: async (id: string, performedBy: string, notes?: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/stock-movements/${id}/reverse`, { performedBy, notes });
    return response.data;
  },

  // Obtener historial de un producto
  getProductHistory: async (productId: string, limit?: number): Promise<ApiResponse<StockMovement[]>> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get(`/stock-movements/product/${productId}/history${params}`);
    return response.data;
  },

  // Obtener estadísticas
  getStats: async (dateFrom?: string, dateTo?: string, productId?: string): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (productId) params.append('productId', productId);
    
    const response = await api.get(`/stock-movements/stats?${params.toString()}`);
    return response.data;
  },
};

// ============================================================================
// DASHBOARD
// ============================================================================

export const dashboardService = {
  // Obtener datos del dashboard principal
  getMain: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  // Obtener tendencias
  getTrends: async (days?: number): Promise<ApiResponse<any>> => {
    const params = days ? `?days=${days}` : '';
    const response = await api.get(`/dashboard/trends${params}`);
    return response.data;
  },

  // Obtener reporte personalizado
  getCustomReport: async (reportData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/dashboard/reports', reportData);
    return response.data;
  },
};

// ============================================================================// CATEGORÍAS
// ============================================================================

export const categoryService = {
  // Obtener todas las categorías
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Obtener categorías activas
  getActive: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/categories/active');
    return response.data;
  },

  // Obtener una categoría por ID
  getById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Crear nueva categoría
  create: async (categoryData: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Actualizar categoría
  update: async (id: string, categoryData: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Eliminar categoría (desactivar)
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// ============================================================================
// PROVEEDORES
// ============================================================================

export const supplierService = {
  // Obtener todos los proveedores
  getAll: async (): Promise<ApiResponse<Supplier[]>> => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  // Obtener proveedores activos
  getActive: async (): Promise<ApiResponse<Supplier[]>> => {
    const response = await api.get('/suppliers/active');
    return response.data;
  },

  // Obtener un proveedor por ID
  getById: async (id: string): Promise<ApiResponse<Supplier>> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  // Crear nuevo proveedor
  create: async (supplierData: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  // Actualizar proveedor
  update: async (id: string, supplierData: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  },

  // Eliminar proveedor (desactivar)
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },
};

// ============================================================================// UTILIDADES
// ============================================================================

export const apiUtils = {
  // Verificar salud de la API
  healthCheck: async (): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.data;
  },

  // Manejar errores de API
  handleError: (error: any): string => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Ocurrió un error inesperado';
  },

  // Formatear fecha para API
  formatDate: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  // Parsear respuesta de API
  parseResponse: <T>(response: ApiResponse<T>): T => {
    if (response.success) {
      return response.data;
    }
    throw new Error('Respuesta de API inválida');
  },
};

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

export const authService = {
  // Login
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'manager' | 'employee';
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Verificar token
  verifyToken: async () => {
    const response = await api.get('/auth/verify-token');
    return response.data;
  },
};

const apiService = {
  products: productService,
  movements: movementService,
  dashboard: dashboardService,
  categories: categoryService,
  suppliers: supplierService,
  auth: authService,
  utils: apiUtils,
};

export default apiService;
export { api };