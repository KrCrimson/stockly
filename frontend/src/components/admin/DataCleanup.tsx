import { useState } from 'react';
import { api } from '../../services/api';

interface CleanupResult {
  products: number;
  categories: number;
  suppliers: number;
  movements: number;
}

export default function DataCleanup() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCleanData = async () => {
    if (!confirm('¿Está seguro de que desea eliminar todos los datos compartidos? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.delete('/admin/clean-orphan-data');
      setResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al limpiar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignData = async () => {
    if (!confirm('¿Está seguro de que desea asignar todos los datos compartidos a su usuario?')) {
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/admin/assign-orphan-data');
      setResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al asignar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Limpieza de Datos
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Actualmente hay datos en la base de datos que no están asignados a ningún usuario específico.
                Puede optar por eliminarlos o asignarlos a su usuario actual.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Gestión de Datos Compartidos
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAssignData}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Procesando...' : 'Asignar Datos a Mi Usuario'}
            </button>
            
            <button
              onClick={handleCleanData}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Procesando...' : 'Eliminar Datos Compartidos'}
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Asignar:</strong> Los datos existentes se asignarán a su usuario y serán visibles solo para usted.</p>
            <p><strong>Eliminar:</strong> Todos los datos compartidos serán eliminados permanentemente.</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-green-800 font-medium mb-2">✅ Operación completada</h3>
            <div className="text-green-700 space-y-1">
              <p>Productos: {result.products}</p>
              <p>Categorías: {result.categories}</p>
              <p>Proveedores: {result.suppliers}</p>
              <p>Movimientos: {result.movements}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}