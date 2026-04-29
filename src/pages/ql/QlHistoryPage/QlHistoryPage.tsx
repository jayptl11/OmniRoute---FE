import { useState } from 'react';
import { useStoreLeadHistory, useStoreMembers } from '@/features/ql/hooks/useStoreManager';
import type { GetStoreHistoryParams, StoreLeadHistoryItemDto } from '@/types/storemanager';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './QlHistoryPage.module.css';

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDatetime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

type ActionMeta = { label: string; colorClass: string };

function getActionMeta(action: string, cssModule: Record<string, string>): ActionMeta {
  const map: Record<string, ActionMeta> = {
    LEAD_REASSIGNED:    { label: 'Reassign lead',     colorClass: cssModule.actionBlue },
    STATUS_CHANGED:     { label: 'Thay đổi trạng thái', colorClass: cssModule.actionPurple },
    NOTE_ADDED:         { label: 'Thêm ghi chú',      colorClass: cssModule.actionGray },
    STORE_STAFF_ADDED:  { label: 'Thêm nhân sự',      colorClass: cssModule.actionGreen },
    STORE_STAFF_REMOVED:{ label: 'Xóa nhân sự',       colorClass: cssModule.actionRed },
  };
  return map[action] ?? { label: action, colorClass: cssModule.actionGray };
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export function QlHistoryPage() {
  const [params, setParams] = useState<GetStoreHistoryParams>({ page: 1, pageSize: 20 });
  const { data: members = [] } = useStoreMembers();
  const { data, isLoading, isError } = useStoreLeadHistory(params);

  const items = data?.items ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.ceil(total / (params.pageSize ?? 20));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Lịch sử xử lý lead</h1>
        <p className={styles.pageDesc}>Audit trail — toàn bộ hành động trên lead của đơn vị</p>
      </div>

      {/* Filter */}
      <div className={styles.filterBar}>
        <select
          className={styles.filterSelect}
          value={params.userId ?? ''}
          onChange={(e) => setParams((p) => ({ ...p, page: 1, userId: e.target.value || undefined }))}
        >
          <option value="">Tất cả nhân sự</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>{m.fullName}</option>
          ))}
        </select>

        <input
          type="date"
          className={styles.filterDate}
          value={params.dateFrom?.slice(0, 10) ?? ''}
          onChange={(e) => setParams((p) => ({ ...p, page: 1, dateFrom: e.target.value || undefined }))}
        />
        <span className={styles.dateSep}>→</span>
        <input
          type="date"
          className={styles.filterDate}
          value={params.dateTo?.slice(0, 10) ?? ''}
          onChange={(e) => setParams((p) => ({ ...p, page: 1, dateTo: e.target.value || undefined }))}
        />
      </div>

      {isLoading && <div className={styles.loading}>Đang tải lịch sử...</div>}
      {isError && <div className={styles.errorMsg}>Không thể tải lịch sử.</div>}

      {!isLoading && !isError && (
        <>
          {items.length === 0 ? (
            <div className={styles.empty}>Không có dữ liệu lịch sử.</div>
          ) : (
            <div className={styles.timeline}>
              {items.map((item: StoreLeadHistoryItemDto, idx: number) => {
                const meta = getActionMeta(item.action, styles);
                return (
                  <div key={item.logId} className={styles.timelineItem}>
                    {/* Connector line */}
                    <div className={styles.connector}>
                      <div className={`${styles.dot} ${meta.colorClass}`} />
                      {idx < items.length - 1 && <div className={styles.line} />}
                    </div>

                    <div className={styles.timelineContent}>
                      <div className={styles.contentHeader}>
                        <span className={`${styles.actionBadge} ${meta.colorClass}`}>
                          {meta.label}
                        </span>
                        {item.leadCode && (
                          <span className={styles.leadCode}>{item.leadCode}</span>
                        )}
                        <span className={styles.timestamp}>{formatDatetime(item.performedAt)}</span>
                      </div>

                      {(item.customerName || item.customerPhone) && (
                        <p className={styles.customerLine}>
                          {[item.customerName, item.customerPhone].filter(Boolean).join(' · ')}
                        </p>
                      )}

                      {(item.oldValue || item.newValue) && (
                        <div className={styles.diffRow}>
                          {item.oldValue && (
                            <span className={styles.oldValue}>{item.oldValue}</span>
                          )}
                          {item.oldValue && item.newValue && (
                            <span className={styles.arrow}>→</span>
                          )}
                          {item.newValue && (
                            <span className={styles.newValue}>{item.newValue}</span>
                          )}
                        </div>
                      )}

                      {item.note && (
                        <p className={styles.noteText}>💬 {item.note}</p>
                      )}

                      <p className={styles.performedBy}>
                        Thực hiện bởi: <strong>{item.performedByName ?? '—'}</strong>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              {total} bản ghi · Trang {params.page}/{totalPages || 1}
            </span>
            <div className={styles.paginationBtns}>
              <button
                className={styles.pageBtn}
                disabled={(params.page ?? 1) <= 1}
                onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                className={styles.pageBtn}
                disabled={(params.page ?? 1) >= totalPages}
                onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
