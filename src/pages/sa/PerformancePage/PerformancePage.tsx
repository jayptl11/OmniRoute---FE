import { useState } from 'react';
import { ClipboardList, TrendingUp, Trophy, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { usePerformance } from '@/features/sa/hooks/useSaleLeads';
import type { PerformancePeriod } from '@/types/leads';
import styles from './PerformancePage.module.css';

type PeriodDef = { label: string; value: PerformancePeriod };

const PERIODS: PeriodDef[] = [
  { label: 'Tuần', value: 'week' },
  { label: 'Tháng', value: 'month' },
  { label: 'Quý', value: 'quarter' },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtNum(n: number) {
  return n.toLocaleString('vi-VN');
}

export function PerformancePage() {
  const [period, setPeriod] = useState<PerformancePeriod>('month');
  const { data, isLoading } = usePerformance(period);

  const processedRate = data && data.totalAssigned > 0
    ? Math.round((data.totalProcessed / data.totalAssigned) * 100)
    : 0;

  const winRate = data?.winRate ?? 0;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Hiệu suất cá nhân</h1>
          {data && (
            <p className={styles.subtitle}>
              {fmtDate(data.periodStart)} — {fmtDate(data.periodEnd)}
            </p>
          )}
        </div>
        <div className={styles.periodSwitcher}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              id={`period-${p.value}`}
              className={`${styles.periodBtn} ${period === p.value ? styles.periodBtnActive : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : !data ? null : (
        <>
          {/* Stat cards */}
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.iconBlue}`}><ClipboardList size={18} /></div>
              <span className={styles.statLabel}>Tổng lead được gán</span>
              <span className={styles.statValue}>{fmtNum(data.totalAssigned)}</span>
              <span className={styles.statSub}>Trong kỳ</span>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.iconGreen}`}><TrendingUp size={18} /></div>
              <span className={styles.statLabel}>Đã xử lý</span>
              <span className={styles.statValue}>{fmtNum(data.totalProcessed)}</span>
              <span className={styles.statSub}>{processedRate}% tổng số lead</span>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.iconOrange}`}><Trophy size={18} /></div>
              <span className={styles.statLabel}>Chốt thành công</span>
              <span className={styles.statValue}>{fmtNum(data.wonCount)}</span>
              <span className={styles.statSub}>
                Win rate: {data.winRate != null ? `${data.winRate.toFixed(1)}%` : '—'}
              </span>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.iconRed}`}><AlertTriangle size={18} /></div>
              <span className={styles.statLabel}>Vi phạm SLA</span>
              <span className={styles.statValue}>{fmtNum(data.slaViolatedCount)}</span>
              <span className={styles.statSub}>Trong kỳ</span>
            </div>
          </div>

          {/* Win rate progress */}
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span className={styles.progressTitle}>Tỉ lệ chốt deal (Win Rate)</span>
              <span className={styles.progressPercent}>
                {data.winRate != null ? `${data.winRate.toFixed(1)}%` : '—'}
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(winRate, 100)}%` }}
              />
            </div>
            <p className={styles.progressMeta}>
              {data.wonCount} chốt / {data.totalProcessed} đã xử lý
            </p>
          </div>

          {/* Response time */}
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span className={styles.progressTitle} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Clock size={15} /> Thời gian phản hồi trung bình
              </span>
              <span className={styles.progressPercent} style={{ color: '#059669' }}>
                {data.avgResponseTimeMinutes != null
                  ? `${data.avgResponseTimeMinutes.toFixed(1)} phút`
                  : '—'}
              </span>
            </div>
            <p className={styles.progressMeta}>
              Tính từ lúc được gán đến khi liên hệ khách hàng lần đầu
            </p>
          </div>

          {/* Generated at */}
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={12} /> Cập nhật lúc {fmtDate(data.generatedAt)}
          </p>
        </>
      )}
    </div>
  );
}
