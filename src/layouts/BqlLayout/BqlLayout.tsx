import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth';
import {
  LayoutDashboard,
  GitBranch,
  BarChart2,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import styles from './BqlLayout.module.css';

const NAV_ITEMS = [
  { to: '/bql/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/bql/drill-down',      icon: GitBranch,       label: 'Drill-down' },
  { to: '/bql/unit-comparison', icon: BarChart2,       label: 'So sánh đơn vị' },
  { to: '/bql/sales-report',    icon: TrendingUp,      label: 'Báo cáo bán hàng' },
];

export function BqlLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoMark}>
            <Building2 size={15} strokeWidth={2.5} />
          </div>
          {!collapsed && <span className={styles.logoText}>OmniRoute</span>}
        </div>

        <nav className={styles.nav}>
          <p className={styles.navSection}>{!collapsed && 'Ban quản lý'}</p>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={17} strokeWidth={1.8} className={styles.navIcon} />
              {!collapsed && <span className={styles.navLabel}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!collapsed && <span>Thu nhỏ</span>}
        </button>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.breadcrumbBtn}
            onClick={() => navigate('/bql/dashboard')}
          >
            <Building2 size={14} />
            <span>Lãnh đạo</span>
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

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
