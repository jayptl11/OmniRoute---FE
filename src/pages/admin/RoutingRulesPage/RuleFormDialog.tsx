import { useState } from 'react';
import { useCreateRule, useUpdateRule } from '@/features/admin/hooks/useRoutingRules';
import { extractErrorMessage } from '@/lib/errors';
import type { RoutingRuleDto, CreateRuleRequest } from '@/types/admin';
import { AssignedGroup } from '@/types/admin';
import { X, Plus, XCircle } from 'lucide-react';
import styles from '../UsersPage/UsersPage.module.css';
import { GlassButton, GlassSelect } from '@/components/glass';

const CHANNELS = ['Hotline', 'Walkin', 'Webform', 'Chat', 'Email', 'Zalo', 'Referral'];

interface Props {
  rule: RoutingRuleDto | null;
  onClose: () => void;
}

export function RuleFormDialog({ rule, onClose }: Props) {
  const isEdit = !!rule;
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();

  const [form, setForm] = useState({
    ruleName: rule?.ruleName ?? '',
    description: rule?.description ?? '',
    priorityOrder: rule?.priorityOrder ?? 1,
    conditionChannels: rule?.conditionChannels ?? null as string[] | null,
    conditionKeywords: rule?.conditionKeywords ?? null as string[] | null,
    actionGroup: rule ? (AssignedGroup[rule.actionGroup as keyof typeof AssignedGroup] ?? 0) : 0,
    actionTeamId: rule?.actionTeamId ?? '',
  });
  const [kwInput, setKwInput] = useState('');
  const [error, setError] = useState('');

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const toggleChannel = (ch: string) => {
    if (form.conditionChannels === null) {
      set('conditionChannels', [ch]);
    } else if (form.conditionChannels.includes(ch)) {
      const next = form.conditionChannels.filter((c) => c !== ch);
      set('conditionChannels', next.length > 0 ? next : null);
    } else {
      set('conditionChannels', [...form.conditionChannels, ch]);
    }
  };

  const addKeyword = () => {
    const kw = kwInput.trim();
    if (!kw) return;
    set('conditionKeywords', [...(form.conditionKeywords ?? []), kw]);
    setKwInput('');
  };

  const removeKeyword = (kw: string) => {
    const next = (form.conditionKeywords ?? []).filter((k) => k !== kw);
    set('conditionKeywords', next.length > 0 ? next : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload: CreateRuleRequest = {
      ruleName: form.ruleName,
      description: form.description || null,
      priorityOrder: form.priorityOrder,
      conditionChannels: form.conditionChannels,
      conditionKeywords: form.conditionKeywords,
      actionGroup: form.actionGroup,
      actionTeamId: form.actionTeamId || null,
    };

    try {
      if (!isEdit) {
        await createRule.mutateAsync(payload);
      } else {
        await updateRule.mutateAsync({ id: rule.id, data: payload });
      }
      onClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    }
  };

  const isPending = createRule.isPending || updateRule.isPending;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog} style={{ maxWidth: 560 }}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>{isEdit ? 'Chỉnh sửa rule' : 'Tạo rule mới'}</h2>
          <GlassButton className={styles.closeBtn} onClick={onClose}><X size={16} /></GlassButton>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.dialogBody}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="rule-name">Tên rule *</label>
              <input id="rule-name" className={styles.input} required maxLength={200}
                value={form.ruleName} onChange={(e) => set('ruleName', e.target.value)} />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="rule-priority">Thứ tự ưu tiên *</label>
                <input id="rule-priority" type="number" min={1} className={styles.input} required
                  value={form.priorityOrder}
                  onChange={(e) => set('priorityOrder', parseInt(e.target.value, 10) || 1)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="rule-group">Nhóm xử lý *</label>
                <GlassSelect
                  value={String(form.actionGroup)}
                  onChange={(val) => set('actionGroup', parseInt(val, 10))}
                  className={styles.selectFullWidth}
                  options={[
                    { value: '0', label: 'Sale' },
                    { value: '1', label: 'Cskh' },
                    { value: '2', label: 'StoreSupport' }
                  ]}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Kênh áp dụng</label>
              <p className={styles.cellMuted} style={{ marginBottom: 8 }}>
                Không chọn = áp dụng tất cả kênh
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CHANNELS.map((ch) => (
                  <GlassButton key={ch} type="button"
                    className={form.conditionChannels?.includes(ch) ? styles.btnPrimary : styles.btnSecondary}
                    style={{ padding: '4px 12px', fontSize: '0.775rem' }}
                    onClick={() => toggleChannel(ch)}>
                    {ch}
                  </GlassButton>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Từ khóa lọc</label>
              <div className={styles.pwdRow}>
                <input className={styles.input} placeholder="Nhập từ khóa rồi Enter..."
                  value={kwInput}
                  onChange={(e) => setKwInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }} />
                <GlassButton type="button" className={styles.iconBtn} onClick={addKeyword}>
                  <Plus size={14} />
                </GlassButton>
              </div>
              {form.conditionKeywords && form.conditionKeywords.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {form.conditionKeywords.map((kw) => (
                    <span key={kw} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 10px', background: 'rgba(99,102,241,0.1)',
                      borderRadius: 20, fontSize: '0.775rem', color: '#6366f1', fontWeight: 500,
                    }}>
                      {kw}
                      <GlassButton type="button" onClick={() => removeKeyword(kw)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit' }}>
                        <XCircle size={12} />
                      </GlassButton>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="rule-desc">
                Mô tả <span className={styles.optional}>(tuỳ chọn)</span>
              </label>
              <input id="rule-desc" className={styles.input}
                value={form.description}
                onChange={(e) => set('description', e.target.value)} />
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}
          </div>

          <div className={styles.dialogFooter}>
            <GlassButton type="button" className={styles.btnSecondary} onClick={onClose}>Huỷ</GlassButton>
            <GlassButton type="submit" className={styles.btnPrimary} disabled={isPending}>
              {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo rule'}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
