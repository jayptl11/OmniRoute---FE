import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth';
import { useStoreCapacity } from '@/features/ql/hooks/useStoreManager';
import { getRoleLabel } from '@/lib/roleChannel';
import {
  LayoutDashboard,
  List,
  Users,
  Clock,
  BarChart2,
  LogOut,
  Store,
  ShieldOff,
  RefreshCw,
} from 'lucide-react';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import styles from './QlLayout.module.css';

const NAV_ITEMS = [
  { to: '/ql/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/ql/leads',     icon: List,            label: 'Danh sách' },
  { to: '/ql/members',   icon: Users,           label: 'Nhân sự' },
  { to: '/ql/history',   icon: Clock,           label: 'Lịch sử' },
  { to: '/ql/report',    icon: BarChart2,       label: 'Báo cáo' },
];

// ── No Store Guard ─────────────────────────────────────────────────────────────
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
            <img src="/viettel-logo.jpg" alt="Viettel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
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
            onClick={() => navigate('/ql/dashboard')}
          >
            <Store size={14} />
            <span>Quản lý đơn vị</span>
          </button>

          <div className={styles.topbarRight}>
            <NotificationBell />
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.username}</span>
              <span className={styles.roleBadge}>
                {getRoleLabel(user?.roleName, user?.roleDisplayName)}
              </span>
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
          <NoStoreGuard />
        </main>
      </div>
    </div>
  );
}
