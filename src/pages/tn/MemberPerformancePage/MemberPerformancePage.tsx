import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemberPerformance, useTeamMembers } from '@/features/tn/hooks/useTeamLead';
import { PERIOD_LABELS } from '@/types/teamlead';
import type { Period } from '@/types/teamlead';
import { ChevronLeft, BarChart2 } from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';
import styles from './MemberPerformancePage.module.css';

const PERIODS: Period[] = ['today', 'week', 'month', 'quarter'];

function StatCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}) {
  return (
    <div className={styles.statCard} style={{ '--accent': color ?? '#d97706' } as React.CSSProperties}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  );
}

/** Progress bar — hiển thị tỷ lệ % */
function ProgressBar({ label, value, max = 100, color }: { label: string; value: number | null; max?: number; color: string }) {
  const pct = value !== null && value !== undefined ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className={styles.progressRow}>
      <div className={styles.progressHeader}>
        <span className={styles.progressLabel}>{label}</span>
        <span className={styles.progressValue} style={{ color }}>
          {value !== null && value !== undefined ? `${value.toFixed(1)}%` : '—'}
        </span>
      </div>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
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

  // Build bar chart data
  const barData = data
    ? [
        { name: 'Được gán', value: data.totalAssigned, color: '#6366f1' },
        { name: 'Đã xử lý', value: data.totalProcessed, color: '#3b82f6' },
        { name: 'Chốt thành công', value: data.wonCount, color: '#10b981' },
        { name: 'Vi phạm SLA', value: data.slaViolatedCount, color: '#ef4444' },
      ]
    : [];

  // Build radar chart data — normalize to 0–100
  const radarData = data
    ? [
        {
          metric: 'Tỷ lệ chốt',
          value: data.winRate ?? 0,
          fullMark: 100,
        },
        {
          metric: 'Tuân thủ SLA',
          value: data.totalProcessed > 0
            ? Math.max(0, ((data.totalProcessed - data.slaViolatedCount) / data.totalProcessed) * 100)
            : 0,
          fullMark: 100,
        },
        {
          metric: 'Năng suất',
          value: data.totalAssigned > 0
            ? (data.totalProcessed / data.totalAssigned) * 100
            : 0,
          fullMark: 100,
        },
        {
          metric: 'Phản hồi nhanh',
          // Inverse: phản hồi < 30 phút = tốt; > 120 phút = tệ
          value: data.avgResponseTimeMinutes !== null
            ? Math.max(0, 100 - (data.avgResponseTimeMinutes / 120) * 100)
            : 50,
          fullMark: 100,
        },
      ]
    : [];

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
          {/* Stat cards */}
          <div className={styles.statsGrid}>
            <StatCard label="Lead được gán" value={data.totalAssigned} color="#6366f1" />
            <StatCard label="Lead đã xử lý" value={data.totalProcessed} color="#3b82f6" />
            <StatCard label="Chốt thành công" value={data.wonCount} color="#10b981" />
            <StatCard
              label="Tỷ lệ chốt"
              value={data.winRate !== null ? `${data.winRate.toFixed(1)}%` : '—'}
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

          {/* Progress bars */}
          <div className={styles.progressCard}>
            <h2 className={styles.cardTitle}>Chỉ số tỷ lệ</h2>
            <ProgressBar
              label="Tỷ lệ chốt (Win Rate)"
              value={data.winRate}
              color="#10b981"
            />
            <ProgressBar
              label="Tuân thủ SLA"
              value={
                data.totalProcessed > 0
                  ? ((data.totalProcessed - data.slaViolatedCount) / data.totalProcessed) * 100
                  : null
              }
              color="#3b82f6"
            />
            <ProgressBar
              label="Năng suất xử lý"
              value={
                data.totalAssigned > 0
                  ? (data.totalProcessed / data.totalAssigned) * 100
                  : null
              }
              color="#6366f1"
            />
          </div>

          {/* Charts row */}
          <div className={styles.chartsRow}>
            {/* Bar chart — lead counts */}
            <div className={styles.chartCard}>
              <h2 className={styles.cardTitle}>Phân bổ số lượng lead</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar chart — performance dimensions */}
            <div className={styles.chartCard}>
              <h2 className={styles.cardTitle}>Đánh giá đa chiều</h2>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Radar
                    name="Hiệu suất"
                    dataKey="value"
                    stroke="#d97706"
                    fill="#d97706"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
                    formatter={(v: number) => [`${v.toFixed(1)}%`, 'Điểm']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
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
