import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Clock, AlertCircle, ChevronLeft, ChevronRight,
  ArrowUpRight, Loader2,
} from 'lucide-react';
import { useDispatchQueue } from '@/features/dp/hooks/useDispatch';
import type { DispatchQueueParams, DispatchQueueItemDto } from '@/types/dispatch';
import { NEED_TYPE_LABELS } from '@/types/leads';
import { GlassSelect } from '@/components/glass';
import styles from './DispatchQueuePage.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function rowClass(item: DispatchQueueItemDto) {
  if (item.priorityLevel === 'High') return styles.rowHigh;
  if (item.priorityLevel === 'Medium') return styles.rowMedium;
  return '';
}

function PriorityBadge({ level }: { level: 'Low' | 'Medium' | 'High' }) {
  const cls =
    level === 'High' ? styles.priorityHigh :
    level === 'Medium' ? styles.priorityMedium :
    styles.priorityLow;
  return <span className={`${styles.badge} ${cls}`}>{level}</span>;
}

function WaitBadge({ minutes }: { minutes: number }) {
  if (minutes >= 60) {
    return (
      <span className={`${styles.badge} ${styles.waitLong}`}>
        <Clock size={10} /> Chờ lâu
      </span>
    );
  }
  return <span className={styles.waitMinutes}>{minutes} phút</span>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DispatchQueuePage() {
  const navigate = useNavigate();

  // Filter state
  const [search, setSearch] = useState('');
  const [priorityLevel, setPriorityLevel] = useState<'Low' | 'Medium' | 'High' | ''>('');
  const [addressContains, setAddressContains] = useState('');
  const [waitedMinutesInput, setWaitedMinutesInput] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Applied params (only sent after search click)
  const [appliedParams, setAppliedParams] = useState<DispatchQueueParams>({ page: 1, pageSize: PAGE_SIZE });

  const { data, isLoading, isError, isFetching } = useDispatchQueue(appliedParams);

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1;

  const handleSearch = () => {
    const params: DispatchQueueParams = { page: 1, pageSize: PAGE_SIZE };
    if (search.trim()) params.search = search.trim();
    if (priorityLevel) params.priorityLevel = priorityLevel;
    if (addressContains.trim()) params.addressContains = addressContains.trim();
    const wm = parseInt(waitedMinutesInput, 10);
    if (!isNaN(wm) && wm > 0) params.waitedMoreThanMinutes = wm;
    setPage(1);
    setAppliedParams(params);
  };

  const handleReset = () => {
    setSearch(''); setPriorityLevel(''); setAddressContains(''); setWaitedMinutesInput('');
    setPage(1); setAppliedParams({ page: 1, pageSize: PAGE_SIZE });
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    setAppliedParams((p) => ({ ...p, page: next }));
  };

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Hàng đợi phân công</h1>
          <p className={styles.pageSubtitle}>
            {data ? `${data.totalCount} lead đang chờ điều phối` : 'Lead có trạng thái Chờ điều phối'}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <div className={styles.inputWrap}>
            <Search size={14} className={styles.inputIcon} />
            <input
              id="filter-search"
              className={styles.input}
              placeholder="Tìm theo tên hoặc SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <GlassSelect
            id="filter-priority"
            value={priorityLevel}
            onChange={(val) => setPriorityLevel(val as typeof priorityLevel)}
            options={[
              { value: '', label: 'Tất cả ưu tiên' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
            ]}
            placeholder="Tất cả ưu tiên"
          />

          <div className={styles.inputWrap}>
            <Filter size={14} className={styles.inputIcon} />
            <input
              id="filter-address"
              className={styles.input}
              placeholder="Lọc theo khu vực..."
              value={addressContains}
              onChange={(e) => setAddressContains(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className={styles.inputWrap} style={{ maxWidth: 180 }}>
            <Clock size={14} className={styles.inputIcon} />
            <input
              id="filter-waited"
              className={styles.input}
              type="number"
              min={0}
              placeholder="Chờ hơn X phút"
              value={waitedMinutesInput}
              onChange={(e) => setWaitedMinutesInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        <div className={styles.filterActions}>
          <button id="btn-reset-filter" className={styles.btnReset} onClick={handleReset}>
            Đặt lại
          </button>
          <button id="btn-search" className={styles.btnSearch} onClick={handleSearch}>
            {isFetching && !isLoading ? <Loader2 size={13} className={styles.spinning} /> : <Search size={13} />}
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
          </div>
        ) : isError ? (
          <div className={styles.emptyState}>
            <AlertCircle size={32} className={styles.emptyIcon} />
            <p>Không thể tải dữ liệu. Vui lòng thử lại.</p>
          </div>
        ) : !data?.items.length ? (
          <div className={styles.emptyState}>
            <AlertCircle size={32} className={styles.emptyIcon} />
            <p>Không có lead nào đang chờ điều phối.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Khách hàng</th>
                <th>Địa chỉ</th>
                <th>Nhu cầu</th>
                <th>Ưu tiên</th>
                <th>Thời gian chờ</th>
                <th>Ngày tạo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.leadId} className={rowClass(item)}>
                  <td>
                    <span className={styles.leadCode}>{item.leadCode}</span>
                  </td>
                  <td>
                    <div className={styles.customerName}>{item.customerName}</div>
                    <div className={styles.customerPhone}>{item.customerPhone}</div>
                  </td>
                  <td>
                    <span className={styles.address} title={item.customerAddress}>
                      {item.customerAddress || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={styles.needDesc} title={item.needDescription}>
                      {item.needType ? NEED_TYPE_LABELS[item.needType] : '—'}
                    </span>
                  </td>
                  <td>
                    <PriorityBadge level={item.priorityLevel} />
                  </td>
                  <td>
                    <WaitBadge minutes={item.waitedMinutes} />
                  </td>
                  <td className={styles.dateCell}>{fmtDate(item.createdAt)}</td>
                  <td>
                    <button
                      id={`btn-dispatch-${item.leadId}`}
                      className={styles.btnDispatch}
                      onClick={() => navigate(`/dp/queue/${item.leadId}`)}
                    >
                      <ArrowUpRight size={13} />
                      Phân công
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalCount > PAGE_SIZE && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Trang {page} / {totalPages} — {data.totalCount} kết quả
          </span>
          <div className={styles.paginationBtns}>
            <button
              className={styles.pageBtn}
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              aria-label="Trang trước"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              aria-label="Trang sau"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
