import { useState } from 'react';
import { useStoreReport, useStoreCapacity } from '@/features/ql/hooks/useStoreManager';
import type { GetStoreReportParams, StoreReportPeriod } from '@/types/storemanager';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import styles from './QlReportPage.module.css';

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtPct(val: number | null): string {
  if (val === null || val === undefined) return '—';
  return `${val.toFixed(1)}%`;
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

function KpiCard({ label, value, sub, accent }: KpiCardProps) {
  return (
    <div className={`${styles.kpiCard} ${accent ? styles.kpiAccent : ''}`}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue}>{value}</span>
      {sub && <span className={styles.kpiSub}>{sub}</span>}
    </div>
  );
}

// ── Capacity mini-widget ───────────────────────────────────────────────────────

function CapacityWidget() {
  const { data, isLoading } = useStoreCapacity();

  if (isLoading || !data) return null;

  const pct = Math.min((data.activeLeads / data.maxCapacity) * 100, 100);

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Năng lực tiếp nhận hiện tại</h3>
      <div className={styles.capacityRow}>
        <div className={styles.capacityInfo}>
          <span className={styles.capacityStoreName}>{data.storeName}</span>
          {data.isOverCapacity && <span className={`${styles.capBadge} ${styles.capRed}`}>Quá tải</span>}
          {!data.isOverCapacity && data.isNearCapacity && <span className={`${styles.capBadge} ${styles.capYellow}`}>Gần đầy</span>}
        </div>
        <div className={styles.capacityNums}>
          <span className={styles.capacityActive}>{data.activeLeads}</span>
          <span className={styles.capacityMax}>/{data.maxCapacity}</span>
        </div>
      </div>
      <div className={styles.progressTrack}>
        <div
          className={`${styles.progressBar} ${data.isOverCapacity ? styles.progressRed : data.isNearCapacity ? styles.progressYellow : styles.progressGreen}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={styles.progressPct}>{pct.toFixed(1)}% sử dụng</div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const PERIOD_TABS: { value: StoreReportPeriod; label: string }[] = [
  { value: 'week',    label: 'Tuần này' },
  { value: 'month',   label: 'Tháng này' },
  { value: 'quarter', label: 'Quý này' },
  { value: 'custom',  label: 'Tùy chỉnh' },
];

export function QlReportPage() {
  const [period, setPeriod] = useState<StoreReportPeriod>('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const params: GetStoreReportParams = {
    period,
    ...(period === 'custom' && dateFrom ? { dateFrom } : {}),
    ...(period === 'custom' && dateTo ? { dateTo } : {}),
  };

  const { data, isLoading, isError } = useStoreReport(params);

  // Prepare chart data
  const byStatusData = data
    ? Object.entries(data.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  const trendData = data?.dailyTrend ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Báo cáo hiệu quả đơn vị</h1>
      </div>

      {/* Period tabs */}
      <div className={styles.tabs}>
        {PERIOD_TABS.map((t) => (
          <button
            key={t.value}
            className={`${styles.tab} ${period === t.value ? styles.tabActive : ''}`}
            onClick={() => setPeriod(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Custom date picker */}
      {period === 'custom' && (
        <div className={styles.customDateRow}>
          <input
            type="date"
            className={styles.dateInput}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className={styles.dateSep}>→</span>
          <input
            type="date"
            className={styles.dateInput}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      )}

      {isLoading && <div className={styles.loading}>Đang tải báo cáo...</div>}
      {isError && <div className={styles.errorMsg}>Không thể tải báo cáo.</div>}

      {!isLoading && !isError && data && (
        <>
          {/* Row 1: KPI cards */}
          <div className={styles.kpiRow}>
            <KpiCard label="Tổng lead" value={data.totalLeads} />
            <KpiCard
              label="Tỷ lệ SLA đạt"
              value={fmtPct(data.slaAchievedRate)}
              sub={`${data.slaAchievedCount}/${data.slaAchievedCount + data.slaViolatedCount}`}
              accent
            />
            <KpiCard
              label="Win Rate"
              value={fmtPct(data.winRate)}
              sub={`${data.wonCount} lead chốt`}
              accent
            />
          </div>

          {/* Row 2: By status bar chart */}
          {byStatusData.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Phân bổ theo trạng thái</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byStatusData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Số lead" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Row 3: Daily trend area chart */}
          {trendData.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Xu hướng theo ngày</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#trendGrad)"
                    name="Số lead"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Row 4: Capacity widget */}
          <CapacityWidget />
        </>
      )}
    </div>
  );
}

