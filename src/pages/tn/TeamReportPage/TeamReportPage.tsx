import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from 'recharts';
import { useTeamReport } from '@/features/tn/hooks/useTeamLead';
import { TN_LEAD_STATUS_LABELS, TN_LEAD_STATUS_COLORS, PERIOD_LABELS } from '@/types/teamlead';
import type { Period, TnLeadStatus } from '@/types/teamlead';
import { BarChart2 } from 'lucide-react';
import styles from './TeamReportPage.module.css';

const PERIODS: Period[] = ['today', 'week', 'month', 'quarter'];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  );
}

export function TeamReportPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [useCustom, setUseCustom] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const params = useCustom && dateFrom && dateTo
    ? { dateFrom, dateTo }
    : { period };

  const { data, isLoading, isError, refetch } = useTeamReport(params);

  // Build pie chart data from byStatus
  const pieData = data
    ? Object.entries(data.byStatus)
        .filter(([, v]) => v && v > 0)
        .map(([key, value]) => ({
          name: TN_LEAD_STATUS_LABELS[key as TnLeadStatus] ?? key,
          value: value as number,
          color: TN_LEAD_STATUS_COLORS[key as TnLeadStatus] ?? '#94a3b8',
        }))
    : [];

  const trendData = (data?.dailyTrend ?? []).map((d) => ({
    date: d.date.slice(5),
    count: d.count,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <BarChart2 size={20} className={styles.titleIcon} />
          <h1 className={styles.pageTitle}>Báo cáo đội</h1>
        </div>
        <p className={styles.pageSubtitle}>Tổng hợp hiệu suất xử lý lead trong kỳ</p>
      </div>

      {/* Period selector */}
      <div className={styles.controlRow}>
        <div className={styles.periodTabs}>
          {PERIODS.map((p) => (
            <button
              key={p}
              className={`${styles.periodTab} ${!useCustom && period === p ? styles.periodTabActive : ''}`}
              onClick={() => { setPeriod(p); setUseCustom(false); }}
              id={`period-${p}`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
          <button
            className={`${styles.periodTab} ${useCustom ? styles.periodTabActive : ''}`}
            onClick={() => setUseCustom(true)}
            id="period-custom"
          >
            Tùy chỉnh
          </button>
        </div>

        {useCustom && (
          <div className={styles.dateRange}>
            <input
              type="date"
              className={styles.dateInput}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              id="report-date-from"
            />
            <span>—</span>
            <input
              type="date"
              className={styles.dateInput}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              id="report-date-to"
            />
          </div>
        )}
      </div>

      {isLoading && <div className={styles.loadingWrap}><div className={styles.spinner} /></div>}

      {isError && (
        <div className={styles.errorWrap}>
          <p>Không thể tải báo cáo. <button onClick={() => refetch()} className={styles.retryBtn}>Thử lại</button></p>
        </div>
      )}

      {data && (
        <>
          {/* Stats */}
          <div className={styles.statsGrid}>
            <StatCard label="Tổng lead" value={data.totalLeads} />
            <StatCard
              label="Đạt SLA"
              value={`${data.slaAchievedRate !== null ? data.slaAchievedRate.toFixed(1) : '—'}%`}
              sub={`${data.slaAchievedCount} / ${data.totalLeads} lead`}
            />
            <StatCard
              label="Tỷ lệ chốt"
              value={`${data.winRate !== null ? data.winRate.toFixed(1) : '—'}%`}
              sub={`${data.wonCount} lead Won`}
            />
            <StatCard
              label="Vi phạm SLA"
              value={data.slaViolatedCount}
            />
          </div>

          <div className={styles.chartsRow}>
            {/* Pie chart */}
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>Phân bổ theo trạng thái</h2>
              {pieData.length === 0 ? (
                <p className={styles.chartEmpty}>Không có dữ liệu</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
                    />
                    <Legend
                      iconSize={10}
                      formatter={(value) => <span style={{ fontSize: 12, color: '#64748b' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Trend chart */}
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>Lead phát sinh theo ngày</h2>
              {trendData.length === 0 ? (
                <p className={styles.chartEmpty}>Không có dữ liệu</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#d97706" strokeWidth={2.5}
                      dot={{ r: 3, fill: '#d97706', strokeWidth: 0 }} name="Lead mới" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Period info */}
          <p className={styles.generatedAt}>
            Kỳ báo cáo: {new Date(data.periodStart).toLocaleDateString('vi-VN')} → {new Date(data.periodEnd).toLocaleDateString('vi-VN')}
            {' '}· Cập nhật lúc {new Date(data.generatedAt).toLocaleTimeString('vi-VN')}
          </p>
        </>
      )}
    </div>
  );
}
