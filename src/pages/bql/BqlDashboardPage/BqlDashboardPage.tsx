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
import { useDashboardOverview, useRoutingKpi, useExportReport } from '@/features/dashboard/hooks/useDashboard';
import type { Period } from '@/types/dashboard';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Users,
  Calendar,
  Clock,
} from 'lucide-react';
import { GlassButton } from '@/components/glass';
import styles from './BqlDashboardPage.module.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtRate(v: number | null | undefined): string {
  if (v == null) return 'N/A';
  return `${v.toFixed(1)}%`;
}

function fmtNum(v: number | null | undefined): string {
  if (v == null) return 'N/A';
  return v.toLocaleString('vi-VN');
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
}

function fmtDate(yyyyMmDd: string): string {
  const [, m, d] = yyyyMmDd.split('-');
  return `${d}/${m}`;
}

function Delta({
  cur,
  prev,
  lowerIsBetter = false,
}: {
  cur: number | null;
  prev: number | null;
  lowerIsBetter?: boolean;
}) {
  if (cur == null || prev == null) return <span className={styles.deltaNeutral}>—</span>;
  const diff = cur - prev;
  if (Math.abs(diff) < 0.01) return <span className={styles.deltaNeutral}><Minus size={12} /> 0</span>;

  const positive = lowerIsBetter ? diff < 0 : diff > 0;
  return (
    <span className={positive ? styles.deltaUp : styles.deltaDown}>
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {diff > 0 ? '+' : ''}{diff.toFixed(1)}
    </span>
  );
}

// Colour palette for charts
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const PERIOD_LABELS: Record<Period, string> = {
  week: 'Tuần này',
  month: 'Tháng này',
  quarter: 'Quý này',
};

// ── Period Selector ───────────────────────────────────────────────────────────

