import { useState } from 'react';
import { AlertTriangle, Star, Clock } from 'lucide-react';
import { useTicketPerformance } from '@/features/cs/hooks/useTickets';
import type { TicketPerformancePeriod } from '@/types/tickets';
import styles from './PerformancePage.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

// onTimeRate từ API là 0–100 (đã là phần trăm, không phải 0.0–1.0)
function onTimeRateClass(rate: number): string {
  if (rate >= 90) return styles.rateGreen;
  if (rate >= 70) return styles.rateYellow;
  return styles.rateRed;
}

function StarRating({ score }: { score: number | null }) {
  if (score === null) return <span className={styles.noData}>Chưa có dữ liệu</span>;
  const rounded = Math.round(score);
  return (
    <div className={styles.starsRow}>
      {[1,2,3,4,5].map((s) => (
        <Star
          key={s}
          size={20}
          fill={s <= rounded ? '#f59e0b' : 'transparent'}
          color={s <= rounded ? '#f59e0b' : '#d1d5db'}
        />
      ))}
      <span className={styles.scoreValue}>{score.toFixed(1)}/5</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PERIODS: { value: TicketPerformancePeriod; label: string }[] = [
  { value: 'week',    label: 'Tuần này' },
  { value: 'month',   label: 'Tháng này' },
  { value: 'quarter', label: 'Quý này' },
];

export function PerformancePage() {
  const [period, setPeriod] = useState<TicketPerformancePeriod>('month');
  const { data, isLoading, isError } = useTicketPerformance(period);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Hiệu suất cá nhân</h1>
          <p className={styles.subtitle}>
            Thống kê xử lý ticket của bạn theo kỳ chọn
          </p>
        </div>
        <div className={styles.periodSwitcher}>
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              id={`cs-perf-period-${value}`}
              className={`${styles.periodBtn} ${period === value ? styles.periodBtnActive : ''}`}
              onClick={() => setPeriod(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className={styles.centerState}>
          <div className={styles.loadingSpinner} />
        </div>
      )}

      {isError && (
        <div className={styles.centerState}>
          <AlertTriangle size={28} color="#ef4444" />
          <p>Không thể tải dữ liệu hiệu suất</p>
        </div>
      )}

      {data && (
        <>
          {/* Date range */}
          <p className={styles.dateRange}>
            Kỳ: {formatDate(data.periodStart)} — {formatDate(data.periodEnd)}
          </p>

          {/* Metric cards — row 1 */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Tổng ticket được gán</span>
              <span className={styles.metricValue}>{data.totalAssigned}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Đã xử lý</span>
              <span className={`${styles.metricValue} ${styles.valueGreen}`}>{data.totalProcessed}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Resolved</span>
              <span className={styles.metricValue}>{data.resolvedCount}</span>
            </div>
          </div>

          {/* SLA Warning */}
          {data.slaViolatedCount > 0 && (
            <div className={styles.slaWarning}>
              <AlertTriangle size={16} />
              <span>
                <strong>{data.slaViolatedCount}</strong> ticket vi phạm SLA trong kỳ này
              </span>
            </div>
          )}

          {/* On-time rate */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Tỷ lệ xử lý đúng hạn SLA</span>
              <span className={`${styles.statPercent} ${onTimeRateClass(data.onTimeRate)}`}>
                {data.onTimeRate.toFixed(1)}%
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={`${styles.progressBar} ${onTimeRateClass(data.onTimeRate)}`}
                style={{ width: `${Math.min(data.onTimeRate, 100)}%` }}
              />
            </div>
            <div className={styles.progressLegend}>
              <span>0%</span>
              <span className={styles.legendThreshold}>70%</span>
              <span className={styles.legendThreshold}>90%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Avg handling time + satisfaction */}
          <div className={styles.twoCol}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>
                  <Clock size={14} /> Thời gian xử lý TB
                </span>
              </div>
              <span className={styles.bigValue}>
                {data.avgHandlingTimeMinutes != null
                  ? formatMinutes(data.avgHandlingTimeMinutes)
                  : <span className={styles.noData}>Chưa có dữ liệu</span>
                }
              </span>
              <span className={styles.statHint}>
                Tính từ lúc gán đến lúc đóng ticket
              </span>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>
                  <Star size={14} /> Điểm hài lòng trung bình
                </span>
              </div>
              <StarRating score={data.avgSatisfactionScore} />
              {data.avgSatisfactionScore !== null && (
                <span className={styles.statHint}>
                  Dựa trên phản hồi từ khách hàng
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
