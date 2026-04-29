import { useState } from 'react';
import { useTeamLeads, useTeamMembers } from '@/features/tn/hooks/useTeamLead';
import { EscalateDialog } from './EscalateDialog';
import { InternalNoteDialog } from './InternalNoteDialog';
import { ReassignDialog } from '../SlaViolationsPage/ReassignDialog';
import {
  TN_LEAD_STATUS_LABELS,
  TN_PRIORITY_LABELS,
  TN_CHANNEL_LABELS,
} from '@/types/teamlead';
import type { TeamLeadListItemDto, TnLeadStatus, TnPriorityLevel, TnChannel } from '@/types/teamlead';
import { Search, Filter, ChevronLeft, ChevronRight, List } from 'lucide-react';
import styles from './TeamLeadsPage.module.css';

type DialogType = 'reassign' | 'escalate' | 'note' | null;

interface ActiveDialog {
  type: DialogType;
  lead: TeamLeadListItemDto;
}

const ALL_STATUSES: TnLeadStatus[] = [
  'New', 'PendingResponse', 'InProgress', 'Escalated', 'Won', 'Lost', 'Invalid', 'Closed',
];
const ALL_PRIORITIES: TnPriorityLevel[] = ['High', 'Medium', 'Low'];
const ALL_CHANNELS: TnChannel[] = ['Web', 'Facebook', 'Zalo', 'Phone', 'Walkin', 'Other'];

