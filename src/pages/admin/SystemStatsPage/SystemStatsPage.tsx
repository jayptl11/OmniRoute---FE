import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useSystemStats } from '@/features/qt/hooks/useAudit';
import type { Period } from '@/types/dashboard';
import { RefreshCw, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';
import styles from './SystemStatsPage.module.css';
import { GlassButton } from '@/components/glass';

const PERIOD_LABELS: Record<Period, string> = { week: 'Tuần', month: 'Tháng', quarter: 'Quý' };
const GROUP_COLORS: Record<string, string> = {
  Sale: '#6366f1',
  Cskh: '#10b981',
  StoreSupport: '#f59e0b',
};

function fmtDate(yyyyMmDd: string): string {
  const [, m, d] = yyyyMmDd.split('-');
  return `${d}/${m}`;
}

export function SystemStatsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const { data, isLoading, isError } = useSystemStats(period);

  const trendData = (data?.dailyTrend ?? []).map((d) => ({
    date: fmtDate(d.date),
    'Tổng lead': d.totalLeads,
    'Auto routed': d.autoRouted,
    'Default group': d.defaultGroupHits,
  }));

  const groupData = data
    ? Object.entries(data.leadsByGroup).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Thống kê hệ thống</h1>
          <p className={styles.pageDesc}>
            Hiệu quả engine phân luồng tự động
            {data && ` · Cập nhật ${new Date(data.generatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })}`}
          </p>
        </div>
        <div className={styles.periodSelector}>
          {(['week', 'month', 'quarter'] as Period[]).map((p) => (
            <GlassButton
              key={p}
              className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ''}`}
              onClick={() => setPeriod(p)}
            >
              {PERIOD_LABELS[p]}
            </GlassButton>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className={styles.loadingWrap}>
          <RefreshCw size={16} className={styles.spin} /> Đang tải...
        </div>
      )}

      {isError && (
        <div className={styles.errorCard}>Không thể tải thống kê hệ thống.</div>
      )}

      {data && (
        <>
          {/* KPI Cards */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                <Cpu size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className={styles.kpiLabel}>Tổng lead đã xử lý</p>
                <p className={styles.kpiValue}>{data.totalLeadsProcessed.toLocaleString('vi-VN')}</p>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                <CheckCircle2 size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className={styles.kpiLabel}>Auto routing success rate</p>
                <p className={styles.kpiValue}>{data.autoRoutingSuccessRate.toFixed(1)}%</p>
                <p className={styles.kpiSub}>Lead được route đúng rule</p>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                <AlertTriangle size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className={styles.kpiLabel}>Default group hits</p>
                <p className={styles.kpiValue}>{data.defaultGroupHits.toLocaleString('vi-VN')}</p>
                <p className={styles.kpiSub}>Lead không khớp rule nào</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className={styles.chartsRow}>
            {/* Daily Trend */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Xu hướng theo ngày</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="Tổng lead" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Auto routed" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Default group" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Leads by Group Pie */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Phân bổ theo nhóm</h3>
              {groupData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={groupData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      paddingAngle={4}
                    >
                      {groupData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={GROUP_COLORS[entry.name] ?? '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: unknown) => [(v as number).toLocaleString('vi-VN'), 'Leads']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className={styles.emptyText}>Không có dữ liệu.</p>
              )}
            </div>
          </div>

          <p className={styles.footNote}>
            Kỳ thống kê: {new Date(data.periodStart).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
            {' '}–{' '}
            {new Date(data.periodEnd).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
          </p>
        </>
      )}
    </div>
  );
}