function PeriodSelector({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div className={styles.periodSelector}>
      {(['week', 'month', 'quarter'] as Period[]).map((p) => (
        <button
          key={p}
          className={`${styles.periodBtn} ${value === p ? styles.periodBtnActive : ''}`}
          onClick={() => onChange(p)}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiIconWrap} style={{ background: `${accent}18`, color: accent }}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div className={styles.kpiInfo}>
        <p className={styles.kpiLabel}>{label}</p>
        <p className={styles.kpiValue}>{value}</p>
        {sub && <div className={styles.kpiSub}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Export Button ─────────────────────────────────────────────────────────────

function ExportMenu({ period }: { period: Period }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'excel' | 'pdf'>('excel');
  const { mutate, isPending } = useExportReport();

  function handleExport(reportType: 'overview' | 'unitComparison' | 'sales') {
    mutate({ reportType, period, format });
    setOpen(false);
  }

  return (
    <div className={styles.exportWrap}>
      <GlassButton
        className={styles.exportBtn}
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        id="bql-export-btn"
      >
        {isPending ? <RefreshCw size={14} className={styles.spin} /> : <Download size={14} />}
        Xuất báo cáo
      </GlassButton>
      {open && (
        <div className={styles.exportDropdown}>
          <div className={styles.exportDropdownFmt}>
            <button
              className={`${styles.exportDropdownFmtBtn} ${format === 'excel' ? styles.exportDropdownFmtBtnActive : ''}`}
              onClick={() => setFormat('excel')}
            >
              Excel
            </button>
            <button
              className={`${styles.exportDropdownFmtBtn} ${format === 'pdf' ? styles.exportDropdownFmtBtnActive : ''}`}
              onClick={() => setFormat('pdf')}
            >
              PDF
            </button>
          </div>
          <button onClick={() => handleExport('overview')}>Tổng quan (Overview)</button>
          <button onClick={() => handleExport('unitComparison')}>So sánh đơn vị</button>
          <button onClick={() => handleExport('sales')}>Báo cáo bán hàng</button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function BqlDashboardPage() {
  const [period, setPeriod] = useState<Period>('month');

  const overview = useDashboardOverview(period);
  const routingKpi = useRoutingKpi(period);

  const isLoading = overview.isLoading || routingKpi.isLoading;
  const data = overview.data;
  const kpi = routingKpi.data;

  // Prepare chart data
  const channelData = data
    ? Object.entries(data.leadsByChannel).map(([name, value]) => ({ name, value }))
    : [];
  const needTypeData = data
    ? Object.entries(data.leadsByNeedType).map(([name, value]) => ({ name, value }))
    : [];
  const trendData = (data?.dailyTrend ?? []).map((d) => ({
    date: fmtDate(d.date),
    'Leads': d.totalLeads,
  }));

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard lãnh đạo</h1>
          {data && (
            <p className={styles.pageDesc}>
              Cập nhật lúc {fmtTime(data.generatedAt)} · {PERIOD_LABELS[period]}
            </p>
          )}
        </div>
        <div className={styles.headerActions}>
          <PeriodSelector value={period} onChange={setPeriod} />
          <ExportMenu period={period} />
        </div>
      </div>

      {isLoading && (
        <div className={styles.loadingBanner}>
          <RefreshCw size={16} className={styles.spin} /> Đang tải dữ liệu...
        </div>
      )}

      {/* ── KPI Cards ── */}
      {data && (
        <div className={styles.kpiGrid}>
          <KpiCard
            label="Lead hôm nay"
            value={fmtNum(data.kpiCards.totalLeadsToday)}
            icon={Calendar}
            accent="#6366f1"
          />
          <KpiCard
            label="Lead tuần này"
            value={fmtNum(data.kpiCards.totalLeadsThisWeek)}
            icon={TrendingUp}
            accent="#10b981"
          />
          <KpiCard
            label="Lead tháng này"
            value={fmtNum(data.kpiCards.totalLeadsThisMonth)}
            icon={Users}
            accent="#f59e0b"
          />
          <KpiCard
            label="SLA đạt"
            value={fmtRate(data.kpiCards.slaAchievedRate)}
            icon={CheckCircle2}
            accent="#10b981"
          />
          <KpiCard
            label="Win Rate"
            value={fmtRate(data.kpiCards.winRate)}
            icon={TrendingUp}
            accent="#6366f1"
          />
          <KpiCard
            label="Vi phạm SLA"
            value={fmtNum(data.kpiCards.slaViolatedCount)}
            icon={AlertTriangle}
            accent="#ef4444"
            sub={
              data.kpiCards.slaViolatedCount > 0 ? (
                <span className={styles.violatedHint}>Lead đang vi phạm</span>
              ) : null
            }
          />
        </div>
      )}

      {/* ── Charts Row ── */}
      {data && (
        <div className={styles.chartsGrid}>
          {/* Daily Trend */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Xu hướng lead theo ngày</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}
                />
                <Line
                  type="monotone"
                  dataKey="Leads"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Leads by Channel */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Leads theo kênh</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={channelData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {channelData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: unknown) => [(v as number).toLocaleString('vi-VN'), 'Leads']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leads by Need Type */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Leads theo nhu cầu</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={needTypeData} layout="vertical" margin={{ top: 4, right: 8, left: 60, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={60} />
                <Tooltip
                  formatter={(v: unknown) => [(v as number).toLocaleString('vi-VN'), 'Leads']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {needTypeData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Top 5 Stores ── */}
      {data && data.top5Stores.length > 0 && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Top 5 cửa hàng</h3>
          <div className={styles.storeList}>
            {data.top5Stores.map((s, i) => {
              const max = data.top5Stores[0].leadCount;
              return (
                <div key={s.storeId} className={styles.storeRow}>
                  <span className={styles.storeRank}>#{i + 1}</span>
                  <span className={styles.storeName}>{s.storeName}</span>
                  <div className={styles.storeBarWrap}>
                    <div
                      className={styles.storeBar}
                      style={{ width: `${(s.leadCount / max) * 100}%` }}
                    />
                  </div>
                  <span className={styles.storeCount}>{s.leadCount.toLocaleString('vi-VN')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Routing KPI ── */}
      {kpi && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>
            KPI phân luồng
            {kpi.generatedAt && (
              <span className={styles.updatedAt}>Cập nhật {fmtTime(kpi.generatedAt)}</span>
            )}
          </h3>
          <div className={styles.kpiRoutingGrid}>
            <div className={styles.kpiRoutingItem}>
              <div className={styles.kpiRoutingLabel}>Rule Match Rate</div>
              <div className={styles.kpiRoutingValue}>{fmtRate(kpi.ruleMatchRate)}</div>
              {kpi.comparison && (
                <Delta cur={kpi.ruleMatchRate} prev={kpi.comparison.prevRuleMatchRate} />
              )}
            </div>
            <div className={styles.kpiRoutingItem}>
              <div className={styles.kpiRoutingLabel}>Thời gian gán TB</div>
              <div className={styles.kpiRoutingValue}>
                {kpi.avgTimeToAssignMinutes != null
                  ? `${kpi.avgTimeToAssignMinutes.toFixed(1)} phút`
                  : 'N/A'}
              </div>
              {kpi.comparison && (
                <Delta
                  cur={kpi.avgTimeToAssignMinutes}
                  prev={kpi.comparison.prevAvgTimeToAssignMinutes}
                  lowerIsBetter
                />
              )}
            </div>
            <div className={styles.kpiRoutingItem}>
              <div className={styles.kpiRoutingLabel}>SLA đạt</div>
              <div className={styles.kpiRoutingValue}>{fmtRate(kpi.slaAchievedRate)}</div>
              {kpi.comparison && (
                <Delta cur={kpi.slaAchievedRate} prev={kpi.comparison.prevSlaAchievedRate} />
              )}
            </div>
            <div className={styles.kpiRoutingItem}>
              <div className={styles.kpiRoutingLabel}>Escalation Rate</div>
              <div className={styles.kpiRoutingValue}>{fmtRate(kpi.escalationRate)}</div>
              {kpi.comparison && (
                <Delta
                  cur={kpi.escalationRate}
                  prev={kpi.comparison.prevEscalationRate}
                  lowerIsBetter
                />
              )}
            </div>
          </div>
          {kpi.comparison && (
            <p className={styles.comparisonNote}>
              <Clock size={12} /> So với kỳ trước:{' '}
              {new Date(kpi.comparison.prevPeriodStart).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
              {' '}–{' '}
              {new Date(kpi.comparison.prevPeriodEnd).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
            </p>
          )}
        </div>
      )}

      {/* ── SLA by Store ── */}
      {kpi && kpi.slaByStore.length > 0 && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>SLA theo cửa hàng</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cửa hàng</th>
                  <th>Tổng lead</th>
                  <th>SLA đạt</th>
                  <th>Biểu đồ</th>
                </tr>
              </thead>
              <tbody>
                {[...kpi.slaByStore]
                  .sort((a, b) => b.slaAchievedRate - a.slaAchievedRate)
                  .map((s) => (
                    <tr key={s.storeId}>
                      <td className={styles.storeNameCell}>{s.storeName}</td>
                      <td>{s.totalLeads.toLocaleString('vi-VN')}</td>
                      <td>
                        <span
                          className={
                            s.slaAchievedRate >= 90
                              ? styles.slaGood
                              : s.slaAchievedRate >= 75
                              ? styles.slaWarn
                              : styles.slaBad
                          }
                        >
                          {s.slaAchievedRate.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <div className={styles.slaBarWrap}>
                          <div
                            className={`${styles.slaBar} ${
                              s.slaAchievedRate >= 90
                                ? styles.slaBarGood
                                : s.slaAchievedRate >= 75
                                ? styles.slaBarWarn
                                : styles.slaBarBad
                            }`}
                            style={{ width: `${s.slaAchievedRate}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
