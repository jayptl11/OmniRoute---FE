import { useMemo, useState, type FormEvent } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { SearchableUserPicker, type SearchableUserPickerOption } from '@/components/SearchableUserPicker';
import { EscalateDialog } from './EscalateDialog';
import { InternalNoteDialog } from './InternalNoteDialog';
import { ReassignDialog } from '../SlaViolationsPage/ReassignDialog';
import { useTeamLeads, useTeamMembers } from '@/features/tn/hooks/useTeamLead';
import {
  TN_CHANNEL_LABELS,
  TN_LEAD_STATUS_LABELS,
  TN_PRIORITY_LABELS,
  type TeamLeadListItemDto,
  type TeamMemberDto,
  type TnChannel,
  type TnLeadStatus,
  type TnPriorityLevel,
} from '@/types/teamlead';
import { CHANNEL_VALUES } from '@/lib/roleChannel';
import styles from './TeamLeadsPage.module.css';

type DialogType = 'reassign' | 'escalate' | 'note' | null;

interface ActiveDialog {
  type: DialogType;
  lead: TeamLeadListItemDto;
}

const ALL_STATUSES: TnLeadStatus[] = [
  'New',
  'PendingResponse',
  'InProgress',
  'Escalated',
  'Won',
  'Lost',
  'Invalid',
  'Closed',
];
const ALL_PRIORITIES: TnPriorityLevel[] = ['High', 'Medium', 'Low'];
const ALL_CHANNELS: TnChannel[] = [...CHANNEL_VALUES];

function toAssignedUserOption(member: TeamMemberDto): SearchableUserPickerOption<TeamMemberDto> {
  return {
    value: member.userId,
    label: member.fullName,
    raw: member,
  };
}

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

  const { data: members = [] } = useTeamMembers();

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

  const memberOptions = useMemo(() => members.map(toAssignedUserOption), [members]);
  const selectedMember = memberOptions.find((option) => option.value === assignedUserId) ?? null;

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleFilterChange = () => setPage(1);
  const openDialog = (type: DialogType, lead: TeamLeadListItemDto) => setActiveDialog({ type, lead });
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

      <div className={styles.filtersCard}>
        <form className={styles.searchRow} onSubmit={handleSearch}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Tìm theo tên hoặc SĐT khách hàng..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              id="lead-search"
            />
          </div>
          <button type="submit" className={styles.searchBtn}>
            Tìm kiếm
          </button>
        </form>

        <div className={styles.filterRow}>
          <Filter size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />

          <select
            className={styles.filterSelect}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as TnLeadStatus | '');
              handleFilterChange();
            }}
            id="filter-status"
          >
            <option value="">Tất cả trạng thái</option>
            {ALL_STATUSES.map((item) => (
              <option key={item} value={item}>
                {TN_LEAD_STATUS_LABELS[item]}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={priorityLevel}
            onChange={(event) => {
              setPriorityLevel(event.target.value as TnPriorityLevel | '');
              handleFilterChange();
            }}
            id="filter-priority"
          >
            <option value="">Tất cả ưu tiên</option>
            {ALL_PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {TN_PRIORITY_LABELS[item]}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={channel}
            onChange={(event) => {
              setChannel(event.target.value as TnChannel | '');
              handleFilterChange();
            }}
            id="filter-channel"
          >
            <option value="">Tất cả kênh</option>
            {ALL_CHANNELS.map((item) => (
              <option key={item} value={item}>
                {TN_CHANNEL_LABELS[item]}
              </option>
            ))}
          </select>

          <div style={{ minWidth: 220, flex: '1 1 220px' }}>
            <SearchableUserPicker
              mode="local"
              compact
              placeholder="Tất cả SA"
              options={memberOptions}
              selectedOption={selectedMember}
              onChange={(option) => {
                setAssignedUserId(option?.value ?? '');
                handleFilterChange();
              }}
              className={styles.filterPicker}
            />
          </div>

          <input
            type="date"
            className={styles.filterSelect}
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              handleFilterChange();
            }}
            id="filter-date-from"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            className={styles.filterSelect}
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              handleFilterChange();
            }}
            id="filter-date-to"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {isLoading && (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
        </div>
      )}
      {isError && (
        <div className={styles.errorWrap}>
          <p>
            Không thể tải dữ liệu.{' '}
            <button onClick={() => refetch()} className={styles.retryBtn} type="button">
              Thử lại
            </button>
          </p>
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
                    <td colSpan={7} className={styles.emptyRow}>
                      Không có lead nào phù hợp
                    </td>
                  </tr>
                )}
                {data.items.map((item) => (
                  <tr key={item.leadId} className={item.slaViolated ? styles.rowViolated : ''}>
                    <td>
                      <span className={styles.leadCode}>{item.leadCode}</span>
                    </td>
                    <td>
                      <p className={styles.customerName}>{item.customerName}</p>
                      <p className={styles.customerPhone}>{item.customerPhone}</p>
                    </td>
                    <td>
                      {item.priorityLevel ? (
                        <span className={styles.priorityBadge} data-priority={item.priorityLevel}>
                          {TN_PRIORITY_LABELS[item.priorityLevel]}
                        </span>
                      ) : (
                        '—'
                      )}
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
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{item.assignedUserName ?? <span className={styles.unassigned}>Chưa gán</span>}</td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.actionBtnOutline}
                          onClick={() => openDialog('reassign', item)}
                          id={`btn-reassign-${item.leadId}`}
                          type="button"
                        >
                          Reassign
                        </button>
                        <button
                          className={styles.actionBtnOutline}
                          onClick={() => openDialog('escalate', item)}
                          id={`btn-escalate-${item.leadId}`}
                          type="button"
                        >
                          Escalate
                        </button>
                        <button
                          className={styles.actionBtnGhost}
                          onClick={() => openDialog('note', item)}
                          id={`btn-note-${item.leadId}`}
                          type="button"
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
              <button className={styles.pageBtn} onClick={() => setPage((value) => value - 1)} disabled={page <= 1} type="button">
                <ChevronLeft size={16} />
              </button>
              <span className={styles.pageInfo}>
                Trang {page} / {totalPages}
              </span>
              <button className={styles.pageBtn} onClick={() => setPage((value) => value + 1)} disabled={page >= totalPages} type="button">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

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
