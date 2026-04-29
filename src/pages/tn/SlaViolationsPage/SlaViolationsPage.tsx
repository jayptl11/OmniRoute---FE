import { useState } from 'react';
import { useSlaViolations } from '@/features/tn/hooks/useTeamLead';
import { ReassignDialog } from './ReassignDialog';
import { TN_PRIORITY_LABELS, TN_LEAD_STATUS_LABELS } from '@/types/teamlead';
import type { SlaViolationDto } from '@/types/teamlead';
import { AlertTriangle, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './SlaViolationsPage.module.css';

function SlaHoursBadge({ hours, violated }: { hours: number; violated: boolean }) {
  if (violated) {
    return (
      <span className={`${styles.hoursBadge} ${styles.badgeRed}`}>
        Vi phạm {Math.abs(hours).toFixed(1)}h
      </span>
    );
  }
  if (hours <= 2) {
    return (
      <span className={`${styles.hoursBadge} ${styles.badgeOrange}`}>
        Còn {hours.toFixed(1)}h
      </span>
    );
  }
  return (
    <span className={`${styles.hoursBadge} ${styles.badgeGray}`}>
      Còn {hours.toFixed(1)}h
    </span>
  );
}

export function SlaViolationsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [reassignTarget, setReassignTarget] = useState<SlaViolationDto | null>(null);

  const { data, isLoading, isError, refetch } = useSlaViolations({ page, pageSize });

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <ShieldAlert size={22} className={styles.titleIcon} />
          <h1 className={styles.pageTitle}>SLA Alert</h1>
        </div>
        <p className={styles.pageSubtitle}>Lead vi phạm hoặc sắp vi phạm SLA trong đội</p>
      </div>

      {isLoading && (
        <div className={styles.loadingWrap}><div className={styles.spinner} /></div>
      )}

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
                  <th>Ưu tiên</th>
                  <th>Trạng thái</th>
                  <th>SLA Deadline</th>
                  <th>Thời gian</th>
                  <th>SA phụ trách</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.emptyRow}>
                      <AlertTriangle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      Không có lead nào vi phạm SLA
                    </td>
                  </tr>
                )}
                {data.items.map((item) => (
                  <tr
                    key={item.leadId}
                    className={item.slaViolated ? styles.rowViolated : item.hoursUntilDeadline <= 2 ? styles.rowWarning : ''}
                  >
                    <td><span className={styles.leadCode}>{item.leadCode}</span></td>
                    <td>
                      <p className={styles.customerName}>{item.customerName}</p>
                      <p className={styles.customerPhone}>{item.customerPhone}</p>
                    </td>
                    <td>
                      {item.priorityLevel ? (
                        <span
                          className={styles.priorityBadge}
                          data-priority={item.priorityLevel}
                        >
                          {TN_PRIORITY_LABELS[item.priorityLevel]}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={styles.statusBadge}>
                        {TN_LEAD_STATUS_LABELS[item.leadStatus]}
                      </span>
                    </td>
                    <td className={styles.deadlineCell}>
                      {new Date(item.slaDeadline).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <SlaHoursBadge hours={item.hoursUntilDeadline} violated={item.slaViolated} />
                    </td>
                    <td className={styles.assigneeCell}>
                      {item.assignedUserName ?? <span className={styles.unassigned}>Chưa gán</span>}
                    </td>
                    <td>
                      <button
                        className={styles.actionBtn}
                        onClick={() => setReassignTarget(item)}
                        id={`reassign-${item.leadId}`}
                      >
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className={styles.pageInfo}>
                Trang {page} / {totalPages} ({data.totalCount} lead)
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {reassignTarget && (
        <ReassignDialog
          leadId={reassignTarget.leadId}
          leadCode={reassignTarget.leadCode}
          currentAssigneeName={reassignTarget.assignedUserName}
          onClose={() => setReassignTarget(null)}
          onSuccess={() => setReassignTarget(null)}
        />
      )}
    </div>
  );
}
