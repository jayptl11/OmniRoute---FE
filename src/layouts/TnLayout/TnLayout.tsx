import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth';
import {
  LayoutDashboard,
  AlertTriangle,
  List,
  BarChart2,
  ArrowUpCircle,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import styles from './TnLayout.module.css';

const NAV_ITEMS = [
  { to: '/tn/overview',         icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/tn/sla',              icon: AlertTriangle,   label: 'SLA Alert' },
  { to: '/tn/leads',            icon: List,            label: 'Danh sách lead' },
  { to: '/tn/report',           icon: BarChart2,       label: 'Báo cáo đội' },
  { to: '/tn/escalate-history', icon: ArrowUpCircle,   label: 'Lịch sử escalate' },
  { to: '/tn/team',             icon: Users,           label: 'Quản lý đội' },
];

export function TnLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoMark}>
            <GitBranch size={16} strokeWidth={2.5} />
          </div>
          {!collapsed && <span className={styles.logoText}>OmniRoute</span>}
        </div>

        <nav className={styles.nav}>
          <p className={styles.navSection}>{!collapsed && 'Team Lead'}</p>
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
            onClick={() => navigate('/tn/overview')}
          >
            <Users size={14} />
            <span>Team Lead</span>
          </button>

          <div className={styles.topbarRight}>
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