export function TeamLeadsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<TnLeadStatus | ''>('');
  const [priorityLevel, setPriorityLevel] = useState<TnPriorityLevel | ''>('');
  const [channel, setChannel] = useState<TnChannel | ''>('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeDialog, setActiveDialog] = useState<ActiveDialog | null>(null);

  const { data: members } = useTeamMembers();

  const params = {
    search: search || undefined,
    status: status || undefined,
    priorityLevel: priorityLevel || undefined,
    channel: channel || undefined,
    assignedUserId: assignedUserId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    pageSize,
  };

  const { data, isLoading, isError, refetch } = useTeamLeads(params);
  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleFilterChange = () => setPage(1);

  const openDialog = (type: DialogType, lead: TeamLeadListItemDto) => {
    setActiveDialog({ type, lead });
  };
  const closeDialog = () => setActiveDialog(null);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <List size={20} className={styles.titleIcon} />
          <h1 className={styles.pageTitle}>Danh sách lead trong đội</h1>
        </div>
        <p className={styles.pageSubtitle}>Tìm kiếm, lọc và quản lý lead của toàn đội</p>
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <form className={styles.searchRow} onSubmit={handleSearch}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Tìm theo tên hoặc SĐT khách hàng..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              id="lead-search"
            />
          </div>
          <button type="submit" className={styles.searchBtn}>Tìm kiếm</button>
        </form>

        <div className={styles.filterRow}>
          <Filter size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />

          <select
            className={styles.filterSelect}
            value={status}
            onChange={(e) => { setStatus(e.target.value as TnLeadStatus | ''); handleFilterChange(); }}
            id="filter-status"
          >
            <option value="">Tất cả trạng thái</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{TN_LEAD_STATUS_LABELS[s]}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={priorityLevel}
            onChange={(e) => { setPriorityLevel(e.target.value as TnPriorityLevel | ''); handleFilterChange(); }}
            id="filter-priority"
          >
            <option value="">Tất cả ưu tiên</option>
            {ALL_PRIORITIES.map((p) => (
              <option key={p} value={p}>{TN_PRIORITY_LABELS[p]}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={channel}
            onChange={(e) => { setChannel(e.target.value as TnChannel | ''); handleFilterChange(); }}
            id="filter-channel"
          >
            <option value="">Tất cả kênh</option>
            {ALL_CHANNELS.map((c) => (
              <option key={c} value={c}>{TN_CHANNEL_LABELS[c]}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={assignedUserId}
            onChange={(e) => { setAssignedUserId(e.target.value); handleFilterChange(); }}
            id="filter-assigned"
          >
            <option value="">Tất cả SA</option>
            {(members ?? []).map((m) => (
              <option key={m.userId} value={m.userId}>{m.fullName}</option>
            ))}
          </select>

          <input
            type="date"
            className={styles.filterSelect}
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); handleFilterChange(); }}
            id="filter-date-from"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            className={styles.filterSelect}
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); handleFilterChange(); }}
            id="filter-date-to"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading && <div className={styles.loadingWrap}><div className={styles.spinner} /></div>}
      {isError && (
        <div className={styles.errorWrap}>
          <p>Không thể tải dữ liệu. <button onClick={() => refetch()} className={styles.retryBtn}>Thử lại</button></p>
        </div>
      )}

      {data && (
        <>
          <div className={styles.tableWrap}>
            <div className={styles.tableCount}>
              Hiển thị {data.items.length} / {data.totalCount} lead
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã lead</th>
                  <th>Khách hàng</th>
                  <th>Ưu tiên</th>
                  <th>Trạng thái</th>
                  <th>SLA Deadline</th>
                  <th>SA phụ trách</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className={styles.emptyRow}>Không có lead nào phù hợp</td>
                  </tr>
                )}
                {data.items.map((item) => (
                  <tr key={item.leadId} className={item.slaViolated ? styles.rowViolated : ''}>
                    <td><span className={styles.leadCode}>{item.leadCode}</span></td>
                    <td>
                      <p className={styles.customerName}>{item.customerName}</p>
                      <p className={styles.customerPhone}>{item.customerPhone}</p>
                    </td>
                    <td>
                      {item.priorityLevel ? (
                        <span className={styles.priorityBadge} data-priority={item.priorityLevel}>
                          {TN_PRIORITY_LABELS[item.priorityLevel]}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={styles.statusBadge} data-status={item.leadStatus}>
                        {TN_LEAD_STATUS_LABELS[item.leadStatus]}
                      </span>
                    </td>
                    <td className={styles.deadlineCell}>
                      {item.slaDeadline ? (
                        <span className={item.slaViolated ? styles.deadlineViolated : ''}>
                          {new Date(item.slaDeadline).toLocaleString('vi-VN', {
                            day: '2-digit', month: '2-digit',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      ) : '—'}
                    </td>
                    <td>{item.assignedUserName ?? <span className={styles.unassigned}>Chưa gán</span>}</td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.actionBtnOutline}
                          onClick={() => openDialog('reassign', item)}
                          id={`btn-reassign-${item.leadId}`}
                        >
                          Reassign
                        </button>
                        <button
                          className={styles.actionBtnOutline}
                          onClick={() => openDialog('escalate', item)}
                          id={`btn-escalate-${item.leadId}`}
                        >
                          Escalate
                        </button>
                        <button
                          className={styles.actionBtnGhost}
                          onClick={() => openDialog('note', item)}
                          id={`btn-note-${item.leadId}`}
                        >
                          Ghi chú
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className={styles.pageInfo}>Trang {page} / {totalPages}</span>
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

      {/* Dialogs */}
      {activeDialog?.type === 'reassign' && (
        <ReassignDialog
          leadId={activeDialog.lead.leadId}
          leadCode={activeDialog.lead.leadCode}
          currentAssigneeName={activeDialog.lead.assignedUserName}
          onClose={closeDialog}
          onSuccess={closeDialog}
        />
      )}
      {activeDialog?.type === 'escalate' && (
        <EscalateDialog
          leadId={activeDialog.lead.leadId}
          leadCode={activeDialog.lead.leadCode}
          onClose={closeDialog}
          onSuccess={closeDialog}
        />
      )}
      {activeDialog?.type === 'note' && (
        <InternalNoteDialog
          leadId={activeDialog.lead.leadId}
          leadCode={activeDialog.lead.leadCode}
          onClose={closeDialog}
          onSuccess={closeDialog}
        />
      )}
    </div>
  );
}
