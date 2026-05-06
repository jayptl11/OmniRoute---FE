import { useState, useEffect, useCallback } from 'react';
import { useAuditLogs, useExportAuditLogs } from '@/features/qt/hooks/useAudit';
import type { GetAuditLogsParams } from '@/types/dashboard';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Eye, X, Download } from 'lucide-react';
import styles from './AuditLogsPage.module.css';
import { GlassSelect } from '@/components/glass';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDatetime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const ENTITY_TYPE_OPTIONS = ['', 'LEAD', 'TICKET', 'USER', 'RULE', 'SYSTEM'];

const ACTION_LABELS: Record<string, string> = {
  CREATED: 'Tạo mới',
  STATUS_CHANGED: 'Đổi trạng thái',
  ASSIGNED: 'Gán',
  REASSIGNED: 'Gán lại',
  ESCALATED: 'Escalate',
  NOTE_ADDED: 'Thêm ghi chú',
  FOLLOW_UP_SET: 'Follow-up',
  RULE_MATCHED: 'Rule khớp',
  DEFAULT_GROUP_HIT: 'Nhóm mặc định',
};

const ENTITY_COLORS: Record<string, string> = {
  LEAD: '#6366f1',
  TICKET: '#10b981',
  USER: '#f59e0b',
  RULE: '#8b5cf6',
  SYSTEM: '#64748b',
};

// ── Diff Modal ────────────────────────────────────────────────────────────────

function DiffModal({
  oldValue,
  newValue,
  onClose,
}: {
  oldValue: string | null;
  newValue: string | null;
  onClose: () => void;
}) {
  let oldObj: unknown = null;
  let newObj: unknown = null;
  try { oldObj = oldValue ? JSON.parse(oldValue) : null; } catch {}
  try { newObj = newValue ? JSON.parse(newValue) : null; } catch {}

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Xem thay đổi</h3>
          <button className={styles.modalClose} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={styles.diffGrid}>
          <div className={styles.diffCol}>
            <p className={styles.diffLabel}>Trước</p>
            <pre className={`${styles.diffPre} ${styles.diffOld}`}>
              {oldObj != null ? JSON.stringify(oldObj, null, 2) : oldValue ?? '—'}
            </pre>
          </div>
          <div className={styles.diffCol}>
            <p className={styles.diffLabel}>Sau</p>
            <pre className={`${styles.diffPre} ${styles.diffNew}`}>
              {newObj != null ? JSON.stringify(newObj, null, 2) : newValue ?? '—'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [actionInput, setActionInput] = useState('');
  const [actionDebounced, setActionDebounced] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [diffTarget, setDiffTarget] = useState<{ old: string | null; new: string | null } | null>(null);

  // Debounce action input
  useEffect(() => {
    const t = setTimeout(() => {
      setActionDebounced(actionInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [actionInput]);

  const resetPage = useCallback(() => setPage(1), []);

  const params: GetAuditLogsParams = {
    entityType: entityType || undefined,
    action: actionDebounced || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading, isFetching, isError } = useAuditLogs(params);
  const { mutate: exportLogs, isPending: isExporting } = useExportAuditLogs();

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  function handleClearFilters() {
    setEntityType('');
    setActionInput('');
    setActionDebounced('');
    setDateFrom('');
    setDateTo('');
    resetPage();
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Audit Log hệ thống</h1>
          <p className={styles.pageDesc}>Lịch sử toàn bộ hành động trên hệ thống</p>
        </div>
        <button
          className={styles.exportBtn}
          onClick={() => exportLogs({
            entityType: entityType || undefined,
            action: actionDebounced || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
          })}
          disabled={isExporting}
          id="audit-export-btn"
        >
          {isExporting ? <RefreshCw size={14} className={styles.spin} /> : <Download size={14} />}
          Xuất Excel
        </button>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Loại entity</label>
          <GlassSelect
            className={styles.filterSelect}
            value={entityType}
            onChange={(val) => { setEntityType(val); resetPage(); }}
            options={[
              { value: '', label: 'Tất cả' },
              ...ENTITY_TYPE_OPTIONS.filter(Boolean).map(t => ({ value: t, label: t }))
            ]}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Hành động</label>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.filterInput}
              placeholder="Tìm kiếm action..."
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              id="audit-filter-action"
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Từ ngày</label>
          <input
            className={styles.filterInput}
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); resetPage(); }}
            id="audit-filter-datefrom"
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Đến ngày</label>
          <input
            className={styles.filterInput}
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); resetPage(); }}
            id="audit-filter-dateto"
          />
        </div>

        <button className={styles.clearBtn} onClick={handleClearFilters}>
          <X size={13} /> Xoá bộ lọc
        </button>
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        {(isLoading || isFetching) && (
          <span className={styles.loadingText}>
            <RefreshCw size={13} className={styles.spin} /> Đang tải...
          </span>
        )}
        {data && !isLoading && (
          <span className={styles.totalText}>
            {data.totalCount.toLocaleString('vi-VN')} bản ghi
          </span>
        )}
      </div>

      {isError && (
        <div className={styles.errorCard}>Không thể tải audit log. Vui lòng thử lại.</div>
      )}

      {/* Table */}
      {data && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Thời điểm</th>
                  <th>Entity</th>
                  <th>Hành động</th>
                  <th>Thực hiện bởi</th>
                  <th>Nội bộ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.emptyCell}>Không có bản ghi nào.</td>
                  </tr>
                )}
                {data.items.map((log) => (
                  <tr key={log.id}>
                    <td className={styles.timeCell}>{fmtDatetime(log.performedAt)}</td>
                    <td>
                      <span
                        className={styles.entityBadge}
                        style={{
                          background: `${ENTITY_COLORS[log.entityType] ?? '#64748b'}18`,
                          color: ENTITY_COLORS[log.entityType] ?? '#64748b',
                        }}
                      >
                        {log.entityType}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span className={styles.actionCode}>{log.action}</span>
                        {ACTION_LABELS[log.action] && (
                          <span className={styles.actionLabel}>{ACTION_LABELS[log.action]}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {log.performedBy == null ? (
                        <span className={styles.systemBadge}>🤖 Hệ thống</span>
                      ) : (
                        <span>{log.performedByName ?? log.performedBy}</span>
                      )}
                    </td>
                    <td>
                      {log.isInternal && (
                        <span className={styles.internalBadge}>Nội bộ</span>
                      )}
                    </td>
                    <td>
                      {(log.oldValue || log.newValue) && (
                        <button
                          className={styles.viewDiffBtn}
                          onClick={() => setDiffTarget({ old: log.oldValue, new: log.newValue })}
                          title="Xem thay đổi"
                        >
                          <Eye size={14} />
                        </button>
                      )}
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft size={15} />
              </button>
              <span className={styles.pageInfo}>
                Trang {page} / {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Diff Modal */}
      {diffTarget && (
        <DiffModal
          oldValue={diffTarget.old}
          newValue={diffTarget.new}
          onClose={() => setDiffTarget(null)}
        />
      )}
    </div>
  );
}
