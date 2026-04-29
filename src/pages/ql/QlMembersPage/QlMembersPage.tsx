import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useStoreMembers,
  useSearchStoreMembers,
  useAddStoreMember,
  useRemoveStoreMember,
} from '@/features/ql/hooks/useStoreManager';
import type { StoreStaffDto, AddableStoreUserDto } from '@/types/storemanager';
import { UserPlus, Trash2, X, AlertTriangle, Search } from 'lucide-react';
import styles from './QlMembersPage.module.css';

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return 'Chưa có lead';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

function roleLabel(role: string | null): string {
  if (!role) return '—';
  const map: Record<string, string> = { SA: 'Tư vấn', CS: 'CSKH', DP: 'Dispatch' };
  return map[role] ?? role;
}

// ── Add Member Dialog ─────────────────────────────────────────────────────────

interface AddMemberDialogProps {
  onClose: () => void;
}

function AddMemberDialog({ onClose }: AddMemberDialogProps) {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [selectedUser, setSelectedUser] = useState<AddableStoreUserDto | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addMember = useAddStoreMember();

  const { data: results = [], isFetching } = useSearchStoreMembers(
    debouncedQ ? { q: debouncedQ } : undefined
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(q), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  const handleAdd = async () => {
    if (!selectedUser) { setErrorMsg('Vui lòng chọn người dùng.'); return; }
    setErrorMsg('');
    try {
      await addMember.mutateAsync({ userId: selectedUser.userId });
      onClose();
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { errorCode?: string } } })?.response?.data?.errorCode;
      const messages: Record<string, string> = {
        USER_NOT_FOUND: 'Không tìm thấy người dùng.',
        USER_INACTIVE: 'Người dùng đã bị khóa, không thể thêm.',
        INVALID_ROLE: 'Role không hợp lệ (chỉ SA/CS/DP).',
        ALREADY_IN_STORE: 'Nhân viên đã có mặt trong đơn vị.',
        IN_OTHER_STORE: 'Nhân viên đang thuộc đơn vị khác, cần xóa khỏi đơn vị đó trước.',
      };
      setErrorMsg(messages[code ?? ''] ?? 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h3 className={styles.dialogTitle}>Thêm nhân sự</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        <div className={styles.dialogBody}>
          <div className={styles.searchGroup}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Tìm theo tên hoặc username..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setSelectedUser(null); }}
              autoFocus
            />
            {isFetching && <span className={styles.searching}>...</span>}
          </div>

          <div className={styles.resultList}>
            {results.length === 0 && debouncedQ && !isFetching && (
              <p className={styles.noResults}>Không tìm thấy kết quả.</p>
            )}
            {results.map((u: AddableStoreUserDto) => (
              <button
                key={u.userId}
                className={`${styles.resultItem} ${selectedUser?.userId === u.userId ? styles.resultSelected : ''}`}
                onClick={() => setSelectedUser(u)}
              >
                <div className={styles.resultInfo}>
                  <span className={styles.resultName}>{u.fullName}</span>
                  <span className={styles.resultMeta}>
                    {u.username} · {roleLabel(u.roleName)}
                  </span>
                </div>
                {u.hasStore && (
                  <span className={styles.hasStoreWarning} title="Đang thuộc đơn vị khác">
                    <AlertTriangle size={13} /> Đơn vị khác
                  </span>
                )}
              </button>
            ))}
          </div>

          {selectedUser && (
            <div className={styles.selectedBadge}>
              Đã chọn: <strong>{selectedUser.fullName}</strong>
              {selectedUser.hasStore && (
                <span className={styles.warnText}> · ⚠️ Đang thuộc đơn vị khác</span>
              )}
            </div>
          )}

          {errorMsg && <p className={styles.formError}>{errorMsg}</p>}
        </div>

        <div className={styles.dialogFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Hủy</button>
          <button
            className={styles.submitBtn}
            onClick={handleAdd}
            disabled={!selectedUser || addMember.isPending}
          >
            {addMember.isPending ? 'Đang thêm...' : 'Thêm nhân sự'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Active Leads Warning Dialog ───────────────────────────────────────────────

interface ActiveLeadsWarningProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

function ActiveLeadsWarningDialog({ userId, userName, onClose }: ActiveLeadsWarningProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h3 className={styles.dialogTitle}>⚠️ Nhân sự còn lead đang xử lý</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={styles.dialogBody}>
          <div className={styles.warningBox}>
            <AlertTriangle size={20} className={styles.warningIcon} />
            <p className={styles.warningText}>
              <strong>{userName}</strong> còn lead đang xử lý. Bạn cần reassign toàn bộ lead
              cho người khác trước khi xóa khỏi đơn vị.
            </p>
          </div>
        </div>
        <div className={styles.dialogFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Hủy</button>
          <button
            className={styles.warningBtn}
            onClick={() => {
              onClose();
              navigate(`/ql/leads?assignedUserId=${userId}`);
            }}
          >
            Đi đến danh sách lead
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export function QlMembersPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [warningMember, setWarningMember] = useState<{ userId: string; userName: string } | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const { data: members = [], isLoading, isError } = useStoreMembers();
  const removeMember = useRemoveStoreMember();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleRemove = async (member: StoreStaffDto) => {
    try {
      await removeMember.mutateAsync(member.userId);
      showToast(`Đã xóa ${member.fullName} khỏi đơn vị.`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const code = (err as { response?: { data?: { errorCode?: string } } })?.response?.data?.errorCode;

      if (status === 409 && code === 'ACTIVE_LEADS_WARNING') {
        setWarningMember({ userId: member.userId, userName: member.fullName });
        return;
      }
      const messages: Record<string, string> = {
        USER_NOT_FOUND: 'Không tìm thấy người dùng.',
        USER_NOT_IN_STORE: 'Nhân viên không thuộc đơn vị này.',
      };
      showToast(messages[code ?? ''] ?? 'Có lỗi xảy ra.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Nhân sự đơn vị</h1>
          <p className={styles.pageDesc}>Quản lý danh sách nhân viên trong đơn vị của bạn</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAddDialog(true)}>
          <UserPlus size={15} />
          Thêm nhân sự
        </button>
      </div>

      {isLoading && <div className={styles.loading}>Đang tải...</div>}
      {isError && <div className={styles.errorMsg}>Không thể tải danh sách nhân sự.</div>}

      {!isLoading && !isError && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nhân sự</th>
                <th>Vai trò</th>
                <th>Lead đang xử lý</th>
                <th>Giao lead gần nhất</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr><td colSpan={6} className={styles.emptyCell}>Chưa có nhân sự nào trong đơn vị.</td></tr>
              )}
              {members.map((m: StoreStaffDto) => (
                <tr key={m.userId} className={m.isActive ? '' : styles.rowInactive}>
                  <td className={styles.nameCell}>{m.fullName}</td>
                  <td>
                    <span className={styles.roleBadge}>{roleLabel(m.roleName)}</span>
                  </td>
                  <td>
                    {m.currentWorkload > 0 ? (
                      <span className={styles.workloadBadge}>{m.currentWorkload}</span>
                    ) : (
                      <span className={styles.workloadEmpty}>0</span>
                    )}
                  </td>
                  <td className={styles.dateCell}>{formatDate(m.lastAssignedAt)}</td>
                  <td>
                    {m.isActive ? (
                      <span className={styles.activeTag}>Hoạt động</span>
                    ) : (
                      <span className={styles.inactiveTag}>Đã khóa</span>
                    )}
                  </td>
                  <td>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemove(m)}
                      disabled={removeMember.isPending}
                      title="Xóa khỏi đơn vị"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddDialog && <AddMemberDialog onClose={() => setShowAddDialog(false)} />}
      {warningMember && (
        <ActiveLeadsWarningDialog
          userId={warningMember.userId}
          userName={warningMember.userName}
          onClose={() => setWarningMember(null)}
        />
      )}

      {toastMsg && (
        <div className={styles.toast}>{toastMsg}</div>
      )}
    </div>
  );
}
