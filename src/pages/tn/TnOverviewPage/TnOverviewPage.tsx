import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTeamLeadOverview } from '@/features/tn/hooks/useTeamLead';
import { AlertTriangle, Clock, Activity, ShieldAlert, List, BarChart2, Users, ArrowUpCircle } from 'lucide-react';
import styles from './TnOverviewPage.module.css';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  onClick,
  hint,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
  hint?: string;
}) {
  return (
    <div
      className={`${styles.statCard} ${onClick ? styles.statCardClickable : ''}`}
      onClick={onClick}
      style={{ '--accent': color } as React.CSSProperties}
      title={hint}
    >
      <div className={styles.statIcon}>
        <Icon size={20} />
      </div>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
        {onClick && <p className={styles.statHint}>Nhấp để xem →</p>}
      </div>
    </div>
  );
}

export function TnOverviewPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useTeamLeadOverview();

  if (isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles.errorWrap}>
        <p>Không thể tải dữ liệu tổng quan. Vui lòng thử lại.</p>
      </div>
    );
  }

  const chartData = data.trendLast7Days.map((d) => ({
    date: d.date.slice(5), // MM-DD
    count: d.count,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Tổng quan đội</h1>
        <p className={styles.pageSubtitle}>Trạng thái hàng đợi lead trong 7 ngày qua</p>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Chờ phản hồi"
          value={data.pendingResponse}
          icon={Clock}
          color="#f59e0b"
          onClick={() => navigate('/tn/leads?status=PendingResponse')}
          hint="Xem leads đang chờ SA phản hồi"
        />
        <StatCard
          label="Đang xử lý"
          value={data.inProgress}
          icon={Activity}
          color="#3b82f6"
          onClick={() => navigate('/tn/leads?status=InProgress')}
          hint="Xem leads đang được tư vấn"
        />
        <StatCard
          label="Vi phạm SLA"
          value={data.slaViolated}
          icon={ShieldAlert}
          color="#ef4444"
          onClick={() => navigate('/tn/sla')}
          hint="Xem leads đã vi phạm SLA"
        />
        <StatCard
          label="Sắp vi phạm SLA"
          value={data.slaNearDeadline}
          icon={AlertTriangle}
          color="#f97316"
          onClick={() => navigate('/tn/sla')}
          hint="Xem leads sắp đến hạn SLA"
        />
      </div>

      {/* Quick links */}
      <div className={styles.quickLinks}>
        <button
          className={styles.quickLinkBtn}
          onClick={() => navigate('/tn/leads')}
          id="quick-all-leads"
        >
          <List size={14} />
          Toàn bộ leads
        </button>
        <button
          className={styles.quickLinkBtn}
          onClick={() => navigate('/tn/report')}
          id="quick-report"
        >
          <BarChart2 size={14} />
          Báo cáo đội
        </button>
        <button
          className={styles.quickLinkBtn}
          onClick={() => navigate('/tn/team')}
          id="quick-team"
        >
          <Users size={14} />
          Quản lý đội
        </button>
        <button
          className={styles.quickLinkBtn}
          onClick={() => navigate('/tn/escalate-history')}
          id="quick-escalate"
        >
          <ArrowUpCircle size={14} />
          Lịch sử escalate
        </button>
      </div>

      {/* Trend chart */}
      <div className={styles.chartCard}>
        <h2 className={styles.chartTitle}>Lead phát sinh 7 ngày gần nhất</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: 'none',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: 12,
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#d97706"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#d97706', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Lead mới"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
