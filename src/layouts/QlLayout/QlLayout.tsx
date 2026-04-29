import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth';
import { useStoreCapacity } from '@/features/ql/hooks/useStoreManager';
import {
  LayoutDashboard,
  List,
  Users,
  Clock,
  BarChart2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  ShieldOff,
  RefreshCw,
} from 'lucide-react';
import styles from './QlLayout.module.css';

const NAV_ITEMS = [
  { to: '/ql/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/ql/leads',     icon: List,            label: 'Danh sách lead' },
  { to: '/ql/members',   icon: Users,           label: 'Nhân sự' },
  { to: '/ql/history',   icon: Clock,           label: 'Lịch sử' },
  { to: '/ql/report',    icon: BarChart2,       label: 'Báo cáo' },
];

// ── No Store Guard ─────────────────────────────────────────────────────────────
// Detect NO_STORE / STORE_NOT_FOUND error từ capacity API.
// Nếu có, hiển thị màn hình hướng dẫn thay vì <Outlet />.

function NoStoreGuard() {
  const { error, isError } = useStoreCapacity();
  const logout = useLogout();

  const isNoStore =
    isError &&
    error != null &&
    typeof error === 'object' &&
    'code' in error &&
    ((error as { code: string }).code === 'NO_STORE' ||
      (error as { code: string }).code === 'STORE_NOT_FOUND');

  if (isNoStore) {
    return (
      <div className={styles.noStoreScreen}>
        <div className={styles.noStoreCard}>
          <div className={styles.noStoreIcon}>
            <ShieldOff size={28} />
          </div>
          <h2 className={styles.noStoreTitle}>Chưa được gán vào đơn vị</h2>
          <p className={styles.noStoreDesc}>
            Tài khoản của bạn chưa được Admin gán vào đơn vị (Store) nào.
            Vui lòng liên hệ Quản trị viên (QT) để được assign, sau đó{' '}
            <strong>đăng xuất và đăng nhập lại</strong> để JWT được cập nhật.
          </p>
          <div className={styles.noStoreActions}>
            <button
              className={styles.noStoreLogoutBtn}
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <RefreshCw size={15} />
              {logout.isPending ? 'Đang xuất...' : 'Đăng xuất & Đăng nhập lại'}
            </button>
          </div>
          <p className={styles.noStoreNote}>
            💡 Sau khi QT gán bạn vào Store, bạn cần re-login để JWT nhận claim{' '}
            <code>storeId</code> mới.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

// ── QlLayout ──────────────────────────────────────────────────────────────────

export function QlLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoMark}>
            <Store size={15} strokeWidth={2.5} />
          </div>
          {!collapsed && <span className={styles.logoText}>OmniRoute</span>}
        </div>

        <nav className={styles.nav}>
          <p className={styles.navSection}>{!collapsed && 'Store Manager'}</p>
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
            onClick={() => navigate('/ql/dashboard')}
          >
            <Store size={14} />
            <span>Quản lý đơn vị</span>
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
          <NoStoreGuard />
        </main>
      </div>
    </div>
  );
}
