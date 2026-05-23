import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2, BarChart2, AlertTriangle, X } from 'lucide-react';
import { SearchableUserPicker, type SearchableUserPickerOption } from '@/components/SearchableUserPicker';
import { useAddMember, useRemoveMember, useSearchMembers, useTeamMembers } from '@/features/tn/hooks/useTeamLead';
import { extractErrorMessage } from '@/lib/errors';
import { getRoleLabel } from '@/lib/roleChannel';
import type { AddableUserDto } from '@/types/teamlead';
import styles from './TeamManagementPage.module.css';

function toMemberOption(user: AddableUserDto): SearchableUserPickerOption<AddableUserDto> {
  return {
    value: user.userId,
    label: user.fullName,
    subLabel: `${user.username} · ${getRoleLabel(user.roleName, user.roleDisplayName)}`,
    note: user.hasTeam ? 'Đang ở đội khác - thêm sẽ thất bại' : undefined,
    raw: user,
  };
}

function AddMemberDialog({ onClose }: { onClose: () => void }) {
  const addMember = useAddMember();
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<SearchableUserPickerOption<AddableUserDto> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: results = [], isFetching } = useSearchMembers(searchQuery, pickerOpen);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!selected) {
      setError('Vui lòng chọn một thành viên từ danh sách.');
      return;
    }

    try {
      await addMember.mutateAsync({ userId: selected.raw.userId });
      onClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className={styles.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Thêm thành viên</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.dialogForm}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="add-member-search">
              Tìm thành viên *
            </label>
            <SearchableUserPicker
              id="add-member-search"
              mode="remote"
              placeholder="Nhập tên hoặc username..."
              options={results.map(toMemberOption)}
              selectedOption={selected}
              onChange={(option) => {
                setSelected(option);
                setError('');
              }}
              onSearch={setSearchQuery}
              onOpenChange={setPickerOpen}
              isLoading={isFetching}
              fetchOnOpen
              emptyMessage="Không tìm thấy kết quả."
              showSelectionSummary
              autoFocus
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={styles.dialogActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={addMember.isPending || !selected || selected.raw.hasTeam}
            >
              {addMember.isPending ? 'Đang thêm...' : 'Thêm vào đội'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
    <div className={styles.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
            <h2 className={styles.dialogTitle}>Còn lead đang xử lý</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <div className={styles.dialogForm}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>
            <strong>{memberName}</strong> còn lead đang xử lý. Hãy reassign các lead đó trước khi xóa thành viên.
          </p>
          <div className={styles.dialogActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button type="button" className={styles.warnBtn} onClick={onGoReassign}>
              Đi reassign lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamManagementPage() {
  const navigate = useNavigate();
  const { data: members, isLoading, isError, refetch } = useTeamMembers();
  const removeMember = useRemoveMember();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeLeadsWarning, setActiveLeadsWarning] = useState<{ userId: string; fullName: string } | null>(null);
  const [removeError, setRemoveError] = useState('');

  const handleRemove = async (userId: string, fullName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${fullName}" khỏi đội?`)) {
      return;
    }

    setRemoveError('');

    try {
      await removeMember.mutateAsync(userId);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'ACTIVE_LEADS_WARNING') {
        setActiveLeadsWarning({ userId, fullName });
        return;
      }

      setRemoveError(extractErrorMessage(err));
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
          <span className={styles.memberCount}>{members ? `${members.length} thành viên` : ''}</span>
          <button
            className={styles.addBtn}
            onClick={() => setShowAddDialog(true)}
            id="btn-add-member"
            type="button"
          >
            <Plus size={15} />
            Thêm thành viên
          </button>
        </div>

        {isLoading && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
          </div>
        )}
        {isError && (
          <div className={styles.errorWrap}>
            <p>
              Lỗi tải danh sách.{' '}
              <button onClick={() => refetch()} className={styles.retryBtn} type="button">
                Thử lại
              </button>
            </p>
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
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    Đội chưa có thành viên nào
                  </td>
                </tr>
              )}
              {members.map((member) => (
                <tr key={member.userId}>
                  <td>
                    <div className={styles.memberInfo}>
                      <div className={styles.avatar}>{member.fullName.charAt(0).toUpperCase()}</div>
                      <span className={styles.memberName}>{member.fullName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.roleBadge}>
                      {getRoleLabel(member.roleName, member.roleDisplayName)}
                    </span>
                  </td>
                  <td>
                    <span className={member.isActive ? styles.activeBadge : styles.inactiveBadge}>
                      {member.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td>
                    <span className={styles.workload}>{member.currentWorkload} lead</span>
                  </td>
                  <td className={styles.timeCell}>
                    {member.lastAssignedAt
                      ? new Date(member.lastAssignedAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td>
                    <div className={styles.actionGroup}>
                      <button
                        className={styles.actionBtnGhost}
                        onClick={() => navigate(`/tn/team/${member.userId}/performance`)}
                        id={`btn-perf-${member.userId}`}
                        title="Xem hiệu suất"
                        type="button"
                      >
                        <BarChart2 size={14} />
                        Hiệu suất
                      </button>
                      <button
                        className={styles.actionBtnDanger}
                        onClick={() => handleRemove(member.userId, member.fullName)}
                        id={`btn-remove-${member.userId}`}
                        title="Xóa thành viên"
                        disabled={removeMember.isPending}
                        type="button"
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
