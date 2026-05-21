import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamMembers, useAddMember, useRemoveMember, useSearchMembers } from '@/features/tn/hooks/useTeamLead';
import { extractErrorMessage } from '@/lib/errors';
import type { AddableUserDto } from '@/types/teamlead';
import { Users, Plus, Trash2, BarChart2, AlertTriangle, X } from 'lucide-react';
import styles from './TeamManagementPage.module.css';
import { getRoleLabel } from '@/lib/roleChannel';

// ── Add Member Dialog ─────────────────────────────────────────────────────────

function AddMemberDialog({ onClose }: { onClose: () => void }) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [selected, setSelected] = useState<AddableUserDto | null>(null);
  const [error, setError] = useState('');

  const addMember = useAddMember();
  const { data: results, isFetching } = useSearchMembers(debouncedQ);

  // Debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleSelect = (user: AddableUserDto) => {
    setSelected(user);
    setSearchInput(user.fullName);
    setError('');
  };

  const showDropdown = !selected && results !== undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selected) { setError('Vui lòng chọn một thành viên từ danh sách.'); return; }

    try {
      await addMember.mutateAsync({ userId: selected.userId });
      onClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Thêm thành viên</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.dialogForm}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="add-member-search">Tìm thành viên *</label>
            <div style={{ position: 'relative' }}>
              <input
                id="add-member-search"
                className={styles.input}
                placeholder="Nhập tên hoặc username..."
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setSelected(null); }}
                autoComplete="off"
              />
              {isFetching && (
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#94a3b8' }}>
                  Đang tìm...
                </span>
              )}
            </div>

            {/* Dropdown list */}
            {showDropdown && results.length > 0 && (
              <div className={styles.searchDropdown}>
                {results.map((u) => (
                  <div
                    key={u.userId}
                    className={`${styles.searchItem} ${u.hasTeam ? styles.searchItemWarn : ''}`}
                    onClick={() => handleSelect(u)}
                  >
                    <div className={styles.searchItemLeft}>
                      <span className={styles.searchItemName}>{u.fullName}</span>
                      <span className={styles.searchItemMeta}>
                        {u.username} · {getRoleLabel(u.roleName, u.roleDisplayName)}
                      </span>
                    </div>
                    {u.hasTeam && (
                      <span className={styles.hasTeamBadge}>Đang ở đội khác</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showDropdown && results.length === 0 && searchInput && !isFetching && (
              <p className={styles.searchEmpty}>Không tìm thấy kết quả</p>
            )}
          </div>

          {/* Selected user card */}
          {selected && (
            <div className={`${styles.selectedCard} ${selected.hasTeam ? styles.selectedCardWarn : ''}`}>
              <div>
                <p className={styles.selectedName}>{selected.fullName}</p>
                <p className={styles.selectedMeta}>
                  {selected.username} · {getRoleLabel(selected.roleName, selected.roleDisplayName)}
                </p>
              </div>
              {selected.hasTeam && (
                <p className={styles.selectedWarnMsg}>
                  ⚠ Đang ở đội khác — thêm sẽ thất bại
                </p>
              )}
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => { setSelected(null); setSearchInput(''); }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={styles.dialogActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Hủy</button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={addMember.isPending || !selected || selected.hasTeam}
            >
              {addMember.isPending ? 'Đang thêm...' : 'Thêm vào đội'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Active Leads Warning Dialog ────────────────────────────────────────────────

function ActiveLeadsWarningDialog({
  memberName,
  onClose,
  onGoReassign,
}: {
  memberName: string;
  onClose: () => void;
  onGoReassign: () => void;
}) {
  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
            <h2 className={styles.dialogTitle}>Còn lead đang xử lý</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.dialogForm}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>
            <strong>{memberName}</strong> còn lead đang xử lý. Hãy reassign các lead đó trước khi xóa thành viên.
          </p>
          <div className={styles.dialogActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Hủy</button>
            <button type="button" className={styles.warnBtn} onClick={onGoReassign}>
              Đi reassign lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function TeamManagementPage() {
  const navigate = useNavigate();
  const { data: members, isLoading, isError, refetch } = useTeamMembers();
  const removeMember = useRemoveMember();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeLeadsWarning, setActiveLeadsWarning] = useState<{ userId: string; fullName: string } | null>(null);
  const [removeError, setRemoveError] = useState('');

  const handleRemove = async (userId: string, fullName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${fullName}" khỏi đội?`)) return;
    setRemoveError('');
    try {
      await removeMember.mutateAsync(userId);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'ACTIVE_LEADS_WARNING') {
        setActiveLeadsWarning({ userId, fullName });
      } else {
        setRemoveError(extractErrorMessage(err));
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <Users size={20} className={styles.titleIcon} />
          <h1 className={styles.pageTitle}>Quản lý đội</h1>
        </div>
        <p className={styles.pageSubtitle}>Danh sách thành viên trong đội của bạn</p>
      </div>

      {removeError && (
        <div className={styles.errorBanner}>
          <AlertTriangle size={15} />
          {removeError}
        </div>
      )}

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <span className={styles.memberCount}>
            {members ? `${members.length} thành viên` : ''}
          </span>
          <button
            className={styles.addBtn}
            onClick={() => setShowAddDialog(true)}
            id="btn-add-member"
          >
            <Plus size={15} />
            Thêm thành viên
          </button>
        </div>

        {isLoading && <div className={styles.loadingWrap}><div className={styles.spinner} /></div>}
        {isError && (
          <div className={styles.errorWrap}>
            <p>Lỗi tải danh sách. <button onClick={() => refetch()} className={styles.retryBtn}>Thử lại</button></p>
          </div>
        )}

        {members && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Thành viên</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th>Workload</th>
                <th>Lần gán gần nhất</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr><td colSpan={6} className={styles.emptyRow}>Đội chưa có thành viên nào</td></tr>
              )}
              {members.map((m) => (
                <tr key={m.userId}>
                  <td>
                    <div className={styles.memberInfo}>
                      <div className={styles.avatar}>{m.fullName.charAt(0).toUpperCase()}</div>
                      <span className={styles.memberName}>{m.fullName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.roleBadge}>
                      {getRoleLabel(m.roleName, m.roleDisplayName)}
                    </span>
                  </td>
                  <td>
                    <span className={m.isActive ? styles.activeBadge : styles.inactiveBadge}>
                      {m.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td>
                    <span className={styles.workload}>{m.currentWorkload} lead</span>
                  </td>
                  <td className={styles.timeCell}>
                    {m.lastAssignedAt
                      ? new Date(m.lastAssignedAt).toLocaleString('vi-VN', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td>
                    <div className={styles.actionGroup}>
                      <button
                        className={styles.actionBtnGhost}
                        onClick={() => navigate(`/tn/team/${m.userId}/performance`)}
                        id={`btn-perf-${m.userId}`}
                        title="Xem hiệu suất"
                      >
                        <BarChart2 size={14} />
                        Hiệu suất
                      </button>
                      <button
                        className={styles.actionBtnDanger}
                        onClick={() => handleRemove(m.userId, m.fullName)}
                        id={`btn-remove-${m.userId}`}
                        title="Xóa thành viên"
                        disabled={removeMember.isPending}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddDialog && <AddMemberDialog onClose={() => setShowAddDialog(false)} />}

      {activeLeadsWarning && (
        <ActiveLeadsWarningDialog
          memberName={activeLeadsWarning.fullName}
          onClose={() => setActiveLeadsWarning(null)}
          onGoReassign={() => {
            setActiveLeadsWarning(null);
            navigate('/tn/leads');
          }}
        />
      )}
    </div>
  );
}
