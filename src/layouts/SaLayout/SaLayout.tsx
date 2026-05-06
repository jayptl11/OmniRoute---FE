import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth';
import {
  GitBranch,
  ClipboardList,
  Bell,
  BarChart2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import styles from './SaLayout.module.css';

const NAV_ITEMS = [
  { to: '/sa/leads',       icon: ClipboardList, label: 'Danh sách lead' },
  { to: '/sa/follow-ups',  icon: Bell,          label: 'Nhắc nhở' },
  { to: '/sa/performance', icon: BarChart2,      label: 'Hiệu suất' },
];

export function SaLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoMark}>
            <img src="/viettel-logo.jpg" alt="Viettel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {!collapsed && <span className={styles.logoText}>OmniRoute</span>}
        </div>

        <nav className={styles.nav}>
          <p className={styles.navSection}>{!collapsed && 'Kinh doanh'}</p>
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
            onClick={() => navigate('/sa/leads')}
          >
            <TrendingUp size={14} />
            <span>Kinh doanh</span>
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
