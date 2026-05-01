import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAddAiApiKey } from '@/features/qt/hooks/useAiApiKeys';
import type { AiProvider } from '@/types/admin';
import styles from './AiApiKeysPage.module.css';

interface Props {
  onClose: () => void;
}

function getErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: { errorMessage?: string } | string } };
  const data = e?.response?.data;
  if (typeof data === 'object' && data?.errorMessage) return data.errorMessage;
  if (typeof data === 'string') return data;
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
}

export function AddAiApiKeyDialog({ onClose }: Props) {
  const [form, setForm] = useState<{
    provider: AiProvider;
    displayName: string;
    plainKeyValue: string;
    priority: 1 | 2;
  }>({
    provider: 'OpenAI',
    displayName: '',
    plainKeyValue: '',
    priority: 1,
  });
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  const add = useAddAiApiKey();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.plainKeyValue.length < 8) {
      setError('API key phải có ít nhất 8 ký tự.');
      return;
    }
    try {
      await add.mutateAsync(form);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Thêm AI API Key</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.dialogBody}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="aak-provider">Provider *</label>
              <select
                id="aak-provider"
                className={styles.input}
                value={form.provider}
                onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value as AiProvider }))}
                required
              >
                <option value="OpenAI">OpenAI</option>
                <option value="Gemini">Gemini</option>
                <option value="Anthropic">Anthropic</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="aak-displayName">Tên hiển thị *</label>
              <input
                id="aak-displayName"
                className={styles.input}
                maxLength={100}
                required
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="VD: Key chính production"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="aak-key">API Key *</label>
              <div className={styles.pwdRow}>
                <input
                  id="aak-key"
                  type={showKey ? 'text' : 'password'}
                  className={styles.input}
                  required
                  minLength={8}
                  value={form.plainKeyValue}
                  onChange={(e) => setForm((f) => ({ ...f, plainKeyValue: e.target.value }))}
                  placeholder="sk-proj-..."
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
              <label className={styles.label} htmlFor="aak-priority">Priority *</label>
              <select
                id="aak-priority"
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
            <button type="submit" className={styles.btnPrimary} disabled={add.isPending}>
              {add.isPending ? 'Đang lưu...' : 'Thêm key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
