import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'employee';
  allowedRoles?: ('admin' | 'manager' | 'employee')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  allowedRoles 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Mostrar loader mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Verificar permisos de rol si se especifican
  if (requiredRole || allowedRoles) {
    const hasRequiredRole = requiredRole ? user.role === requiredRole : true;
    const hasAllowedRole = allowedRoles ? allowedRoles.includes(user.role) : true;
    
    // Definir jerarquía de roles
    const roleHierarchy = {
      'admin': 3,
      'manager': 2,
      'employee': 1
    };

    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = requiredRole ? roleHierarchy[requiredRole] : 0;

    // Permitir acceso si:
    // 1. No hay restricción de rol específica, O
    // 2. El usuario tiene el rol exacto requerido, O
    // 3. El usuario está en la lista de roles permitidos, O
    // 4. El usuario tiene un rol de mayor jerarquía que el requerido
    const canAccess = 
      (!requiredRole && !allowedRoles) ||
      hasRequiredRole ||
      hasAllowedRole ||
      (requiredRole && userRoleLevel >= requiredRoleLevel);

    if (!canAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg 
                  className="h-6 w-6 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acceso Denegado
            </h3>
            <p className="text-gray-600 mb-4">
              No tienes permisos suficientes para acceder a esta página.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Tu rol actual: <span className="font-medium capitalize">{user.role}</span>
            </p>
            {requiredRole && (
              <p className="text-sm text-gray-500 mb-4">
                Rol requerido: <span className="font-medium capitalize">{requiredRole}</span>
              </p>
            )}
            {allowedRoles && (
              <p className="text-sm text-gray-500 mb-4">
                Roles permitidos: <span className="font-medium capitalize">{allowedRoles.join(', ')}</span>
              </p>
            )}
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
  }

  // Renderizar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;