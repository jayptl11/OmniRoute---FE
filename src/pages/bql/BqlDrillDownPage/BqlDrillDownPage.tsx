import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useDrillDown } from '@/features/dashboard/hooks/useDashboard';
import type { DrillDownLevel } from '@/types/dashboard';
import { ChevronRight, Home, GitBranch, RefreshCw } from 'lucide-react';
import styles from './BqlDrillDownPage.module.css';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const STATUS_LABELS: Record<string, string> = {
  PendingDispatch: 'Chờ phân công',
  PendingAssignment: 'Chờ gán',
  Assigned: 'Đã gán',
  Contacted: 'Đã liên lạc',
  Won: 'Đã chốt',
  Lost: 'Thất bại',
  Cancelled: 'Đã huỷ',
};

export function BqlDrillDownPage() {
  const [level, setLevel] = useState<DrillDownLevel>('unit');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const { data, isLoading, isError } = useDrillDown(level, selectedId);

  const byStatusData = data
    ? Object.entries(data.byStatus).map(([name, value]) => ({
        name: STATUS_LABELS[name] ?? name,
        value,
      }))
    : [];

  function handleClickChild(childLabel: string) {
    // For unit level, use label as id (the backend accepts storeName or storeId)
    // When clicking a child, drill into it
    setSelectedId(childLabel);
    setSelectedLabel(childLabel);
  }

  function handleReset() {
    setSelectedId(undefined);
    setSelectedLabel(null);
  }

  function handleLevelChange(newLevel: DrillDownLevel) {
    setLevel(newLevel);
    setSelectedId(undefined);
    setSelectedLabel(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Drill-down</h1>
          <p className={styles.pageDesc}>Xem chi tiết theo đơn vị hoặc kênh</p>
        </div>

        <div className={styles.levelToggle}>
          <button
            id="drill-level-unit"
            className={`${styles.levelBtn} ${level === 'unit' ? styles.levelBtnActive : ''}`}
            onClick={() => handleLevelChange('unit')}
          >
            <GitBranch size={14} /> Theo đơn vị
          </button>
          <button
            id="drill-level-channel"
            className={`${styles.levelBtn} ${level === 'channel' ? styles.levelBtnActive : ''}`}
            onClick={() => handleLevelChange('channel')}
          >
            <GitBranch size={14} /> Theo kênh
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbItem} onClick={handleReset}>
          <Home size={13} /> Tất cả {level === 'unit' ? 'đơn vị' : 'kênh'}
        </button>
        {selectedLabel && (
          <>
            <ChevronRight size={13} className={styles.breadcrumbSep} />
            <span className={styles.breadcrumbCurrent}>{selectedLabel}</span>
          </>
        )}
      </div>

      {isLoading && (
        <div className={styles.loadingWrap}>
          <RefreshCw size={18} className={styles.spin} />
          <span>Đang tải...</span>
        </div>
      )}

      {isError && (
        <div className={styles.errorCard}>Không thể tải dữ liệu. Vui lòng thử lại.</div>
      )}

      {data && (
        <div className={styles.content}>
          {/* Summary */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryMain}>
              <p className={styles.summaryLabel}>Tổng leads</p>
              <p className={styles.summaryValue}>{data.totalLeads.toLocaleString('vi-VN')}</p>
            </div>
            {data.entityName && (
              <div className={styles.summaryEntity}>
                <span className={styles.entityBadge}>{data.entityName}</span>
              </div>
            )}
          </div>

          <div className={styles.chartsRow}>
            {/* By Status Pie */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Phân bổ theo trạng thái</h3>
              {byStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={byStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {byStatusData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: unknown) => [(v as number).toLocaleString('vi-VN'), 'Leads']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className={styles.emptyText}>Không có dữ liệu trạng thái.</p>
              )}
            </div>

            {/* Children List */}
            {data.children.length > 0 && (
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>
                  {selectedId ? 'Chi tiết' : level === 'unit' ? 'Danh sách đơn vị' : 'Danh sách kênh'}
                </h3>
                <div className={styles.childrenList}>
                  {data.children.map((child) => {
                    const max = Math.max(...data.children.map((c) => c.count));
                    return (
                      <button
                        key={child.label}
                        className={styles.childItem}
                        onClick={() => handleClickChild(child.label)}
                      >
                        <span className={styles.childLabel}>{child.label}</span>
                        <div className={styles.childBarWrap}>
                          <div
                            className={styles.childBar}
                            style={{ width: `${(child.count / max) * 100}%` }}
                          />
                        </div>
                        <span className={styles.childCount}>{child.count.toLocaleString('vi-VN')}</span>
                        <ChevronRight size={14} className={styles.childArrow} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
