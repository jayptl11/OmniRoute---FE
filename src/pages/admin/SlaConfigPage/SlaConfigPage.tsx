import { useState } from 'react';
import { useSlaConfigs, useUpdateSlaConfig, useToggleSlaConfigStatus } from '@/features/admin/hooks/useSlaConfig';
import { extractErrorMessage } from '@/lib/errors';
import type { SlaConfigDto, UpdateSlaConfigRequest } from '@/types/admin';
import { Pencil, X, RefreshCw } from 'lucide-react';
import styles from '../UsersPage/UsersPage.module.css';

const GROUPS = ['Sale', 'Cskh', 'StoreSupport'] as const;
const PRIORITIES = ['High', 'Medium', 'Low'] as const;
const GROUP_LABELS: Record<string, string> = { Sale: 'Sale', Cskh: 'CSKH', StoreSupport: 'Store Support' };
const PRIORITY_COLORS: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

export function SlaConfigPage() {
  const { data: configs = [], isLoading, refetch, isFetching } = useSlaConfigs();
  const updateSla = useUpdateSlaConfig();
  const toggleSla = useToggleSlaConfigStatus();

  const [editTarget, setEditTarget] = useState<SlaConfigDto | null>(null);
  const [form, setForm] = useState({ maxHours: 0, warningBeforeHours: 0 });
  const [error, setError] = useState('');

  const getConfig = (group: string, priority: string) =>
    configs.find((c) => c.assignedGroup === group && c.priorityLevel === priority);

  const openEdit = (cfg: SlaConfigDto) => {
    setEditTarget(cfg);
    setForm({ maxHours: cfg.maxHours, warningBeforeHours: cfg.warningBeforeHours });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.warningBeforeHours >= form.maxHours) {
      setError('Giờ cảnh báo phải nhỏ hơn giờ tối đa.');
      return;
    }

    try {
      const payload: UpdateSlaConfigRequest = {
        maxHours: form.maxHours,
        warningBeforeHours: form.warningBeforeHours,
      };
      await updateSla.mutateAsync({ id: editTarget!.id, data: payload });
      setEditTarget(null);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cấu hình SLA</h1>
          <p className={styles.subtitle}>
            9 cấu hình pre-seed (Sale · CSKH · StoreSupport × High · Medium · Low). Chỉ cập nhật hoặc bật/tắt.
          </p>
        </div>
        <button className={styles.btnIcon} onClick={() => refetch()} title="Làm mới">
          <RefreshCw size={14} className={isFetching ? styles.spinning : ''} />
        </button>
      </div>

      {/* SLA Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className={styles.loadingSpinner} style={{ margin: '0 auto' }} /></div>
      ) : (
        <div className={styles.slaGrid}>
          {/* Header row */}
          <div className={styles.slaHeader} />
          {PRIORITIES.map((p) => (
            <div key={p} className={styles.slaHeader} style={{ color: PRIORITY_COLORS[p] }}>
              {p}
            </div>
          ))}

          {/* Data rows */}
          {GROUPS.map((group) => (
            <>
              <div key={group} className={`${styles.slaCell} ${styles.slaHeader}`}>
                <span className={styles.slaGroupLabel}>{GROUP_LABELS[group]}</span>
              </div>
              {PRIORITIES.map((priority) => {
                const cfg = getConfig(group, priority);
                if (!cfg) return <div key={`${group}-${priority}`} className={styles.slaCell} />;
                return (
                  <div key={cfg.id} className={styles.slaCell}>
                    <p className={styles.slaValue}>{cfg.maxHours}h</p>
                    <p className={styles.slaWarn}>⚠ cảnh báo {cfg.warningBeforeHours}h trước</p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button className={styles.actionBtn} title="Chỉnh sửa" onClick={() => openEdit(cfg)}>
                        <Pencil size={12} />
                      </button>
                      <span className={`${styles.statusBadge} ${cfg.isActive ? styles.statusActive : styles.statusInactive}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleSla.mutate({ id: cfg.id, isActive: !cfg.isActive })}
                        title={cfg.isActive ? 'Tắt' : 'Bật'}
                      >
                        {cfg.isActive ? 'Bật' : 'Tắt'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editTarget && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>
                SLA — {GROUP_LABELS[editTarget.assignedGroup]} · {editTarget.priorityLevel}
              </h2>
              <button className={styles.closeBtn} onClick={() => setEditTarget(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.dialogBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="sla-max">Giờ tối đa *</label>
                    <input id="sla-max" type="number" min={1} className={styles.input} required
                      value={form.maxHours}
                      onChange={(e) => setForm((f) => ({ ...f, maxHours: parseInt(e.target.value, 10) || 1 }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="sla-warn">Giờ cảnh báo trước *</label>
                    <input id="sla-warn" type="number" min={0} className={styles.input} required
                      value={form.warningBeforeHours}
                      onChange={(e) => setForm((f) => ({ ...f, warningBeforeHours: parseInt(e.target.value, 10) || 0 }))} />
                  </div>
                </div>
                <p className={styles.cellMuted}>
                  Quy tắc: Giờ cảnh báo phải nhỏ hơn giờ tối đa.
                </p>
                {error && <p className={styles.errorMsg}>{error}</p>}
              </div>
              <div className={styles.dialogFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setEditTarget(null)}>Huỷ</button>
                <button type="submit" className={styles.btnPrimary} disabled={updateSla.isPending}>
                  {updateSla.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
