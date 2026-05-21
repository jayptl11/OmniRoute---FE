import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useSaleLeads } from '@/features/sa/hooks/useSaleLeads';
import type { GetSaleLeadsParams, LeadStatus, PriorityLevel, SaleLeadListItemDto } from '@/types/leads';
import {
  SA_LEAD_STATUS_LABELS,
  ALL_LEAD_CHANNELS,
  NEED_TYPE_LABELS,
} from '@/types/leads';
import { GlassSelect } from '@/components/glass';
import styles from './SaleLeadsListPage.module.css';
import { getChannelLabel } from '@/lib/roleChannel';

const PAGE_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusClass(status: LeadStatus): string {
  switch (status) {
    case 'Assigned':   return styles.statusAssigned;
    case 'Contacted':  return styles.statusContacted;
    case 'InProgress': return styles.statusProgress;
    case 'Won':        return styles.statusWon;
    case 'Lost':       return styles.statusLost;
    case 'Cancelled':  return styles.statusCancelled;
    default:           return styles.statusDefault;
  }
}

function priorityClass(level: PriorityLevel): string {
  if (level === 'High')   return styles.priorityHigh;
  if (level === 'Medium') return styles.priorityMedium;
  return styles.priorityLow;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Returns minutes remaining until deadline (negative if violated) */
function minutesUntilSla(deadline: string | null): number | null {
  if (!deadline) return null;
  return Math.floor((new Date(deadline).getTime() - Date.now()) / 60000);
}

function SlaCell({ lead }: { lead: SaleLeadListItemDto }) {
  if (!lead.slaDeadline) return <span className={styles.cellMuted}>—</span>;

  if (lead.slaViolated) {
    return (
      <span className={styles.slaViolatedBadge}>
        <AlertTriangle size={11} /> Vi phạm SLA
      </span>
    );
  }

  const mins = minutesUntilSla(lead.slaDeadline);
  const isCritical = mins !== null && mins < 120; // < 2 hours
  return (
    <span className={isCritical ? styles.slaCritical : styles.slaNormal}>
      {formatDate(lead.slaDeadline)}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SaleLeadsListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState<GetSaleLeadsParams>({ page: 1, pageSize: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isFetching, refetch } = useSaleLeads(params);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setParams((p) => ({ ...p, page: 1, search: searchInput || undefined }));
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  const leads: SaleLeadListItemDto[] = data?.items ?? [];
  const total = data?.totalCount ?? 0;
  const page = params.page ?? 1;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Lead được gán</h1>
          <p className={styles.subtitle}>
            Danh sách lead phân công cho bạn — sort theo mức ưu tiên và SLA
          </p>
        </div>
      </div>

      {/* Filters — SA-03 */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            id="sa-leads-search"
            className={styles.searchInput}
            placeholder="Tìm theo SĐT hoặc tên KH..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <GlassSelect
          id="sa-leads-status-filter"
          value={params.status ?? ''}
          onChange={(val) =>
            setParams((p) => ({ ...p, page: 1, status: (val as LeadStatus) || undefined }))
          }
          options={[
            { value: '', label: 'Tất cả trạng thái' },
            ...(Object.entries(SA_LEAD_STATUS_LABELS) as [LeadStatus, string][]).map(([val, label]) => ({ value: val, label })),
          ]}
          placeholder="Tất cả trạng thái"
        />

        <GlassSelect
          id="sa-leads-priority-filter"
          value={params.priorityLevel ?? ''}
          onChange={(val) =>
            setParams((p) => ({ ...p, page: 1, priorityLevel: (val as PriorityLevel) || undefined }))
          }
          options={[
            { value: '', label: 'Tất cả mức ưu tiên' },
            { value: 'High', label: 'High' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Low', label: 'Low' },
          ]}
          placeholder="Tất cả mức ưu tiên"
        />

        <GlassSelect
          id="sa-leads-channel-filter"
          value={params.channel ?? ''}
          onChange={(val) =>
            setParams((p) => ({ ...p, page: 1, channel: (val as any) || undefined }))
          }
          options={[
            { value: '', label: 'Tất cả kênh' },
            ...ALL_LEAD_CHANNELS.map((c) => ({ value: c, label: getChannelLabel(c) })),
          ]}
          placeholder="Tất cả kênh"
        />

        <input
          id="sa-leads-date-from"
          type="date"
          className={styles.dateInput}
          title="Ngày gán từ"
          onChange={(e) =>
            setParams((p) => ({ ...p, page: 1, dateFrom: e.target.value || undefined }))
          }
        />
        <input
          id="sa-leads-date-to"
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

      {/* Table — SA-01 */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã Lead</th>
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
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  Không có lead nào được gán cho bạn
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.leadId} onClick={() => navigate(`/sa/leads/${lead.leadId}`)}>
                  <td><span className={styles.cellCode}>{lead.leadCode}</span></td>
                  <td className={styles.cellBold}>{lead.customerName}</td>
                  <td className={styles.cellMuted}>{lead.customerPhone}</td>
                  <td className={styles.cellMuted}>
                    {lead.needType ? NEED_TYPE_LABELS[lead.needType] : '—'}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusClass(lead.leadStatus)}`}>
                      {SA_LEAD_STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus}
                    </span>
                  </td>
                  <td>
                    {lead.priorityLevel ? (
                      <span className={`${styles.priorityBadge} ${priorityClass(lead.priorityLevel)}`}>
                        {lead.priorityLevel}
                      </span>
                    ) : '—'}
                  </td>
                  <td><SlaCell lead={lead} /></td>
                  <td className={styles.cellMuted}>{formatDate(lead.assignedAt)}</td>
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
            {total} lead · Trang {page}/{totalPages}
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
