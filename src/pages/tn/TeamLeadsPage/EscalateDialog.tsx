import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { SearchableUserPicker, type SearchableUserPickerOption } from '@/components/SearchableUserPicker';
import { useEscalateLead, useEscalateTargets } from '@/features/tn/hooks/useTeamLead';
import { extractErrorMessage } from '@/lib/errors';
import { getRoleLabel } from '@/lib/roleChannel';
import type { EscalateTargetDto } from '@/types/teamlead';
import styles from '../SlaViolationsPage/ReassignDialog.module.css';

interface Props {
  leadId: string;
  leadCode: string;
  onClose: () => void;
  onSuccess: () => void;
}

function toEscalateOption(target: EscalateTargetDto): SearchableUserPickerOption<EscalateTargetDto> {
  return {
    value: target.userId,
    label: target.fullName,
    subLabel: getRoleLabel(target.roleName, target.roleDisplayName),
    raw: target,
  };
}

export function EscalateDialog({ leadId, leadCode, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<SearchableUserPickerOption<EscalateTargetDto> | null>(null);

  const { data: targets = [], isFetching } = useEscalateTargets(searchQuery, pickerOpen);
  const escalate = useEscalateLead();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!selectedTarget) {
      setError('Vui lòng chọn người nhận escalate.');
      return;
    }

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do.');
      return;
    }

    if (reason.length > 500) {
      setError('Lý do tối đa 500 ký tự.');
      return;
    }

    try {
      await escalate.mutateAsync({
        leadId,
        data: { escalateTo: selectedTarget.raw.userId, reason: reason.trim() },
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
            <h2 className={styles.dialogTitle}>Escalate Lead</h2>
            <p className={styles.dialogSub}>{leadCode}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng" type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="escalate-search">
              Người nhận *
            </label>
            <SearchableUserPicker
              id="escalate-search"
              mode="remote"
              placeholder="Tìm theo tên hoặc role..."
              options={targets.map(toEscalateOption)}
              selectedOption={selectedTarget}
              onChange={(option) => {
                setSelectedTarget(option);
                setError('');
              }}
              onSearch={setSearchQuery}
              onOpenChange={setPickerOpen}
              isLoading={isFetching}
              fetchOnOpen
              emptyMessage="Không tìm thấy người nhận phù hợp."
              showSelectionSummary
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="escalate-reason">
              Lý do *
            </label>
            <textarea
              id="escalate-reason"
              className={styles.textarea}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập lý do escalate..."
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
            <button type="submit" className={styles.submitBtn} disabled={escalate.isPending}>
              {escalate.isPending ? 'Đang xử lý...' : 'Xác nhận Escalate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
