import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

/**
 * Guard for routes that require role QT (Quản trị hệ thống).
 * - Not authenticated → /login
 * - Authenticated but wrong role → default route for their role
 */
export function AdminRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.roleName !== 'QT') {
    return <Navigate to={getDefaultRouteForRole(user?.roleName)} replace />;
  }

  return <Outlet />;
}

/**
 * Returns the default route for a given role.
 * Extend this as more role-specific modules are built.
 */
export function getDefaultRouteForRole(roleName: string | null | undefined): string {
  switch (roleName) {
    case 'QT':
      return '/admin/users';
    // Add future role routes here:
    // case 'SA': return '/sale/dashboard';
    // case 'CS': return '/cs/dashboard';
    case 'SA':
      return '/sa/leads';
    case 'TV':
      return '/tv/leads';
    case 'DP':
      return '/dp/queue';
    case 'CS':
      return '/cs/tickets';
    case 'TN':
      return '/tn/overview';
    case 'QL':
      return '/ql/dashboard';
    case 'BQL':
      return '/bql/dashboard';
    default:
      return '/';
  }
}
