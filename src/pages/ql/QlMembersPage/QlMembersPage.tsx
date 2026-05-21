import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, X, AlertTriangle, Search } from 'lucide-react';
import {
  useStoreMembers,
  useSearchStoreMembers,
  useAddStoreMember,
  useRemoveStoreMember,
} from '@/features/ql/hooks/useStoreManager';
import { extractErrorMessage } from '@/lib/errors';
import { getRoleLabel } from '@/lib/roleChannel';
import type { AddableStoreUserDto, StoreStaffDto } from '@/types/storemanager';
import styles from './QlMembersPage.module.css';

function formatDate(iso: string | null): string {
  if (!iso) return 'Chưa có lead';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

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
    debouncedQ ? { q: debouncedQ } : undefined,
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(q), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const handleAdd = async () => {
    if (!selectedUser) {
      setErrorMsg('Vui lòng chọn người dùng.');
      return;
    }

    setErrorMsg('');

    try {
      await addMember.mutateAsync({ userId: selectedUser.userId });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err));
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h3 className={styles.dialogTitle}>Thêm nhân sự</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.dialogBody}>
          <div className={styles.searchGroup}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Tìm theo tên hoặc username..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSelectedUser(null);
              }}
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
                className={`${styles.resultItem} ${
                  selectedUser?.userId === u.userId ? styles.resultSelected : ''
                }`}
                onClick={() => setSelectedUser(u)}
              >
                <div className={styles.resultInfo}>
                  <span className={styles.resultName}>{u.fullName}</span>
                  <span className={styles.resultMeta}>
                    {u.username} · {getRoleLabel(u.roleName, u.roleDisplayName)}
                  </span>
                </div>
                {u.hasStore && (
                  <span className={styles.hasStoreWarning} title="Dang thuoc don vi khac">
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
                <span className={styles.warnText}> · Đang thuộc đơn vị khác</span>
              )}
            </div>
          )}

          {errorMsg && <p className={styles.formError}>{errorMsg}</p>}
        </div>

        <div className={styles.dialogFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Hủy
          </button>
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
          <h3 className={styles.dialogTitle}>Nhân sự còn lead đang xử lý</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className={styles.dialogBody}>
          <div className={styles.warningBox}>
            <AlertTriangle size={20} className={styles.warningIcon} />
            <p className={styles.warningText}>
              <strong>{userName}</strong> còn lead đang xử lý. Bạn cần reassign toàn bộ lead cho
              người khác trước khi xóa khỏi đơn vị.
            </p>
          </div>
        </div>
        <div className={styles.dialogFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Hủy
          </button>
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

export function QlMembersPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [warningMember, setWarningMember] = useState<{ userId: string; userName: string } | null>(
    null,
  );
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
      showToast(`Da xoa ${member.fullName} khoi don vi.`);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;

      if (code === 'ACTIVE_LEADS_WARNING') {
        setWarningMember({ userId: member.userId, userName: member.fullName });
        return;
      }

      showToast(extractErrorMessage(err));
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
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    Chưa có nhân sự nào trong đơn vị.
                  </td>
                </tr>
              )}
              {members.map((m: StoreStaffDto) => (
                <tr key={m.userId} className={m.isActive ? '' : styles.rowInactive}>
                  <td className={styles.nameCell}>{m.fullName}</td>
                  <td>
                    <span className={styles.roleBadge}>
                      {getRoleLabel(m.roleName, m.roleDisplayName)}
                    </span>
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

      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}
    </div>
  );
}
