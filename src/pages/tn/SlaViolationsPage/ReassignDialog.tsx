import { useState } from 'react';
import { useTeamMembers, useReassignLead } from '@/features/tn/hooks/useTeamLead';
import { X } from 'lucide-react';
import styles from './ReassignDialog.module.css';

interface Props {
  leadId: string;
  leadCode: string;
  currentAssigneeName: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReassignDialog({ leadId, leadCode, currentAssigneeName, onClose, onSuccess }: Props) {
  const [newUserId, setNewUserId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const { data: members } = useTeamMembers();
  const reassign = useReassignLead();

  const activeSAs = (members ?? []).filter((m) => m.isActive && m.roleName === 'SA');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newUserId) { setError('Vui lòng chọn SA mới.'); return; }
    if (!reason.trim()) { setError('Vui lòng nhập lý do reassign.'); return; }
    if (reason.length > 500) { setError('Lý do tối đa 500 ký tự.'); return; }

    try {
      await reassign.mutateAsync({ leadId, data: { newUserId, reason: reason.trim() } });
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.errorMessage;
      setError(msg || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <div>
            <h2 className={styles.dialogTitle}>Reassign Lead</h2>
            <p className={styles.dialogSub}>{leadCode}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
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
            <label className={styles.label} htmlFor="reassign-user">SA mới *</label>
            <select
              id="reassign-user"
              className={styles.select}
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
            >
              <option value="">-- Chọn Sales Associate --</option>
              {activeSAs.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.fullName} (Workload: {m.currentWorkload})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reassign-reason">Lý do *</label>
            <textarea
              id="reassign-reason"
              className={styles.textarea}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={reassign.isPending}
            >
              {reassign.isPending ? 'Đang xử lý...' : 'Xác nhận Reassign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
