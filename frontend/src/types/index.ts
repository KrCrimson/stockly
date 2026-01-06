// Tipos para productos
export interface Product {
  _id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  supplier?: {
    name: string;
    contact: string;
  };
  isActive: boolean;
  tags: string[];
  lastRestockDate?: string;
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
  isLowStock?: boolean;
  isOverStock?: boolean;
  totalValue?: number;
}

// Tipos para categorías
export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para proveedores
export interface Supplier {
  _id: string;
  name: string;
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  representative?: {
    name?: string;
    position?: string;
  };
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
  primaryContact?: string;
}

// Tipos para movimientos de stock
export interface StockMovement {
  _id: string;
  product: Product;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
  unitCost?: number;
  unitPrice?: number;
  totalCost?: number;
  previousStock: number;
  newStock: number;
  performedBy: string;
  warehouse?: string;
  batchNumber?: string;
  expirationDate?: string;
  isReversed: boolean;
  reversalReference?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para formularios
export interface CreateProductForm {
  name: string;
  description?: string;
  sku?: string; // Opcional para permitir generación automática
  category: string;
  unitPrice: number;
  currentStock?: number;
  minStockLevel: number;
  maxStockLevel?: number;
  supplier?: {
    name?: string; // Opcional también
    contact?: string;
  };
  tags: string[];
  expirationDate?: string;
  isActive?: boolean; // Para activación/desactivación
}

export interface CreateMovementForm {
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
  unitCost?: number;
  performedBy: string;
  warehouse?: string;
  batchNumber?: string;
  expirationDate?: string;
}

// Tipos para dashboard
export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalMovements: number;
  recentMovements: number;
  totalInventoryValue: number;
}

export interface MovementsByType {
  _id: string;
  count: number;
  totalQuantity: number;
}

export interface TopProduct {
  _id: string;
  productId: string;
  productName: string;
  product: Product;
  movementCount: number;
  totalQuantityMoved: number;
  totalValue: number;
}

export interface MostValuableProduct {
  _id: string;
  name: string;
  sku: string;
  currentStock: number;
  unitPrice: number;
  totalValue: number;
}

export interface DashboardData {
  stats: DashboardStats;
  summary: DashboardStats & {
    totalValue: number;
    totalStock: number;
  };
  analytics: {
    movementsByType: MovementsByType[];
    topProductsByMovement: TopProduct[];
  };
  charts: {
    movementsByType: MovementsByType[];
    topProductsByMovement: TopProduct[];
    mostValuableProducts: MostValuableProduct[];
  };
  alerts: {
    criticalStockProducts: Product[];
  };
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  total?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

// Tipos para filtros y paginación
export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  isActive?: boolean;
  lowStock?: boolean;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface MovementFilters {
  page?: number;
  limit?: number;
  product?: string;
  productId?: string;
  type?: string;
  reason?: string;
  warehouse?: string;
  dateFrom?: string;
  dateTo?: string;
  startDate?: string;
  endDate?: string;
  performedBy?: string;
}

// Tipos para el contexto de la aplicación
export interface AppContextType {
  products: Product[];
  movements: StockMovement[];
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchMovements: (filters?: MovementFilters) => Promise<void>;
  fetchDashboard: () => Promise<void>;
  createProduct: (product: CreateProductForm) => Promise<Product>;
  updateProduct: (id: string, product: Partial<CreateProductForm>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  createMovement: (movement: CreateMovementForm) => Promise<StockMovement>;
  reverseMovement: (id: string, performedBy: string, notes?: string) => Promise<void>;
}