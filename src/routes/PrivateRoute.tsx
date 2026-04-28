import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getDefaultRouteForRole } from './AdminRoute';

export function PrivateRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // QT role always belongs in the admin module, not the generic dashboard
  if (user?.roleName === 'QT') {
    return <Navigate to={getDefaultRouteForRole('QT')} replace />;
  }

  // TV role belongs in the TV module
  if (user?.roleName === 'TV') {
    return <Navigate to={getDefaultRouteForRole('TV')} replace />;
  }

  // SA role belongs in the SA module
  if (user?.roleName === 'SA') {
    return <Navigate to={getDefaultRouteForRole('SA')} replace />;
  }

  // DP role belongs in the DP module
  if (user?.roleName === 'DP') {
    return <Navigate to={getDefaultRouteForRole('DP')} replace />;
  }

  return <Outlet />;
}
