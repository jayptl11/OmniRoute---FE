import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth';
import { useTeamLeadOverview } from '@/features/tn/hooks/useTeamLead';
import { isAppError } from '@/types/common';
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
  ShieldOff,
  RefreshCw,
} from 'lucide-react';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import styles from './TnLayout.module.css';

const NAV_ITEMS = [
  { to: '/tn/overview',         icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/tn/sla',              icon: AlertTriangle,   label: 'SLA Alert' },
  { to: '/tn/leads',            icon: List,            label: 'Danh sách lead' },
  { to: '/tn/report',           icon: BarChart2,       label: 'Báo cáo đội' },
  { to: '/tn/escalate-history', icon: ArrowUpCircle,   label: 'Lịch sử escalate' },
  { to: '/tn/team',             icon: Users,           label: 'Quản lý đội' },
];

// ── No Team Guard ─────────────────────────────────────────────────────────────
// Gọi overview để detect lỗi NO_TEAM. Nếu có, hiện banner hướng dẫn re-login
// thay vì render <Outlet /> với dữ liệu lỗi.

function NoTeamGuard() {
  const { error, isError } = useTeamLeadOverview();
  const logout = useLogout();

  const isNoTeam =
    isError &&
    isAppError(error) &&
    error.code === 'NO_TEAM';

  if (isNoTeam) {
    return (
      <div className={styles.noTeamScreen}>
        <div className={styles.noTeamCard}>
          <div className={styles.noTeamIcon}>
            <ShieldOff size={32} />
          </div>
          <h2 className={styles.noTeamTitle}>Chưa được gán vào đội</h2>
          <p className={styles.noTeamDesc}>
            Tài khoản của bạn chưa được Admin gán vào đội nào.
            Vui lòng liên hệ Quản trị viên (QT) để được assign, sau đó{' '}
            <strong>đăng xuất và đăng nhập lại</strong> để JWT được cập nhật.
          </p>
          <div className={styles.noTeamActions}>
            <button
              className={styles.noTeamLogoutBtn}
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <RefreshCw size={15} />
              {logout.isPending ? 'Đang xuất...' : 'Đăng xuất & Đăng nhập lại'}
            </button>
          </div>
          <p className={styles.noTeamNote}>
            💡 Sau khi QT tạo đội và set bạn là Team Lead, bạn cần re-login để JWT nhận claim{' '}
            <code>teamId</code> mới.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

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
          <NoTeamGuard />
        </main>
      </div>
    </div>
  );
}
