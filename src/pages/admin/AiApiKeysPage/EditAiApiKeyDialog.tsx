import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useUpdateAiApiKey } from '@/features/qt/hooks/useAiApiKeys';
import type { AiApiKeyDto } from '@/types/admin';
import styles from './AiApiKeysPage.module.css';

interface Props {
  keyItem: AiApiKeyDto;
  onClose: () => void;
}

function getErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: { errorMessage?: string } | string } };
  const data = e?.response?.data;
  if (typeof data === 'object' && data?.errorMessage) return data.errorMessage;
  if (typeof data === 'string') return data;
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
}

export function EditAiApiKeyDialog({ keyItem, onClose }: Props) {
  const [form, setForm] = useState({
    displayName: keyItem.displayName,
    plainKeyValue: '',
    priority: keyItem.priority,
  });
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  const update = useUpdateAiApiKey();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.plainKeyValue && form.plainKeyValue.length < 8) {
      setError('API key mới phải có ít nhất 8 ký tự.');
      return;
    }
    try {
      await update.mutateAsync({
        id: keyItem.id,
        data: {
          displayName: form.displayName,
          plainKeyValue: form.plainKeyValue || null,
          priority: form.priority,
        },
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Cập nhật API Key</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.dialogBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Provider</label>
              <input className={styles.input} value={keyItem.provider} disabled />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="eaak-displayName">Tên hiển thị *</label>
              <input
                id="eaak-displayName"
                className={styles.input}
                maxLength={100}
                required
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="eaak-key">
                API Key mới{' '}
                <span className={styles.optional}>(để trống = giữ nguyên)</span>
              </label>
              <div className={styles.pwdRow}>
                <input
                  id="eaak-key"
                  type={showKey ? 'text' : 'password'}
                  className={styles.input}
                  value={form.plainKeyValue}
                  onChange={(e) => setForm((f) => ({ ...f, plainKeyValue: e.target.value }))}
                  placeholder="Để trống = giữ nguyên key cũ"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? 'Ẩn key' : 'Hiện key'}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="eaak-priority">Priority *</label>
              <select
                id="eaak-priority"
                className={styles.input}
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) as 1 | 2 }))}
                required
              >
                <option value={1}>1 — Primary (ưu tiên chính)</option>
                <option value={2}>2 — Fallback (dự phòng)</option>
              </select>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}
          </div>

          <div className={styles.dialogFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Huỷ
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={update.isPending}>
              {update.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
