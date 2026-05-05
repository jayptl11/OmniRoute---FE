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

  // SA and SS roles belong in the SA module
  if (user?.roleName === 'SA' || user?.roleName === 'SS') {
    return <Navigate to={getDefaultRouteForRole(user?.roleName)} replace />;
  }

  // DP role belongs in the DP module
  if (user?.roleName === 'DP') {
    return <Navigate to={getDefaultRouteForRole('DP')} replace />;
  }

  // CS role belongs in the CS module
  if (user?.roleName === 'CS') {
    return <Navigate to={getDefaultRouteForRole('CS')} replace />;
  }

  // TN role belongs in the TN module
  if (user?.roleName === 'TN') {
    return <Navigate to={getDefaultRouteForRole('TN')} replace />;
  }

  // QL role belongs in the QL module
  if (user?.roleName === 'QL') {
    return <Navigate to={getDefaultRouteForRole('QL')} replace />;
  }

  // BQL role belongs in the BQL module
  if (user?.roleName === 'BQL') {
    return <Navigate to={getDefaultRouteForRole('BQL')} replace />;
  }

  return <Outlet />;
}
