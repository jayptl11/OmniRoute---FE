import { useState } from 'react';
import { Bell, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import {
  useNotificationConfigs,
  useUpdateNotificationConfig,
} from '@/features/notifications/hooks/useNotifications';
import type { NotificationConfigDto } from '@/types/notifications';
import styles from './NotificationConfigPage.module.css';
import { GlassButton } from '@/components/glass';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  NEW_LEAD:      'Lead mới được gán',
  SLA_WARNING:   'Cảnh báo SLA sắp hết hạn',
  SLA_VIOLATED:  'Vi phạm SLA',
  ESCALATED:     'Lead/ticket được escalate',
  REASSIGNED:    'Lead được reassign',
  FOLLOW_UP_DUE: 'Nhắc nhở follow-up',
};

const ROLE_LABEL: Record<string, string> = {
  TN: 'Trưởng nhóm (TN)',
  QL: 'Quản lý đơn vị (QL)',
  SA: 'Tư vấn viên (SA)',
  CS: 'CSKH (CS)',
  DP: 'Điều phối (DP)',
  TV: 'Tiếp nhận (TV)',
  QT: 'Quản trị (QT)',
  BQL: 'BQL',
};

function groupByType(
  configs: NotificationConfigDto[],
): Map<string, NotificationConfigDto[]> {
  const map = new Map<string, NotificationConfigDto[]>();
  for (const cfg of configs) {
    if (!map.has(cfg.notificationType)) map.set(cfg.notificationType, []);
    map.get(cfg.notificationType)!.push(cfg);
  }
  return map;
}

// ── Toggle row ────────────────────────────────────────────────────────────────

interface ToggleRowProps {
  cfg: NotificationConfigDto;
  onToggle: (id: string, current: boolean) => void;
  isPending: boolean;
}

function ToggleRow({ cfg, onToggle, isPending }: ToggleRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLeft}>
        <span className={styles.roleBadge}>{cfg.targetRole}</span>
        <span className={styles.roleLabel}>
          {ROLE_LABEL[cfg.targetRole] ?? cfg.targetRole}
        </span>
      </div>

      <GlassButton
        id={`toggle-${cfg.id}`}
        className={`${styles.toggle} ${cfg.isEnabled ? styles.toggleOn : styles.toggleOff}`}
        onClick={() => onToggle(cfg.id, cfg.isEnabled)}
        disabled={isPending}
        aria-label={`${cfg.isEnabled ? 'Tắt' : 'Bật'} thông báo ${cfg.notificationType} cho ${cfg.targetRole}`}
        role="switch"
        aria-checked={cfg.isEnabled}
      >
        {cfg.isEnabled ? (
          <ToggleRight size={24} strokeWidth={1.5} />
        ) : (
          <ToggleLeft size={24} strokeWidth={1.5} />
        )}
        <span>{cfg.isEnabled ? 'Bật' : 'Tắt'}</span>
      </GlassButton>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function NotificationConfigPage() {
  const { data: configs = [], isLoading, isError } = useNotificationConfigs();
  const updateConfig = useUpdateNotificationConfig();
  const [localConfigs, setLocalConfigs] = useState<NotificationConfigDto[] | null>(null);

  // Dùng localConfigs nếu đang trong quá trình optimistic update
  const displayConfigs = localConfigs ?? configs;

  const handleToggle = async (id: string, currentValue: boolean) => {
    const newValue = !currentValue;

    // Optimistic update
    setLocalConfigs((prev) =>
      (prev ?? configs).map((c) =>
        c.id === id ? { ...c, isEnabled: newValue } : c,
      ),
    );

    try {
      await updateConfig.mutateAsync({ id, isEnabled: newValue });
    } catch {
      // Rollback
      setLocalConfigs((prev) =>
        (prev ?? configs).map((c) =>
          c.id === id ? { ...c, isEnabled: currentValue } : c,
        ),
      );
    }
  };

  const grouped = groupByType(displayConfigs);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Bell size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Cấu hình thông báo</h1>
            <p className={styles.pageDesc}>
              Bật/tắt thông báo gửi theo từng loại sự kiện và role
            </p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className={styles.loading}>Đang tải cấu hình...</div>
      )}

      {isError && (
        <div className={styles.errorMsg}>
          Không thể tải cấu hình thông báo.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className={styles.tableCard}>
            {Array.from(grouped.entries()).map(([type, rows]) => (
              <div key={type} className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionType}>
                    {TYPE_LABEL[type] ?? type}
                  </span>
                  <span className={styles.sectionBadge}>{type}</span>
                </div>

                <div className={styles.rowList}>
                  {rows.map((cfg) => (
                    <ToggleRow
                      key={cfg.id}
                      cfg={cfg}
                      onToggle={handleToggle}
                      isPending={updateConfig.isPending}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.disclaimer}>
            <Info size={14} strokeWidth={2} className={styles.disclaimerIcon} />
            <p>
              Cấu hình này chỉ ảnh hưởng đến thông báo gửi{' '}
              <strong>theo role</strong> (broadcast). Nhân viên được gán trực
              tiếp vào lead/ticket luôn nhận thông báo bất kể cấu hình trên.
              Hiệu lực sau tối đa 5 phút.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
