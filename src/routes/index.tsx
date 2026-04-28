import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { TvLayout } from '@/layouts/TvLayout';
import { SaLayout } from '@/layouts/SaLayout';
import { DpLayout } from '@/layouts/DpLayout';
import { PublicRoute } from './PublicRoute';
import { PrivateRoute } from './PrivateRoute';
import { AdminRoute } from './AdminRoute';
import { TvRoute } from './TvRoute';
import { SaRoute } from './SaRoute';
import { DpRoute } from './DpRoute';

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const OtpVerificationPage = lazy(() => import('@/pages/OtpVerificationPage').then((m) => ({ default: m.OtpVerificationPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));

// Admin pages
const UsersPage = lazy(() => import('@/pages/admin/UsersPage').then((m) => ({ default: m.UsersPage })));
const RoutingRulesPage = lazy(() => import('@/pages/admin/RoutingRulesPage').then((m) => ({ default: m.RoutingRulesPage })));
const MasterDataPage = lazy(() => import('@/pages/admin/MasterDataPage').then((m) => ({ default: m.MasterDataPage })));
const StoresPage = lazy(() => import('@/pages/admin/StoresPage').then((m) => ({ default: m.StoresPage })));
const TeamsPage = lazy(() => import('@/pages/admin/TeamsPage').then((m) => ({ default: m.TeamsPage })));
const SlaConfigPage = lazy(() => import('@/pages/admin/SlaConfigPage').then((m) => ({ default: m.SlaConfigPage })));

// TV pages
const LeadsListPage = lazy(() => import('@/pages/tv/LeadsListPage').then((m) => ({ default: m.LeadsListPage })));
const LeadDetailPage = lazy(() => import('@/pages/tv/LeadDetailPage').then((m) => ({ default: m.LeadDetailPage })));

// SA pages
const SaleLeadsListPage = lazy(() => import('@/pages/sa/SaleLeadsListPage').then((m) => ({ default: m.SaleLeadsListPage })));
const SaleLeadDetailPage = lazy(() => import('@/pages/sa/SaleLeadDetailPage').then((m) => ({ default: m.SaleLeadDetailPage })));
const FollowUpsPage = lazy(() => import('@/pages/sa/FollowUpsPage').then((m) => ({ default: m.FollowUpsPage })));
const PerformancePage = lazy(() => import('@/pages/sa/PerformancePage').then((m) => ({ default: m.PerformancePage })));

// DP pages
const DispatchQueuePage = lazy(() => import('@/pages/dp/DispatchQueuePage').then((m) => ({ default: m.DispatchQueuePage })));
const DispatchLeadDetailPage = lazy(() => import('@/pages/dp/DispatchLeadDetailPage').then((m) => ({ default: m.DispatchLeadDetailPage })));
const DispatchHistoryPage = lazy(() => import('@/pages/dp/DispatchHistoryPage').then((m) => ({ default: m.DispatchHistoryPage })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const withSuspense = (el: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{el}</Suspense>
);

export const router = createBrowserRouter([
  // Public routes — redirect to default route if already logged in
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: withSuspense(<LoginPage />) },
          { path: '/register', element: withSuspense(<RegisterPage />) },
          { path: '/verify-otp', element: withSuspense(<OtpVerificationPage />) },
          { path: '/forgot-password', element: withSuspense(<ForgotPasswordPage />) },
          { path: '/reset-password', element: withSuspense(<ResetPasswordPage />) },
        ],
      },
    ],
  },

  // Admin routes — role QT only
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <Navigate to="/admin/users" replace /> },
          { path: '/admin/users', element: withSuspense(<UsersPage />) },
          { path: '/admin/routing-rules', element: withSuspense(<RoutingRulesPage />) },
          { path: '/admin/master-data', element: withSuspense(<MasterDataPage />) },
          { path: '/admin/stores', element: withSuspense(<StoresPage />) },
          { path: '/admin/teams', element: withSuspense(<TeamsPage />) },
          { path: '/admin/sla-config', element: withSuspense(<SlaConfigPage />) },
        ],
      },
    ],
  },

  // TV routes — role TV only
  {
    element: <TvRoute />,
    children: [
      {
        element: <TvLayout />,
        children: [
          { path: '/tv', element: <Navigate to="/tv/leads" replace /> },
          { path: '/tv/leads', element: withSuspense(<LeadsListPage />) },
          { path: '/tv/leads/:id', element: withSuspense(<LeadDetailPage />) },
        ],
      },
    ],
  },

  // SA routes — role SA only
  {
    element: <SaRoute />,
    children: [
      {
        element: <SaLayout />,
        children: [
          { path: '/sa', element: <Navigate to="/sa/leads" replace /> },
          { path: '/sa/leads', element: withSuspense(<SaleLeadsListPage />) },
          { path: '/sa/leads/:id', element: withSuspense(<SaleLeadDetailPage />) },
          { path: '/sa/follow-ups', element: withSuspense(<FollowUpsPage />) },
          { path: '/sa/performance', element: withSuspense(<PerformancePage />) },
        ],
      },
    ],
  },

  // DP routes — role DP only
  {
    element: <DpRoute />,
    children: [
      {
        element: <DpLayout />,
        children: [
          { path: '/dp', element: <Navigate to="/dp/queue" replace /> },
          { path: '/dp/queue', element: withSuspense(<DispatchQueuePage />) },
          { path: '/dp/queue/:id', element: withSuspense(<DispatchLeadDetailPage />) },
          { path: '/dp/history', element: withSuspense(<DispatchHistoryPage />) },
        ],
      },
    ],
  },

  // Private routes (non-QT, non-TV roles)
  {
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: withSuspense(<DashboardPage />),
      },
    ],
  },
]);
