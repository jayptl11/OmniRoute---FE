import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth';
import {
  ClipboardList,
  BarChart2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Headphones,
  GitBranch,
} from 'lucide-react';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import styles from './CsLayout.module.css';

const NAV_ITEMS = [
  { to: '/cs/tickets',     icon: ClipboardList, label: 'Tickets' },
  { to: '/cs/performance', icon: BarChart2,      label: 'Hiệu suất' },
];

export function CsLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        {/* Logo */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logoMark}>
            <img src="/viettel-logo.jpg" alt="Viettel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {!collapsed && <p className={styles.navSection}>CSKH</p>}
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={20} strokeWidth={2} className={styles.navIcon} />
              {!collapsed && <span className={styles.navLabel}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.breadcrumbBtn}
            onClick={() => navigate('/cs/tickets')}
          >
            <Headphones size={14} />
            <span>Chăm sóc khách hàng</span>
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
