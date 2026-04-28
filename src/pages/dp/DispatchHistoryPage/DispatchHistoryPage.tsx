import { AlertCircle, Loader2 } from 'lucide-react';
import { useDispatchHistory } from '@/features/dp/hooks/useDispatch';
import type { DispatchHistoryItemDto } from '@/types/dispatch';
import { DISPATCH_LEAD_STATUS_LABELS } from '@/types/dispatch';
import type { LeadStatus } from '@/types/leads';
import styles from './DispatchHistoryPage.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const cls =
    status === 'Won' ? styles.statusWon :
    status === 'Lost' ? styles.statusLost :
    status === 'Cancelled' ? styles.statusCancelled :
    status === 'InProgress' ? styles.statusInProgress :
    status === 'Contacted' ? styles.statusContacted :
    styles.statusAssigned;

  return (
    <span className={`${styles.badge} ${cls}`}>
      {DISPATCH_LEAD_STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function HistoryRow({ item }: { item: DispatchHistoryItemDto }) {
  return (
    <tr>
      <td>
        <span className={styles.leadCode}>{item.leadCode}</span>
      </td>
      <td>
        <div className={styles.customerName}>{item.customerName}</div>
        <div className={styles.customerPhone}>{item.customerPhone}</div>
      </td>
      <td>
        <div className={styles.storeName}>{item.storeName}</div>
      </td>
      <td>
        <span className={styles.note} title={item.dispatchNote ?? ''}>
          {item.dispatchNote || <span className={styles.noNote}>—</span>}
        </span>
      </td>
      <td className={styles.dateCell}>{fmtDate(item.dispatchedAt)}</td>
      <td>
        <StatusBadge status={item.leadStatus} />
      </td>
    </tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DispatchHistoryPage() {
  const { data: items, isLoading, isError, isFetching } = useDispatchHistory();

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Lịch sử phân công</h1>
          <p className={styles.pageSubtitle}>
            {isFetching && !isLoading
              ? <><Loader2 size={12} className={styles.spinning} /> Đang cập nhật...</>
              : items
                ? `${items.length} lead đã được phân công`
                : 'Lead mà bạn đã điều phối về cửa hàng'
            }
          </p>
        </div>
      </div>

      <div className={styles.tableWrap}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
          </div>
        ) : isError ? (
          <div className={styles.emptyState}>
            <AlertCircle size={32} className={styles.emptyIcon} />
            <p>Không thể tải lịch sử. Vui lòng thử lại.</p>
          </div>
        ) : !items?.length ? (
          <div className={styles.emptyState}>
            <AlertCircle size={32} className={styles.emptyIcon} />
            <p>Bạn chưa phân công lead nào.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Khách hàng</th>
                <th>Cửa hàng</th>
                <th>Ghi chú phân công</th>
                <th>Ngày phân công</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <HistoryRow key={item.leadId} item={item} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
