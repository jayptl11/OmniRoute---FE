import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { SearchableUserPicker, type SearchableUserPickerOption } from '@/components/SearchableUserPicker';
import { useReassignLead, useSearchReassignTargets } from '@/features/tn/hooks/useTeamLead';
import { extractErrorMessage } from '@/lib/errors';
import { getRoleLabel } from '@/lib/roleChannel';
import type { TeamLeadReassignTargetDto } from '@/types/teamlead';
import styles from './ReassignDialog.module.css';

interface Props {
  leadId: string;
  leadCode: string;
  currentAssigneeName: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

function toReassignOption(
  target: TeamLeadReassignTargetDto,
): SearchableUserPickerOption<TeamLeadReassignTargetDto> {
  return {
    value: target.userId,
    label: target.fullName,
    subLabel: getRoleLabel(target.roleName, target.roleDisplayName),
    raw: target,
  };
}

export function ReassignDialog({ leadId, leadCode, currentAssigneeName, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<SearchableUserPickerOption<TeamLeadReassignTargetDto> | null>(null);

  const { data: targets = [], isFetching } = useSearchReassignTargets(leadId, searchQuery, pickerOpen);
  const reassign = useReassignLead();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!selectedTarget) {
      setError('Vui lòng chọn SA mới.');
      return;
    }

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do reassign.');
      return;
    }

    if (reason.length > 500) {
      setError('Lý do tối đa 500 ký tự.');
      return;
    }

    try {
      await reassign.mutateAsync({
        leadId,
        data: { newUserId: selectedTarget.raw.userId, reason: reason.trim() },
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className={styles.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <div>
            <h2 className={styles.dialogTitle}>Reassign Lead</h2>
            <p className={styles.dialogSub}>{leadCode}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng" type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {currentAssigneeName && (
            <p className={styles.currentAssignee}>
              Đang gán cho: <strong>{currentAssigneeName}</strong>
            </p>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reassign-user">
              Thành viên mới *
            </label>
            <SearchableUserPicker
              id="reassign-user"
              mode="remote"
              placeholder="Tìm theo tên hoặc role..."
              options={targets.map(toReassignOption)}
              selectedOption={selectedTarget}
              onChange={(option) => {
                setSelectedTarget(option);
                setError('');
              }}
              onSearch={setSearchQuery}
              onOpenChange={setPickerOpen}
              isLoading={isFetching}
              fetchOnOpen
              emptyMessage="Không có người nhận phù hợp."
              showSelectionSummary
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reassign-reason">
              Lý do *
            </label>
            <textarea
              id="reassign-reason"
              className={styles.textarea}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập lý do reassign..."
              rows={3}
              maxLength={500}
            />
            <span className={styles.charCount}>{reason.length}/500</span>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={reassign.isPending}>
              {reassign.isPending ? 'Đang xử lý...' : 'Xác nhận Reassign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
