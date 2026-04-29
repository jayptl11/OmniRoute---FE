import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemberPerformance, useTeamMembers } from '@/features/tn/hooks/useTeamLead';
import { PERIOD_LABELS } from '@/types/teamlead';
import type { Period } from '@/types/teamlead';
import { ChevronLeft, BarChart2 } from 'lucide-react';
import styles from './MemberPerformancePage.module.css';

const PERIODS: Period[] = ['today', 'week', 'month', 'quarter'];

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className={styles.statCard} style={{ '--accent': color ?? '#d97706' } as React.CSSProperties}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
  );
}

export function MemberPerformancePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('month');

  const { data: members } = useTeamMembers();
  const member = members?.find((m) => m.userId === userId);

  const { data, isLoading, isError } = useMemberPerformance(userId ?? '', period);

  const fmt = (n: number | null | undefined, suffix = '') =>
    n !== null && n !== undefined ? `${n.toFixed(1)}${suffix}` : '—';

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/tn/team')}>
        <ChevronLeft size={16} />
        Quay lại
      </button>

      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <BarChart2 size={20} className={styles.titleIcon} />
          <div>
            <h1 className={styles.pageTitle}>
              {member?.fullName ?? data?.fullName ?? 'Thành viên'}
            </h1>
            <p className={styles.pageSubtitle}>Hiệu suất cá nhân trong kỳ</p>
          </div>
        </div>
      </div>

      {/* Period tabs */}
      <div className={styles.periodTabs}>
        {PERIODS.map((p) => (
          <button
            key={p}
            className={`${styles.periodTab} ${period === p ? styles.periodTabActive : ''}`}
            onClick={() => setPeriod(p)}
            id={`member-period-${p}`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {isLoading && <div className={styles.loadingWrap}><div className={styles.spinner} /></div>}

      {isError && (
        <div className={styles.errorWrap}>
          <p>Không thể tải dữ liệu hiệu suất.</p>
        </div>
      )}

      {data && (
        <>
          <div className={styles.statsGrid}>
            <StatCard label="Lead được gán" value={data.totalAssigned} color="#6366f1" />
            <StatCard label="Lead đã xử lý" value={data.totalProcessed} color="#3b82f6" />
            <StatCard label="Chốt thành công" value={data.wonCount} color="#10b981" />
            <StatCard
              label="Tỷ lệ chốt"
              value={`${fmt(data.winRate)}%`}
              color="#d97706"
            />
            <StatCard
              label="TG phản hồi TB"
              value={`${fmt(data.avgResponseTimeMinutes)} phút`}
              color="#f59e0b"
            />
            <StatCard
              label="Vi phạm SLA"
              value={data.slaViolatedCount}
              color="#ef4444"
            />
          </div>

          <p className={styles.periodInfo}>
            Kỳ: {new Date(data.periodStart).toLocaleDateString('vi-VN')} → {new Date(data.periodEnd).toLocaleDateString('vi-VN')}
            {' '}· Cập nhật {new Date(data.generatedAt).toLocaleTimeString('vi-VN')}
          </p>
        </>
      )}
    </div>
  );
}
