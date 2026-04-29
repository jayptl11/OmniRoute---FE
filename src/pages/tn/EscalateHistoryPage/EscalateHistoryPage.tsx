import { useState } from 'react';
import { useEscalateHistory } from '@/features/tn/hooks/useTeamLead';
import { ArrowUpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './EscalateHistoryPage.module.css';

export function EscalateHistoryPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError, refetch } = useEscalateHistory({ page, pageSize });
  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <ArrowUpCircle size={20} className={styles.titleIcon} />
          <h1 className={styles.pageTitle}>Lịch sử Escalate</h1>
        </div>
        <p className={styles.pageSubtitle}>Danh sách các lead đã được escalate bởi bạn</p>
      </div>

      {isLoading && <div className={styles.loadingWrap}><div className={styles.spinner} /></div>}

      {isError && (
        <div className={styles.errorWrap}>
          <p>Không thể tải dữ liệu. <button onClick={() => refetch()} className={styles.retryBtn}>Thử lại</button></p>
        </div>
      )}

      {data && (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã lead</th>
                  <th>Khách hàng</th>
                  <th>Escalate đến</th>
                  <th>Lý do</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.emptyRow}>Chưa có lịch sử escalate</td>
                  </tr>
                )}
                {data.items.map((item) => (
                  <tr key={item.logId}>
                    <td><span className={styles.leadCode}>{item.leadCode}</span></td>
                    <td>
                      <p className={styles.customerName}>{item.customerName}</p>
                      <p className={styles.customerPhone}>{item.customerPhone}</p>
                    </td>
                    <td className={styles.targetCell}>
                      <span className={styles.targetName}>{item.escalateToName}</span>
                    </td>
                    <td className={styles.reasonCell}>{item.reason}</td>
                    <td className={styles.timeCell}>
                      {new Date(item.performedAt).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
                <ChevronLeft size={16} />
              </button>
              <span className={styles.pageInfo}>Trang {page} / {totalPages} ({data.totalCount} bản ghi)</span>
              <button className={styles.pageBtn} onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
