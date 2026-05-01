import { useState } from 'react';
import { useUnitComparison, useExportReport } from '@/features/dashboard/hooks/useDashboard';
import type { Period, UnitComparisonSortBy, UnitComparisonItemDto } from '@/types/dashboard';
import { Download, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import styles from './BqlUnitComparisonPage.module.css';

const PERIOD_LABELS: Record<Period, string> = { week: 'Tuần', month: 'Tháng', quarter: 'Quý' };

const SORT_OPTIONS: { value: UnitComparisonSortBy; label: string }[] = [
  { value: 'leadCount',        label: 'Lead nhiều nhất' },
  { value: 'winRate',          label: 'Win rate cao nhất' },
  { value: 'slaAchievedRate',  label: 'SLA tốt nhất' },
  { value: 'avgProcessingTime', label: 'Xử lý nhanh nhất' },
];

type SortDir = 'asc' | 'desc';

function fmtRate(v: number | null): string {
  return v == null ? 'N/A' : `${v.toFixed(1)}%`;
}

function fmtHours(v: number | null): string {
  if (v == null) return 'N/A';
  return v < 1 ? `${(v * 60).toFixed(0)} phút` : `${v.toFixed(1)} giờ`;
}

function SortTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th className={styles.sortableTh} onClick={onClick}>
      {label}
      {active ? (
        dir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />
      ) : (
        <ChevronDown size={12} className={styles.sortIconInactive} />
      )}
    </th>
  );
}

export function BqlUnitComparisonPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [sortBy, setSortBy] = useState<UnitComparisonSortBy>('leadCount');
  const [localSort, setLocalSort] = useState<{ field: keyof UnitComparisonItemDto; dir: SortDir } | null>(null);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel');

  const { data, isLoading, isError } = useUnitComparison(period, sortBy);
  const { mutate: exportReport, isPending: isExporting } = useExportReport();

  const items = (() => {
    if (!data?.items) return [];
    if (!localSort) return data.items;
    return [...data.items].sort((a, b) => {
      const av = a[localSort.field] ?? -Infinity;
      const bv = b[localSort.field] ?? -Infinity;
      return localSort.dir === 'asc'
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  })();

  function handleColSort(field: keyof UnitComparisonItemDto) {
    setLocalSort((prev) =>
      prev?.field === field
        ? { field, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { field, dir: 'desc' }
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>So sánh đơn vị</h1>
          <p className={styles.pageDesc}>
            Bảng so sánh hiệu suất tất cả cửa hàng active
            {data && (
              <> · {data.items.length} đơn vị</>
            )}
          </p>
        </div>
        <div className={styles.headerActions}>
          {/* Period */}
          <div className={styles.periodSelector}>
            {(['week', 'month', 'quarter'] as Period[]).map((p) => (
              <button
                key={p}
                className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ''}`}
                onClick={() => { setPeriod(p); setLocalSort(null); }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          {/* Sort by */}
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as UnitComparisonSortBy); setLocalSort(null); }}
            id="unit-comparison-sortby"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {/* Export format */}
          <select
            className={styles.sortSelect}
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'excel' | 'pdf')}
            id="unit-comparison-format-select"
          >
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
          {/* Export */}
          <button
            className={styles.exportBtn}
            onClick={() => exportReport({ reportType: 'unitComparison', period, format: exportFormat })}
            disabled={isExporting}
            id="unit-comparison-export-btn"
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
        <div className={styles.errorCard}>Không thể tải dữ liệu so sánh đơn vị.</div>
      )}

      {data && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cửa hàng</th>
                  <th>Khu vực</th>
                  <SortTh
                    label="Lead"
                    active={localSort?.field === 'leadCount'}
                    dir={localSort?.dir ?? 'desc'}
                    onClick={() => handleColSort('leadCount')}
                  />
                  <SortTh
                    label="Win Rate"
                    active={localSort?.field === 'winRate'}
                    dir={localSort?.dir ?? 'desc'}
                    onClick={() => handleColSort('winRate')}
                  />
                  <SortTh
                    label="SLA đạt"
                    active={localSort?.field === 'slaAchievedRate'}
                    dir={localSort?.dir ?? 'desc'}
                    onClick={() => handleColSort('slaAchievedRate')}
                  />
                  <SortTh
                    label="Thời gian XL TB"
                    active={localSort?.field === 'avgProcessingTimeHours'}
                    dir={localSort?.dir ?? 'desc'}
                    onClick={() => handleColSort('avgProcessingTimeHours')}
                  />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className={styles.emptyCell}>Không có dữ liệu.</td>
                  </tr>
                )}
                {items.map((item, i) => (
                  <tr key={item.storeId} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td className={styles.rankCell}>{i + 1}</td>
                    <td className={styles.nameCell}>{item.storeName}</td>
                    <td className={styles.regionCell}>{item.region ?? <span className={styles.na}>—</span>}</td>
                    <td className={styles.numCell}>{item.leadCount.toLocaleString('vi-VN')}</td>
                    <td>
                      <span className={
                        item.winRate == null
                          ? styles.na
                          : item.winRate >= 60
                          ? styles.good
                          : item.winRate >= 40
                          ? styles.warn
                          : styles.bad
                      }>
                        {fmtRate(item.winRate)}
                      </span>
                    </td>
                    <td>
                      <span className={
                        item.slaAchievedRate == null
                          ? styles.na
                          : item.slaAchievedRate >= 90
                          ? styles.good
                          : item.slaAchievedRate >= 75
                          ? styles.warn
                          : styles.bad
                      }>
                        {fmtRate(item.slaAchievedRate)}
                      </span>
                    </td>
                    <td className={styles.numCell}>{fmtHours(item.avgProcessingTimeHours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.generatedAt && (
            <p className={styles.footNote}>
              Dữ liệu từ {new Date(data.periodStart).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
              {' '}đến {new Date(data.periodEnd).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
