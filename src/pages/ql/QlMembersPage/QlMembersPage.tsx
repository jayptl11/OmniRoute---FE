import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, X, AlertTriangle } from 'lucide-react';
import { SearchableUserPicker, type SearchableUserPickerOption } from '@/components/SearchableUserPicker';
import {
  useAddStoreMember,
  useRemoveStoreMember,
  useSearchStoreMembers,
  useStoreMembers,
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

function toStoreMemberOption(user: AddableStoreUserDto): SearchableUserPickerOption<AddableStoreUserDto> {
  return {
    value: user.userId,
    label: user.fullName,
    subLabel: `${user.username} · ${getRoleLabel(user.roleName, user.roleDisplayName)}`,
    note: user.hasStore ? 'Đang thuộc đơn vị khác' : undefined,
    raw: user,
  };
}

interface AddMemberDialogProps {
  onClose: () => void;
}

function AddMemberDialog({ onClose }: AddMemberDialogProps) {
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchableUserPickerOption<AddableStoreUserDto> | null>(null);
  const addMember = useAddStoreMember();

  const { data: results = [], isFetching } = useSearchStoreMembers(
    searchQuery ? { q: searchQuery } : undefined,
    pickerOpen,
  );

  const handleAdd = async () => {
    if (!selectedUser) {
      setErrorMsg('Vui lòng chọn người dùng.');
      return;
    }

    setErrorMsg('');

    try {
      await addMember.mutateAsync({ userId: selectedUser.raw.userId });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err));
    }
  };

  return (
    <div className={styles.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h3 className={styles.dialogTitle}>Thêm nhân sự</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>

        <div className={styles.dialogBody}>
          <SearchableUserPicker
            mode="remote"
            placeholder="Tìm theo tên hoặc username..."
            options={results.map(toStoreMemberOption)}
            selectedOption={selectedUser}
            onChange={(option) => {
              setSelectedUser(option);
              setErrorMsg('');
            }}
            onSearch={setSearchQuery}
            onOpenChange={setPickerOpen}
            isLoading={isFetching}
            fetchOnOpen
            emptyMessage="Không tìm thấy kết quả."
            showSelectionSummary
            autoFocus
          />

          {errorMsg && <p className={styles.formError}>{errorMsg}</p>}
        </div>

        <div className={styles.dialogFooter}>
          <button className={styles.cancelBtn} onClick={onClose} type="button">
            Hủy
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleAdd}
            disabled={!selectedUser || addMember.isPending}
            type="button"
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
    <div className={styles.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h3 className={styles.dialogTitle}>Nhân sự còn lead đang xử lý</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>
        <div className={styles.dialogBody}>
          <div className={styles.warningBox}>
            <AlertTriangle size={20} className={styles.warningIcon} />
            <p className={styles.warningText}>
              <strong>{userName}</strong> còn lead đang xử lý. Bạn cần reassign toàn bộ lead cho người khác trước khi
              xóa khỏi đơn vị.
            </p>
          </div>
        </div>
        <div className={styles.dialogFooter}>
          <button className={styles.cancelBtn} onClick={onClose} type="button">
            Hủy
          </button>
          <button
            className={styles.warningBtn}
            onClick={() => {
              onClose();
              navigate(`/ql/leads?assignedUserId=${userId}`);
            }}
            type="button"
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
  const [warningMember, setWarningMember] = useState<{ userId: string; userName: string } | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const { data: members = [], isLoading, isError } = useStoreMembers();
  const removeMember = useRemoveStoreMember();

  const showToast = (message: string) => {
    setToastMsg(message);
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
        <button className={styles.addBtn} onClick={() => setShowAddDialog(true)} type="button">
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
              {members.map((member) => (
                <tr key={member.userId} className={member.isActive ? '' : styles.rowInactive}>
                  <td className={styles.nameCell}>{member.fullName}</td>
                  <td>
                    <span className={styles.roleBadge}>
                      {getRoleLabel(member.roleName, member.roleDisplayName)}
                    </span>
                  </td>
                  <td>
                    {member.currentWorkload > 0 ? (
                      <span className={styles.workloadBadge}>{member.currentWorkload}</span>
                    ) : (
                      <span className={styles.workloadEmpty}>0</span>
                    )}
                  </td>
                  <td className={styles.dateCell}>{formatDate(member.lastAssignedAt)}</td>
                  <td>
                    {member.isActive ? (
                      <span className={styles.activeTag}>Hoạt động</span>
                    ) : (
                      <span className={styles.inactiveTag}>Đã khóa</span>
                    )}
                  </td>
                  <td>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemove(member)}
                      disabled={removeMember.isPending}
                      title="Xóa khỏi đơn vị"
                      type="button"
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
