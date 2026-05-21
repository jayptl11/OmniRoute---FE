import { useState } from 'react';
import { useEscalateLead, useEscalateTargets } from '@/features/tn/hooks/useTeamLead';
import { extractErrorMessage } from '@/lib/errors';
import { X, Search } from 'lucide-react';
import styles from '../SlaViolationsPage/ReassignDialog.module.css';
import { getRoleLabel } from '@/lib/roleChannel';

interface Props {
  leadId: string;
  leadCode: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EscalateDialog({ leadId, leadCode, onClose, onSuccess }: Props) {
  const [escalateTo, setEscalateTo] = useState('');
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const { data: targets } = useEscalateTargets();
  const escalate = useEscalateLead();

  const filtered = (targets ?? []).filter(
    (t) =>
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.roleName.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = targets?.find((t) => t.userId === escalateTo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!escalateTo) { setError('Vui lòng chọn người nhận escalate.'); return; }
    if (!reason.trim()) { setError('Vui lòng nhập lý do.'); return; }
    if (reason.length > 500) { setError('Lý do tối đa 500 ký tự.'); return; }

    try {
      await escalate.mutateAsync({ leadId, data: { escalateTo, reason: reason.trim() } });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <div>
            <h2 className={styles.dialogTitle}>Escalate Lead</h2>
            <p className={styles.dialogSub}>{leadCode} — Không đổi trạng thái, chỉ ghi log</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Người nhận *</label>
            {/* Search bar */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                className={styles.input}
                style={{ paddingLeft: 30 }}
                placeholder="Tìm theo tên hoặc role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="escalate-search"
              />
            </div>
            {/* Dropdown list */}
            <div style={{
              maxHeight: 180,
              overflowY: 'auto',
              border: '1.5px solid #e2e8f0',
              borderRadius: 8,
              background: '#fff',
            }}>
              {filtered.length === 0 && (
                <p style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
                  Không tìm thấy
                </p>
              )}
              {filtered.map((t) => (
                <div
                  key={t.userId}
                  onClick={() => { setEscalateTo(t.userId); setSearch(''); }}
                  style={{
                    padding: '9px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: escalateTo === t.userId ? 'rgba(217,119,6,0.08)' : 'transparent',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: escalateTo === t.userId ? 600 : 400 }}>
                    {t.fullName}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '1px 7px',
                    borderRadius: 20,
                    background: '#f1f5f9',
                    color: '#475569',
                  }}>
                    {getRoleLabel(t.roleName, t.roleDisplayName)}
                  </span>
                </div>
              ))}
            </div>
            {selected && (
              <p style={{ fontSize: '0.8rem', color: '#16a34a', margin: 0 }}>
                ✓ Đã chọn: <strong>{selected.fullName}</strong> ({getRoleLabel(selected.roleName, selected.roleDisplayName)})
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="escalate-reason">Lý do *</label>
            <textarea
              id="escalate-reason"
              className={styles.textarea}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={escalate.isPending}
            >
              {escalate.isPending ? 'Đang xử lý...' : 'Xác nhận Escalate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
