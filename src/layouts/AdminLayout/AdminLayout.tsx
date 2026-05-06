import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth';
import {
  GitBranch,
  Users,
  Shuffle,
  Database,
  Store,
  UsersRound,
  Timer,
  LogOut,
  LayoutDashboard,
  Bell,
  FileText,
  Activity,
  KeyRound,
} from 'lucide-react';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/admin/users',                 icon: Users,         label: 'Tài khoản' },
  { to: '/admin/routing-rules',         icon: Shuffle,       label: 'Phân luồng' },
  { to: '/admin/master-data',           icon: Database,      label: 'Danh mục hệ thống' },
  { to: '/admin/stores',               icon: Store,         label: 'Cửa hàng' },
  { to: '/admin/teams',                icon: UsersRound,    label: 'Nhóm' },
  { to: '/admin/sla-config',           icon: Timer,         label: 'Cấu hình SLA' },
  { to: '/admin/notification-configs', icon: Bell,          label: 'Cấu hình thông báo' },
  { to: '/admin/audit-logs',           icon: FileText,      label: 'Audit Log' },
  { to: '/admin/system-stats',         icon: Activity,      label: 'Thống kê hệ thống' },
  { to: '/admin/ai-api-keys',          icon: KeyRound,      label: 'AI API Keys' },
];

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logoMark}>
            <GitBranch size={20} strokeWidth={2.5} />
          </div>
          <span className={styles.logoText}>OMNIROUTE</span>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <Icon size={20} strokeWidth={2} className={styles.navIcon} />
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <button
            className={styles.breadcrumbBtn}
            onClick={() => navigate('/admin/users')}
          >
            <LayoutDashboard size={14} />
            <span>Admin</span>
          </button>

          <div className={styles.topbarRight}>
            <NotificationBell />
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.username}</span>
              <span className={styles.roleBadge}>{user?.roleName}</span>
            </div>
            <button
              className={styles.logoutBtn}
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              aria-label="Đăng xuất"
            >
              <LogOut size={15} />
              <span>{logout.isPending ? 'Đang xuất...' : 'Đăng xuất'}</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
