import { useState } from 'react';
import { useAddLeadNote } from '@/features/tn/hooks/useTeamLead';
import { X, Lock } from 'lucide-react';
import styles from '../SlaViolationsPage/ReassignDialog.module.css';

interface Props {
  leadId: string;
  leadCode: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function InternalNoteDialog({ leadId, leadCode, onClose, onSuccess }: Props) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const addNote = useAddLeadNote();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!content.trim()) { setError('Vui lòng nhập nội dung ghi chú.'); return; }
    if (content.length > 2000) { setError('Ghi chú tối đa 2000 ký tự.'); return; }

    try {
      await addNote.mutateAsync({ leadId, data: { content: content.trim() } });
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
            <h2 className={styles.dialogTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={16} style={{ color: '#d97706' }} />
              Ghi chú nội bộ
            </h2>
            <p className={styles.dialogSub}>{leadCode} — Chỉ hiển thị cho TN / QL / QT</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="note-content">Nội dung *</label>
            <textarea
              id="note-content"
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập ghi chú nội bộ..."
              rows={5}
              maxLength={2000}
            />
            <span className={styles.charCount}>{content.length}/2000</span>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={addNote.isPending}
            >
              {addNote.isPending ? 'Đang lưu...' : 'Lưu ghi chú'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
