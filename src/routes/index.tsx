import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { BqlLayout } from '@/layouts/BqlLayout';
import { TvLayout } from '@/layouts/TvLayout';
import { SaLayout } from '@/layouts/SaLayout';
import { DpLayout } from '@/layouts/DpLayout';
import { CsLayout } from '@/layouts/CsLayout';
import { TnLayout } from '@/layouts/TnLayout';
import { QlLayout } from '@/layouts/QlLayout';
import { PublicRoute } from './PublicRoute';
import { PrivateRoute } from './PrivateRoute';
import { AdminRoute } from './AdminRoute';
import { BqlRoute } from './BqlRoute';
import { TvRoute } from './TvRoute';
import { SaRoute } from './SaRoute';
import { DpRoute } from './DpRoute';
import { CsRoute } from './CsRoute';
import { TnRoute } from './TnRoute';
import { QlRoute } from './QlRoute';
import { SignalRStarter } from './SignalRStarter';

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
const NotificationConfigPage = lazy(() => import('@/pages/admin/NotificationConfigPage').then((m) => ({ default: m.NotificationConfigPage })));

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

// CS pages
const TicketsListPage = lazy(() => import('@/pages/cs/TicketsListPage').then((m) => ({ default: m.TicketsListPage })));
const TicketDetailPage = lazy(() => import('@/pages/cs/TicketDetailPage').then((m) => ({ default: m.TicketDetailPage })));
const CsPerformancePage = lazy(() => import('@/pages/cs/PerformancePage').then((m) => ({ default: m.PerformancePage })));

// TN pages
const TnOverviewPage = lazy(() => import('@/pages/tn/TnOverviewPage').then((m) => ({ default: m.TnOverviewPage })));
const SlaViolationsPage = lazy(() => import('@/pages/tn/SlaViolationsPage').then((m) => ({ default: m.SlaViolationsPage })));
const TeamLeadsPage = lazy(() => import('@/pages/tn/TeamLeadsPage').then((m) => ({ default: m.TeamLeadsPage })));
const TeamReportPage = lazy(() => import('@/pages/tn/TeamReportPage').then((m) => ({ default: m.TeamReportPage })));
const EscalateHistoryPage = lazy(() => import('@/pages/tn/EscalateHistoryPage').then((m) => ({ default: m.EscalateHistoryPage })));
const TeamManagementPage = lazy(() => import('@/pages/tn/TeamManagementPage').then((m) => ({ default: m.TeamManagementPage })));
const MemberPerformancePage = lazy(() => import('@/pages/tn/MemberPerformancePage').then((m) => ({ default: m.MemberPerformancePage })));

// QL pages
const QlDashboardPage = lazy(() => import('@/pages/ql/QlDashboardPage').then((m) => ({ default: m.QlDashboardPage })));
const QlLeadsPage = lazy(() => import('@/pages/ql/QlLeadsPage').then((m) => ({ default: m.QlLeadsPage })));
const QlMembersPage = lazy(() => import('@/pages/ql/QlMembersPage').then((m) => ({ default: m.QlMembersPage })));
const QlHistoryPage = lazy(() => import('@/pages/ql/QlHistoryPage').then((m) => ({ default: m.QlHistoryPage })));
const QlReportPage = lazy(() => import('@/pages/ql/QlReportPage').then((m) => ({ default: m.QlReportPage })));

// BQL pages
const BqlDashboardPage = lazy(() => import('@/pages/bql/BqlDashboardPage').then((m) => ({ default: m.BqlDashboardPage })));
const BqlDrillDownPage = lazy(() => import('@/pages/bql/BqlDrillDownPage').then((m) => ({ default: m.BqlDrillDownPage })));
const BqlUnitComparisonPage = lazy(() => import('@/pages/bql/BqlUnitComparisonPage').then((m) => ({ default: m.BqlUnitComparisonPage })));
const BqlSalesReportPage = lazy(() => import('@/pages/bql/BqlSalesReportPage').then((m) => ({ default: m.BqlSalesReportPage })));

// QT Audit pages
const AuditLogsPage = lazy(() => import('@/pages/admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })));
const SystemStatsPage = lazy(() => import('@/pages/admin/SystemStatsPage').then((m) => ({ default: m.SystemStatsPage })));
const AiApiKeysPage = lazy(() => import('@/pages/admin/AiApiKeysPage').then((m) => ({ default: m.AiApiKeysPage })));

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

  // ── Authenticated routes (SignalRStarter bao ngoài tất cả) ────────────────
  {
    element: <SignalRStarter />,
    children: [
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
              { path: '/admin/notification-configs', element: withSuspense(<NotificationConfigPage />) },
              { path: '/admin/audit-logs', element: withSuspense(<AuditLogsPage />) },
              { path: '/admin/system-stats', element: withSuspense(<SystemStatsPage />) },
              { path: '/admin/ai-api-keys', element: withSuspense(<AiApiKeysPage />) },
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

      // CS routes — role CS only
      {
        element: <CsRoute />,
        children: [
          {
            element: <CsLayout />,
            children: [
              { path: '/cs', element: <Navigate to="/cs/tickets" replace /> },
              { path: '/cs/tickets', element: withSuspense(<TicketsListPage />) },
              { path: '/cs/tickets/:id', element: withSuspense(<TicketDetailPage />) },
              { path: '/cs/performance', element: withSuspense(<CsPerformancePage />) },
            ],
          },
        ],
      },

      // TN routes — role TN only
      {
        element: <TnRoute />,
        children: [
          {
            element: <TnLayout />,
            children: [
              { path: '/tn', element: <Navigate to="/tn/overview" replace /> },
              { path: '/tn/overview', element: withSuspense(<TnOverviewPage />) },
              { path: '/tn/sla', element: withSuspense(<SlaViolationsPage />) },
              { path: '/tn/leads', element: withSuspense(<TeamLeadsPage />) },
              { path: '/tn/report', element: withSuspense(<TeamReportPage />) },
              { path: '/tn/escalate-history', element: withSuspense(<EscalateHistoryPage />) },
              { path: '/tn/team', element: withSuspense(<TeamManagementPage />) },
              { path: '/tn/team/:userId/performance', element: withSuspense(<MemberPerformancePage />) },
            ],
          },
        ],
      },

      // QL routes — role QL only
      {
        element: <QlRoute />,
        children: [
          {
            element: <QlLayout />,
            children: [
              { path: '/ql', element: <Navigate to="/ql/dashboard" replace /> },
              { path: '/ql/dashboard', element: withSuspense(<QlDashboardPage />) },
              { path: '/ql/leads',     element: withSuspense(<QlLeadsPage />) },
              { path: '/ql/members',   element: withSuspense(<QlMembersPage />) },
              { path: '/ql/history',   element: withSuspense(<QlHistoryPage />) },
              { path: '/ql/report',    element: withSuspense(<QlReportPage />) },
            ],
          },
        ],
      },

      // BQL routes — role BQL only
      {
        element: <BqlRoute />,
        children: [
          {
            element: <BqlLayout />,
            children: [
              { path: '/bql', element: <Navigate to="/bql/dashboard" replace /> },
              { path: '/bql/dashboard',       element: withSuspense(<BqlDashboardPage />) },
              { path: '/bql/drill-down',      element: withSuspense(<BqlDrillDownPage />) },
              { path: '/bql/unit-comparison', element: withSuspense(<BqlUnitComparisonPage />) },
              { path: '/bql/sales-report',    element: withSuspense(<BqlSalesReportPage />) },
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
    ],
  },
]);
