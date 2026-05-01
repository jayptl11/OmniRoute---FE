import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getDefaultRouteForRole } from './AdminRoute';

/**
 * Guard for routes that require role BQL (Ban quản lý).
 * - Not authenticated → /login
 * - Authenticated but wrong role → default route for their role
 */
export function BqlRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.roleName !== 'BQL') {
    return <Navigate to={getDefaultRouteForRole(user?.roleName)} replace />;
  }

  return <Outlet />;
}
