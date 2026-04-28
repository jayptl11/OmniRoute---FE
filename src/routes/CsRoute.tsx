import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getDefaultRouteForRole } from './AdminRoute';

/**
 * Guard for routes that require role CS (Customer Service).
 * - Not authenticated → /login
 * - Authenticated but wrong role → default route for their role
 */
export function CsRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.roleName !== 'CS') {
    return <Navigate to={getDefaultRouteForRole(user?.roleName)} replace />;
  }

  return <Outlet />;
}
