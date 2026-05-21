import { useState } from 'react';
import {
  useUsers,
  useToggleUserStatus,
  useRoles,
} from '@/features/admin/hooks/useUsers';
import { UserFormDialog } from './UserFormDialog';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import type { UserDto, GetUsersParams } from '@/types/admin';
import {
  Plus,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  KeyRound,
  Pencil,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import styles from './UsersPage.module.css';
import { GlassButton, GlassSelect } from '@/components/glass';
import { getRoleLabel } from '@/lib/roleChannel';

const PAGE_SIZE = 20;

export function UsersPage() {
  const [params, setParams] = useState<GetUsersParams>({ page: 1, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserDto | null>(null);
  const [resetTarget, setResetTarget] = useState<UserDto | null>(null);
  const [pendingToggle, setPendingToggle] = useState<{ user: UserDto; isActive: boolean } | null>(null);

  const { data, isLoading, isFetching, refetch } = useUsers(params);
  const toggleStatus = useToggleUserStatus();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();

  const handleFilter = (key: keyof GetUsersParams, value: string) => {
    setParams((p) => ({ ...p, page: 1, [key]: value || undefined }));
  };

  const handleToggleStatus = async (user: UserDto) => {
    const newActive = !user.isActive;
    // If locking, pre-check lead count
    if (!newActive) {
      const result = await toggleStatus.mutateAsync({ id: user.userId, isActive: false });
      if (result.activeLeadCount > 0) {
        setPendingToggle({ user, isActive: false });
        return;
      }
    } else {
      toggleStatus.mutate({ id: user.userId, isActive: true });
    }
  };

  const users = data?.items ?? [];
  const total = data?.totalCount ?? 0;
  const page = params.page ?? 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tài khoản</h1>
          <p className={styles.subtitle}>
            Quản lý toàn bộ tài khoản người dùng trong hệ thống
          </p>
        </div>
        <GlassButton className={styles.btnPrimary} onClick={() => { setEditTarget(null); setFormOpen(true); }}>
          <Plus size={15} />
          Tạo tài khoản
        </GlassButton>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            id="users-search"
            className={styles.searchInput}
            placeholder="Tìm theo username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <GlassSelect
          value={params.roleName ?? ''}
          onChange={(val) => handleFilter('roleName', val)}
          options={[
            { value: '', label: rolesLoading ? 'Đang tải role...' : 'Tất cả role' },
            ...roles.map((r) => ({ value: r.roleName, label: r.displayName }))
          ]}
        />
        <GlassSelect
          value={params.isActive === undefined ? '' : String(params.isActive)}
          onChange={(val) => setParams(p => ({
            ...p, page: 1, isActive: val === '' ? undefined : val === 'true'
          }))}
          options={[
            { value: '', label: 'Tất cả trạng thái' },
            { value: 'true', label: 'Đang hoạt động' },
            { value: 'false', label: 'Đã khóa' }
          ]}
        />
        <GlassButton className={styles.btnIcon} onClick={() => refetch()} title="Làm mới">
          <RefreshCw size={14} className={isFetching ? styles.spinning : ''} />
        </GlassButton>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th>Đăng nhập lần cuối</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  <div className={styles.loadingSpinner} />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  Không có tài khoản nào
                </td>
              </tr>
            ) : (
              users
                .filter(
                  (u) =>
                    !search ||
                    u.username.toLowerCase().includes(search.toLowerCase()) ||
                    u.email.toLowerCase().includes(search.toLowerCase()),
                )
                .map((user) => (
                  <tr key={user.userId}>
                    <td className={styles.cellBold}>{user.username}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td className={styles.cellMuted}>{user.email}</td>
                    <td>
                      <span className={styles.rolePill}>
                        {getRoleLabel(user.roleName, user.roleDisplayName)}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${user.isActive ? styles.statusActive : styles.statusInactive}`}>
                        {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className={styles.cellMuted}>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <GlassButton
                          className={styles.actionBtn}
                          title="Chỉnh sửa"
                          onClick={() => { setEditTarget(user); setFormOpen(true); }}
                        >
                          <Pencil size={13} />
                        </GlassButton>
                        <GlassButton
                          className={styles.actionBtn}
                          title="Reset mật khẩu"
                          onClick={() => setResetTarget(user)}
                        >
                          <KeyRound size={13} />
                        </GlassButton>
                        <GlassButton
                          className={`${styles.actionBtn} ${user.isActive ? styles.actionDanger : styles.actionSuccess}`}
                          title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                          onClick={() => handleToggleStatus(user)}
                          disabled={toggleStatus.isPending}
                        >
                          {user.isActive ? <Lock size={13} /> : <Unlock size={13} />}
                        </GlassButton>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            {total} tài khoản · Trang {page}/{totalPages}
          </span>
          <div className={styles.paginationBtns}>
            <GlassButton
              className={styles.pageBtn}
              disabled={page <= 1}
              onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
            >
              <ChevronLeft size={14} />
            </GlassButton>
            <GlassButton
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
            >
              <ChevronRight size={14} />
            </GlassButton>
          </div>
        </div>
      )}

      {/* Active lead warning dialog */}
      {pendingToggle && (
        <div className={styles.overlay}>
          <div className={styles.confirmDialog}>
            <div className={styles.confirmIcon}>
              <AlertTriangle size={22} />
            </div>
            <h3 className={styles.confirmTitle}>Cảnh báo lead chưa xử lý</h3>
            <p className={styles.confirmText}>
              Tài khoản <strong>{pendingToggle.user.username}</strong> đang có lead
              chưa xử lý. Vui lòng reassign trước khi khóa, hoặc xác nhận khóa ngay.
            </p>
            <div className={styles.confirmActions}>
              <GlassButton className={styles.btnSecondary} onClick={() => setPendingToggle(null)}>
                Huỷ
              </GlassButton>
              <GlassButton
                className={styles.btnDanger}
                onClick={() => {
                  toggleStatus.mutate({ id: pendingToggle.user.userId, isActive: false });
                  setPendingToggle(null);
                }}
              >
                Khóa tài khoản
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      {formOpen && (
        <UserFormDialog
          user={editTarget}
          onClose={() => { setFormOpen(false); setEditTarget(null); }}
        />
      )}

      {/* Reset Password Dialog */}
      {resetTarget && (
        <ResetPasswordDialog
          user={resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  );
}
