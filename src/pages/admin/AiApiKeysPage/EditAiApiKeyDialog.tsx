import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useUpdateAiApiKey } from '@/features/qt/hooks/useAiApiKeys';
import { extractErrorMessage } from '@/lib/errors';
import type { AiApiKeyDto } from '@/types/admin';
import styles from './AiApiKeysPage.module.css';
import { GlassButton } from '@/components/glass';

interface Props {
  keyItem: AiApiKeyDto;
  onClose: () => void;
}

export function EditAiApiKeyDialog({ keyItem, onClose }: Props) {
  const [form, setForm] = useState({
    displayName: keyItem.displayName,
    plainKeyValue: '',
    priority: keyItem.priority,
    config: {
      model: keyItem.config?.model ?? '',
      temperature: keyItem.config?.temperature ?? 0,
      maxTokens: keyItem.config?.maxTokens ?? 200,
    },
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
    if (!form.config.model.trim()) {
      setError('Model là bắt buộc.');
      return;
    }
    try {
      await update.mutateAsync({
        id: keyItem.id,
        data: {
          displayName: form.displayName,
          plainKeyValue: form.plainKeyValue || null,
          priority: form.priority,
          config: {
            model: form.config.model,
            temperature: form.config.temperature,
            maxTokens: form.config.maxTokens,
          },
        },
      });
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Cập nhật API Key</h2>
          <GlassButton className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={16} />
          </GlassButton>
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
                <GlassButton
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? 'Ẩn key' : 'Hiện key'}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </GlassButton>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="eaak-priority">Priority *</label>
              <select
                id="eaak-priority"
                className={styles.input}
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
                required
              >
                <option value={1}>1 — Primary (ưu tiên chính)</option>
                <option value={2}>2 — Fallback (dự phòng)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="eaak-model">Model *</label>
              <input
                id="eaak-model"
                className={styles.input}
                required
                value={form.config.model}
                onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, model: e.target.value } }))}
                placeholder="VD: gpt-4o-mini"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="eaak-temperature">
                  Temperature <span className={styles.optional}>(0–2)</span>
                </label>
                <input
                  id="eaak-temperature"
                  type="number"
                  className={styles.input}
                  min={0}
                  max={2}
                  step={0.1}
                  value={form.config.temperature}
                  onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, temperature: Number(e.target.value) } }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="eaak-maxTokens">
                  Max Tokens <span className={styles.optional}>(tuỳ chọn)</span>
                </label>
                <input
                  id="eaak-maxTokens"
                  type="number"
                  className={styles.input}
                  min={1}
                  step={1}
                  value={form.config.maxTokens}
                  onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, maxTokens: Number(e.target.value) } }))}
                />
              </div>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}
          </div>

          <div className={styles.dialogFooter}>
            <GlassButton type="button" className={styles.btnSecondary} onClick={onClose}>
              Huỷ
            </GlassButton>
            <GlassButton type="submit" className={styles.btnPrimary} disabled={update.isPending}>
              {update.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
