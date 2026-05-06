import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useTickets } from '@/features/cs/hooks/useTickets';
import type {
  GetTicketsParams,
  TicketStatus,
  TicketPriorityLevel,
  TicketListItemDto,
} from '@/types/tickets';
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_NEED_TYPE_LABELS,
} from '@/types/tickets';
import { GlassSelect } from '@/components/glass';
import styles from './TicketsListPage.module.css';

const PAGE_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Returns minutes until deadline; negative = overdue */
function minutesUntilDeadline(deadline: string): number {
  return Math.floor((new Date(deadline).getTime() - Date.now()) / 60000);
}

function SlaCell({ ticket }: { ticket: TicketListItemDto }) {
  if (ticket.slaViolated) {
    return (
      <span className={styles.slaViolated}>
        <AlertTriangle size={11} /> Vi phạm SLA
      </span>
    );
  }
  const mins = minutesUntilDeadline(ticket.slaDeadline);
  if (mins < 30) {
    return (
      <span className={styles.slaCritical}>
        <Clock size={11} /> Sắp đến hạn
      </span>
    );
  }
  return <span className={styles.slaNormal}>{formatDate(ticket.slaDeadline)}</span>;
}

function statusClass(status: TicketStatus): string {
  switch (status) {
    case 'New':             return styles.statusNew;
    case 'InProgress':      return styles.statusInProgress;
    case 'WaitingCustomer': return styles.statusWaiting;
    case 'Escalated':       return styles.statusEscalated;
    case 'Resolved':        return styles.statusResolved;
    case 'Closed':          return styles.statusClosed;
    default:                return '';
  }
}

function rowClass(ticket: TicketListItemDto): string {
  if (ticket.slaViolated)                return styles.rowViolated;
  if (ticket.priorityLevel === 'High')   return styles.rowHigh;
  if (ticket.priorityLevel === 'Medium') return styles.rowMedium;
  return '';
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TicketsListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState<GetTicketsParams>({ page: 1, pageSize: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isFetching, refetch } = useTickets(params);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setParams((p) => ({ ...p, page: 1, search: searchInput || undefined }));
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  const tickets: TicketListItemDto[] = data?.items ?? [];
  const total = data?.totalCount ?? 0;
  const page = params.page ?? 1;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ticket được gán</h1>
          <p className={styles.subtitle}>
            Danh sách ticket phân công cho bạn — sort theo mức ưu tiên và SLA
          </p>
        </div>
      </div>

      {/* Filters — CS-03 */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            id="cs-tickets-search"
            className={styles.searchInput}
            placeholder="Tìm theo tên, SĐT hoặc mã ticket…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <GlassSelect
          id="cs-tickets-status-filter"
          value={params.status ?? ''}
          onChange={(val) =>
            setParams((p) => ({ ...p, page: 1, status: (val as TicketStatus) || undefined }))
          }
          options={[
            { value: '', label: 'Tất cả trạng thái' },
            ...(Object.entries(TICKET_STATUS_LABELS) as [TicketStatus, string][]).map(([val, label]) => ({
              value: val,
              label,
            })),
          ]}
          placeholder="Tất cả trạng thái"
        />

        <GlassSelect
          id="cs-tickets-priority-filter"
          value={params.priorityLevel ?? ''}
          onChange={(val) =>
            setParams((p) => ({ ...p, page: 1, priorityLevel: (val as TicketPriorityLevel) || undefined }))
          }
          options={[
            { value: '', label: 'Tất cả mức ưu tiên' },
            { value: 'High', label: 'Cao' },
            { value: 'Medium', label: 'Trung bình' },
            { value: 'Low', label: 'Thấp' },
          ]}
          placeholder="Tất cả mức ưu tiên"
        />

        <input
          id="cs-tickets-date-from"
          type="date"
          className={styles.dateInput}
          title="Ngày gán từ"
          onChange={(e) =>
            setParams((p) => ({ ...p, page: 1, dateFrom: e.target.value || undefined }))
          }
        />
        <input
          id="cs-tickets-date-to"
          type="date"
          className={styles.dateInput}
          title="Ngày gán đến"
          onChange={(e) =>
            setParams((p) => ({ ...p, page: 1, dateTo: e.target.value || undefined }))
          }
        />

        <button className={styles.btnIcon} onClick={() => refetch()} title="Làm mới">
          <RefreshCw size={14} className={isFetching ? styles.spinning : ''} />
        </button>
      </div>

      {/* Table — CS-01 */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã Ticket</th>
              <th>Tên KH</th>
              <th>Số điện thoại</th>
              <th>Loại nhu cầu</th>
              <th>Trạng thái</th>
              <th>Ưu tiên</th>
              <th>SLA Deadline</th>
              <th>Ngày gán</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  <div className={styles.loadingSpinner} />
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  Không có ticket nào được gán cho bạn
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.ticketId}
                  className={rowClass(ticket)}
                  onClick={() => navigate(`/cs/tickets/${ticket.ticketId}`)}
                >
                  <td><span className={styles.cellCode}>{ticket.ticketCode}</span></td>
                  <td className={styles.cellBold}>{ticket.customerName}</td>
                  <td className={styles.cellMuted}>{ticket.customerPhone}</td>
                  <td className={styles.cellMuted}>
                    {TICKET_NEED_TYPE_LABELS[ticket.needType] ?? ticket.needType}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusClass(ticket.ticketStatus)}`}>
                      {TICKET_STATUS_LABELS[ticket.ticketStatus]}
                      {ticket.ticketStatus === 'WaitingCustomer' && ' · Chờ KH'}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.priorityBadge} ${
                      ticket.priorityLevel === 'High'   ? styles.priorityHigh   :
                      ticket.priorityLevel === 'Medium' ? styles.priorityMedium :
                      styles.priorityLow
                    }`}>
                      {TICKET_PRIORITY_LABELS[ticket.priorityLevel]}
                    </span>
                  </td>
                  <td><SlaCell ticket={ticket} /></td>
                  <td className={styles.cellMuted}>{formatDate(ticket.assignedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            {total} ticket · Trang {page}/{totalPages}
          </span>
          <div className={styles.paginationBtns}>
            <button
              className={styles.pageBtn}
              disabled={page <= 1}
              onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
