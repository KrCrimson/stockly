import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, AlertTriangle, Download, Filter } from 'lucide-react';
import { Product, DashboardData } from '../types';
import apiService from '../services/api';

interface ReportFilters {
  dateRange: 'week' | 'month' | 'quarter' | 'year';
  category?: string;
  supplier?: string;
}

const Reports: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'month'
  });

  useEffect(() => {
    fetchDashboardData();
    fetchProducts();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.dashboard.getMain();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error al cargar los datos del reporte');
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

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportReport = () => {
    // Simular exportación
    const reportData = {
      fecha: new Date().toLocaleDateString('es-ES'),
      resumen: dashboardData?.stats,
      productos: products.map(p => ({
        nombre: p.name,
        sku: p.sku,
        categoria: p.category,
        stock: p.currentStock,
        valor: p.totalValue || p.currentStock * p.unitPrice
      }))
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-inventario-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis y reportes de inventario</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportReport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">Período de Análisis</h3>
        </div>
        
        <div className="flex gap-4">
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="input-field"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último año</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* KPIs Principales */}
      {dashboardData?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalProducts}</p>
                <p className="text-xs text-green-600 mt-1">
                  {dashboardData.stats.activeProducts} activos
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Valor Total Inventario</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${dashboardData.stats.totalInventoryValue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total en inventario
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Stock Bajo</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.lowStockProducts}</p>
                <p className="text-xs text-red-600 mt-1">
                  Requieren atención
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Movimientos Total</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalMovements}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{dashboardData.stats.recentMovements} recientes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos con Stock Bajo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Productos con Stock Bajo</h3>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            
            <div className="space-y-3">
              {products
                .filter(p => p.isLowStock)
                .slice(0, 5)
                .map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">{product.currentStock}</p>
                      <p className="text-xs text-gray-500">Min: {product.minStockLevel}</p>
                    </div>
                  </div>
                ))}
              
              {products.filter(p => p.isLowStock).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">¡Excelente! No hay productos con stock bajo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Productos por Valor */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Top Productos por Valor</h3>
              <BarChart3 className="h-5 w-5 text-green-500" />
            </div>
            
            <div className="space-y-3">
              {products
                .sort((a, b) => ((b.totalValue || b.currentStock * b.unitPrice) - (a.totalValue || a.currentStock * a.unitPrice)))
                .slice(0, 5)
                .map((product, index) => {
                  const value = product.totalValue || product.currentStock * product.unitPrice;
                  return (
                    <div key={product._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.currentStock} unidades</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">${value.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">${product.unitPrice} c/u</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Análisis por Categorías */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Análisis por Categorías</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Promedio/Producto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(
                  products.reduce((acc, product) => {
                    const category = product.category || 'Sin categoría';
                    if (!acc[category]) {
                      acc[category] = {
                        count: 0,
                        totalStock: 0,
                        totalValue: 0
                      };
                    }
                    acc[category].count += 1;
                    acc[category].totalStock += product.currentStock;
                    acc[category].totalValue += product.totalValue || product.currentStock * product.unitPrice;
                    return acc;
                  }, {} as Record<string, { count: number; totalStock: number; totalValue: number }>)
                ).map(([category, data]) => (
                  <tr key={category} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.totalStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${data.totalValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(data.totalValue / data.count).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Resumen de Movimientos Recientes */}
      {dashboardData?.charts?.topProductsByMovement && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Productos con Más Actividad</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.charts.topProductsByMovement.slice(0, 6).map((item: any, index: number) => (
                <div key={item.productId || item._id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.productName || item.product?.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Movimientos:</span>
                    <span className="text-lg font-semibold text-blue-600">{item.movementCount}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-500">Valor total:</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${item.totalValue?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de tendencias (placeholder) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tendencia de Movimientos</h3>
          
          <div className="h-64 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Gráfico de tendencias</p>
              <p className="text-sm text-gray-400">
                Próximamente: Integración con Chart.js para visualizaciones avanzadas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;