import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAddAiApiKey } from '@/features/qt/hooks/useAiApiKeys';
import type { AiProvider } from '@/types/admin';
import styles from './AiApiKeysPage.module.css';

const providerModels: Record<AiProvider, string> = {
  OpenAI: 'gpt-4o-mini',
  Gemini: 'gemini-1.5-flash',
  Anthropic: 'claude-3-haiku-20240307',
  Groq: 'llama-3.3-70b-versatile',
};

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
    isActive: boolean;
    priority: number;
    config: { model: string; temperature: number; maxTokens: number };
  }>({
    provider: 'OpenAI',
    displayName: '',
    plainKeyValue: '',
    isActive: true,
    priority: 1,
    config: { model: '', temperature: 0, maxTokens: 200 },
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
    if (!form.config.model.trim()) {
      setError('Model là bắt buộc.');
      return;
    }
    try {
      await add.mutateAsync({
        provider: form.provider,
        displayName: form.displayName,
        plainKeyValue: form.plainKeyValue,
        isActive: form.isActive,
        priority: form.priority,
        config: {
          model: form.config.model,
          temperature: form.config.temperature,
          maxTokens: form.config.maxTokens,
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
                onChange={(e) => {
                  const provider = e.target.value as AiProvider;
                  setForm((f) => ({
                    ...f,
                    provider,
                    config: { ...f.config, model: providerModels[provider] },
                  }));
                }}
                required
              >
                <option value="OpenAI">OpenAI</option>
                <option value="Gemini">Gemini</option>
                <option value="Anthropic">Anthropic</option>
                <option value="Groq">Groq</option>
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
                onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
                required
              >
                <option value={1}>1 — Primary (ưu tiên chính)</option>
                <option value={2}>2 — Fallback (dự phòng)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="aak-model">Model *</label>
              <input
                id="aak-model"
                className={styles.input}
                required
                value={form.config.model}
                onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, model: e.target.value } }))}
                placeholder="VD: gpt-4o-mini"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="aak-temperature">
                  Temperature <span className={styles.optional}>(0–2)</span>
                </label>
                <input
                  id="aak-temperature"
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
                <label className={styles.label} htmlFor="aak-maxTokens">
                  Max Tokens <span className={styles.optional}>(tuỳ chọn)</span>
                </label>
                <input
                  id="aak-maxTokens"
                  type="number"
                  className={styles.input}
                  min={1}
                  step={1}
                  value={form.config.maxTokens}
                  onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, maxTokens: Number(e.target.value) } }))}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Kích hoạt ngay
              </label>
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
