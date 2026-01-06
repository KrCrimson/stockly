import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import {
  Product,
  StockMovement,
  DashboardData,
  CreateProductForm,
  CreateMovementForm,
  ProductFilters,
  MovementFilters,
  AppContextType
} from '../types';
import api from '../services/api';

// Estado inicial
interface AppState {
  products: Product[];
  movements: StockMovement[];
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  products: [],
  movements: [],
  dashboardData: null,
  loading: false,
  error: null
};

// Actions
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_MOVEMENTS'; payload: StockMovement[] }
  | { type: 'SET_DASHBOARD'; payload: DashboardData }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_MOVEMENT'; payload: StockMovement };

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false, error: null };
    case 'SET_MOVEMENTS':
      return { ...state, movements: action.payload, loading: false, error: null };
    case 'SET_DASHBOARD':
      return { ...state, dashboardData: action.payload, loading: false, error: null };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload], loading: false, error: null };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p._id === action.payload._id ? action.payload : p),
        loading: false,
        error: null
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p._id !== action.payload),
        loading: false,
        error: null
      };
    case 'ADD_MOVEMENT':
      return { ...state, movements: [action.payload, ...state.movements], loading: false, error: null };
    default:
      return state;
  }
};

// Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper function para manejar errores
  const handleError = useCallback((error: any) => {
    const errorMessage = api.utils.handleError(error);
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
    console.error('App Error:', errorMessage);
  }, []);

  // Fetch productos
  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.products.getAll(filters);
      dispatch({ type: 'SET_PRODUCTS', payload: response.data });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  // Fetch movimientos
  const fetchMovements = useCallback(async (filters?: MovementFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.movements.getAll(filters);
      dispatch({ type: 'SET_MOVEMENTS', payload: response.data });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  // Fetch dashboard
  const fetchDashboard = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.dashboard.getMain();
      dispatch({ type: 'SET_DASHBOARD', payload: response.data });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  // Crear producto
  const createProduct = useCallback(async (productData: CreateProductForm): Promise<Product> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.products.create(productData);
      dispatch({ type: 'ADD_PRODUCT', payload: response.data });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  // Actualizar producto
  const updateProduct = useCallback(async (id: string, productData: Partial<CreateProductForm>): Promise<Product> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.products.update(id, productData);
      dispatch({ type: 'UPDATE_PRODUCT', payload: response.data });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  // Eliminar producto
  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await api.products.delete(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  // Crear movimiento
  const createMovement = useCallback(async (movementData: CreateMovementForm): Promise<StockMovement> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.movements.create(movementData);
      dispatch({ type: 'ADD_MOVEMENT', payload: response.data });
      
      // Refetch products para actualizar stock
      await fetchProducts();
      
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError, fetchProducts]);

  // Reversar movimiento
  const reverseMovement = useCallback(async (id: string, performedBy: string, notes?: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await api.movements.reverse(id, performedBy, notes);
      
      // Refetch movements y products
      await Promise.all([fetchMovements(), fetchProducts()]);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError, fetchMovements, fetchProducts]);

  // Valor del contexto
  const contextValue: AppContextType = {
    ...state,
    fetchProducts,
    fetchMovements,
    fetchDashboard,
    createProduct,
    updateProduct,
    deleteProduct,
    createMovement,
    reverseMovement
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;