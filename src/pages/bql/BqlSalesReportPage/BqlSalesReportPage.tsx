import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { useSalesReport, useExportReport } from '@/features/dashboard/hooks/useDashboard';
import type { Period } from '@/types/dashboard';
import { Download, RefreshCw, TrendingUp, Phone, CheckCircle2 } from 'lucide-react';
import styles from './BqlSalesReportPage.module.css';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const PERIOD_LABELS: Record<Period, string> = { week: 'Tuần', month: 'Tháng', quarter: 'Quý' };

function fmtDate(yyyyMmDd: string): string {
  const [, m, d] = yyyyMmDd.split('-');
  return `${d}/${m}`;
}

function fmtRate(v: number | null): string {
  return v == null ? 'N/A' : `${v.toFixed(1)}%`;
}

// ── Funnel ────────────────────────────────────────────────────────────────────

function FunnelItem({
  label,
  count,
  rate,
  color,
  icon: Icon,
  width,
}: {
  label: string;
  count: number;
  rate?: string;
  color: string;
  icon: React.ElementType;
  width: string;
}) {
  return (
    <div className={styles.funnelItem}>
      <div className={styles.funnelBar} style={{ width, background: color }}>
        <Icon size={16} color="#fff" />
        <span className={styles.funnelLabel}>{label}</span>
      </div>
      <div className={styles.funnelMeta}>
        <span className={styles.funnelCount}>{count.toLocaleString('vi-VN')}</span>
        {rate && <span className={styles.funnelRate}>{rate}</span>}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function BqlSalesReportPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel');
  const { data, isLoading, isError } = useSalesReport(period);
  const { mutate: exportReport, isPending: isExporting } = useExportReport();

  const trendData = (data?.dailyTrend ?? []).map((d) => ({
    date: fmtDate(d.date),
    'Tổng lead': d.totalLeads,
    'Đã chốt': d.wonCount,
  }));

  const channelData = data
    ? Object.entries(data.wonByChannel).map(([name, value]) => ({ name, value }))
    : [];

  const needTypeData = data
    ? Object.entries(data.wonByNeedType).map(([name, value]) => ({ name, value }))
    : [];

  const funnelMax = data ? Math.max(data.totalLeads, 1) : 1;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Báo cáo bán hàng</h1>
          <p className={styles.pageDesc}>Phễu Sale: Tổng lead → Đã liên lạc → Đã chốt</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.periodSelector}>
            {(['week', 'month', 'quarter'] as Period[]).map((p) => (
              <button
                key={p}
                className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ''}`}
                onClick={() => setPeriod(p)}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <select
            className={styles.formatSelect}
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'excel' | 'pdf')}
            id="sales-report-format-select"
          >
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            className={styles.exportBtn}
            onClick={() => exportReport({ reportType: 'sales', period, format: exportFormat })}
            disabled={isExporting}
            id="sales-report-export-btn"
          >
            {isExporting ? <RefreshCw size={14} className={styles.spin} /> : <Download size={14} />}
            Xuất báo cáo
          </button>
        </div>
      </div>

      {isLoading && (
        <div className={styles.loadingWrap}>
          <RefreshCw size={16} className={styles.spin} /> Đang tải...
        </div>
      )}

      {isError && (
        <div className={styles.errorCard}>Không thể tải báo cáo bán hàng.</div>
      )}

      {data && (
        <>
          {/* Funnel */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Phễu bán hàng</h3>
            <div className={styles.funnel}>
              <FunnelItem
                label="Tổng lead Sale"
                count={data.totalLeads}
                color="#6366f1"
                icon={TrendingUp}
                width="100%"
              />
              <FunnelItem
                label="Đã liên lạc"
                count={data.contactedCount}
                rate={`Contact rate: ${fmtRate(data.contactRate)}`}
                color="#10b981"
                icon={Phone}
                width={`${(data.contactedCount / funnelMax) * 100}%`}
              />
              <FunnelItem
                label="Đã chốt (Won)"
                count={data.wonCount}
                rate={`Win rate: ${fmtRate(data.winRate)}`}
                color="#f59e0b"
                icon={CheckCircle2}
                width={`${(data.wonCount / funnelMax) * 100}%`}
              />
            </div>
          </div>

          {/* Daily Trend */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Xu hướng theo ngày</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Tổng lead" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Đã chốt" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Charts Row */}
          <div className={styles.chartsRow}>
            {/* Won by Channel */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Chốt theo kênh</h3>
              {channelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={channelData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip
                      formatter={(v: unknown) => [(v as number).toLocaleString('vi-VN'), 'Won']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {channelData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className={styles.emptyText}>Không có dữ liệu.</p>}
            </div>

            {/* Won by Need Type */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Chốt theo nhu cầu</h3>
              {needTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={needTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={38}
                      paddingAngle={3}
                    >
                      {needTypeData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: unknown) => [(v as number).toLocaleString('vi-VN'), 'Won']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className={styles.emptyText}>Không có dữ liệu.</p>}
            </div>
          </div>

          {data.generatedAt && (
            <p className={styles.footNote}>
              Cập nhật lúc {new Date(data.generatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
