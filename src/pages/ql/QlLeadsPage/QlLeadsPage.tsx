import { useMemo, useState } from 'react';
import { AlertTriangle, Clock, RefreshCw, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { SearchableUserPicker, type SearchableUserPickerOption } from '@/components/SearchableUserPicker';
import {
  useReassignStoreLead,
  useSearchStoreLeadReassignTargets,
  useStoreLeads,
  useStoreMembers,
} from '@/features/ql/hooks/useStoreManager';
import { extractErrorMessage } from '@/lib/errors';
import { getRoleLabel } from '@/lib/roleChannel';
import { LEAD_STATUS_LABELS, type GetStoreLeadsParams, type LeadStatus, type StoreLeadListItemDto, type StoreLeadReassignTargetDto, type StoreStaffDto } from '@/types/storemanager';
import styles from './QlLeadsPage.module.css';

function formatDatetime(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function slaUrgent(deadline: string | null): boolean {
  if (!deadline) return false;
  const diff = new Date(deadline).getTime() - Date.now();
  return diff > 0 && diff < 2 * 60 * 60 * 1000;
}

function priorityBadgeClass(level: string | null, cssModule: Record<string, string>): string {
  if (level === 'HIGH') return cssModule.prioHigh;
  if (level === 'MEDIUM') return cssModule.prioMed;
  if (level === 'LOW') return cssModule.prioLow;
  return cssModule.prioNone;
}

function toAssignedUserOption(member: StoreStaffDto): SearchableUserPickerOption<StoreStaffDto> {
  return {
    value: member.userId,
    label: member.fullName,
    raw: member,
  };
}

function toReassignOption(
  target: StoreLeadReassignTargetDto,
): SearchableUserPickerOption<StoreLeadReassignTargetDto> {
  return {
    value: target.userId,
    label: target.fullName,
    subLabel: getRoleLabel(target.roleName, target.roleDisplayName),
    raw: target,
  };
}

interface ReassignDialogProps {
  lead: StoreLeadListItemDto;
  onClose: () => void;
  onSuccess: () => void;
}

function ReassignDialog({ lead, onClose, onSuccess }: ReassignDialogProps) {
  const reassign = useReassignStoreLead();
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchableUserPickerOption<StoreLeadReassignTargetDto> | null>(null);

  const { data: targets = [], isFetching } = useSearchStoreLeadReassignTargets(lead.leadId, searchQuery, pickerOpen);

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!selectedUser) {
      setErrorMsg('Vui lòng chọn nhân sự.');
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Vui lòng nhập lý do.');
      return;
    }

    if (reason.length > 500) {
      setErrorMsg('Lý do tối đa 500 ký tự.');
      return;
    }

    try {
      await reassign.mutateAsync({
        leadId: lead.leadId,
        data: { newUserId: selectedUser.raw.userId, reason: reason.trim() },
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err));
    }
  };

  return (
    <div className={styles.overlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h3 className={styles.dialogTitle}>Reassign Lead</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>
        <div className={styles.dialogBody}>
          <div className={styles.leadInfo}>
            <span className={styles.leadCode}>{lead.leadCode}</span>
            <span className={styles.leadCustomer}>{lead.customerName}</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Chọn nhân sự nhận lead</label>
            <SearchableUserPicker
              mode="remote"
              placeholder="Tìm theo tên hoặc role..."
              options={targets.map(toReassignOption)}
              selectedOption={selectedUser}
              onChange={(option) => {
                setSelectedUser(option);
                setErrorMsg('');
              }}
              onSearch={setSearchQuery}
              onOpenChange={setPickerOpen}
              isLoading={isFetching}
              fetchOnOpen
              emptyMessage="Không có người nhận phù hợp."
              showSelectionSummary
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Lý do reassign <span className={styles.labelRequired}>*</span>
            </label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Nhập lý do chuyển lead..."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
            />
            <span className={styles.charCount}>{reason.length}/500</span>
          </div>

          {errorMsg && <p className={styles.formError}>{errorMsg}</p>}
        </div>
        <div className={styles.dialogFooter}>
          <button className={styles.cancelBtn} onClick={onClose} type="button">
            Hủy
          </button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={reassign.isPending} type="button">
            {reassign.isPending ? 'Đang xử lý...' : 'Xác nhận Reassign'}
          </button>
        </div>
      </div>
    </div>
  );
}

const ALL_STATUSES: LeadStatus[] = [
  'New',
  'Assigned',
  'PendingDispatch',
  'PendingAssignment',
  'Contacted',
  'InProgress',
  'Won',
  'Lost',
  'Cancelled',
];

export function QlLeadsPage() {
  const [params, setParams] = useState<GetStoreLeadsParams>({ page: 1, pageSize: 20 });
  const [searchInput, setSearchInput] = useState('');
  const [reassignLead, setReassignLead] = useState<StoreLeadListItemDto | null>(null);

  const { data: membersData = [] } = useStoreMembers();
  const { data, isLoading, isError, refetch } = useStoreLeads(params);

  const memberOptions = useMemo(() => membersData.map(toAssignedUserOption), [membersData]);
  const selectedMember = memberOptions.find((option) => option.value === params.assignedUserId) ?? null;

  const leads = data?.items ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.ceil(total / (params.pageSize ?? 20));

  const applyFilter = (patch: Partial<GetStoreLeadsParams>) => {
    setParams((prev) => ({ ...prev, page: 1, ...patch }));
  };

  const handleSearch = () => {
    applyFilter({ search: searchInput || undefined });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Danh sách lead đơn vị</h1>
        <button className={styles.refreshBtn} onClick={() => refetch()} type="button">
          <RefreshCw size={14} />
          Làm mới
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchGroup}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Tên khách / SĐT..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
          />
          <button className={styles.searchBtn} onClick={handleSearch} type="button">
            Tìm
          </button>
        </div>

        <select
          className={styles.filterSelect}
          value={params.status ?? ''}
          onChange={(event) => applyFilter({ status: event.target.value || undefined })}
        >
          <option value="">Tất cả trạng thái</option>
          {ALL_STATUSES.map((item) => (
            <option key={item} value={item}>
              {LEAD_STATUS_LABELS[item]}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={params.priorityLevel ?? ''}
          onChange={(event) => applyFilter({ priorityLevel: event.target.value || undefined })}
        >
          <option value="">Tất cả ưu tiên</option>
          <option value="HIGH">Cao</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="LOW">Thấp</option>
        </select>

        <div style={{ minWidth: 220, flex: '1 1 220px' }}>
          <SearchableUserPicker
            mode="local"
            compact
            placeholder="Tất cả nhân sự"
            options={memberOptions}
            selectedOption={selectedMember}
            onChange={(option) => applyFilter({ assignedUserId: option?.value || undefined })}
            className={styles.filterPicker}
          />
        </div>
      </div>

      {isLoading && <div className={styles.loading}>Đang tải...</div>}
      {isError && <div className={styles.errorMsg}>Không thể tải danh sách lead.</div>}
      {!isLoading && !isError && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã lead</th>
                  <th>Khách hàng</th>
                  <th>Loại nhu cầu</th>
                  <th>Trạng thái</th>
                  <th>Ưu tiên</th>
                  <th>SLA Deadline</th>
                  <th>Nhân sự</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.emptyCell}>
                      Không có lead nào.
                    </td>
                  </tr>
                )}
                {leads.map((lead) => {
                  const urgent = slaUrgent(lead.slaDeadline);
                  return (
                    <tr key={lead.leadId} className={lead.slaViolated ? styles.rowViolated : ''}>
                      <td className={styles.leadCode}>{lead.leadCode}</td>
                      <td>
                        <div className={styles.customer}>{lead.customerName}</div>
                        <div className={styles.phone}>{lead.customerPhone}</div>
                      </td>
                      <td>{lead.needType ?? '—'}</td>
                      <td>
                        <span className={styles.statusBadge}>{LEAD_STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus}</span>
                      </td>
                      <td>
                        <span className={`${styles.prioBadge} ${priorityBadgeClass(lead.priorityLevel, styles)}`}>
                          {lead.priorityLevel ?? '—'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.slaCell}>
                          {lead.slaViolated && <AlertTriangle size={13} className={styles.iconRed} />}
                          {!lead.slaViolated && urgent && <Clock size={13} className={styles.iconYellow} />}
                          <span>{formatDatetime(lead.slaDeadline)}</span>
                        </div>
                      </td>
                      <td>{lead.assignedUserName ?? <span className={styles.unassigned}>Chưa phân công</span>}</td>
                      <td>
                        <button className={styles.reassignBtn} onClick={() => setReassignLead(lead)} type="button">
                          Reassign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              {total} lead · Trang {params.page}/{totalPages || 1}
            </span>
            <div className={styles.paginationBtns}>
              <button
                className={styles.pageBtn}
                disabled={(params.page ?? 1) <= 1}
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
                type="button"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                className={styles.pageBtn}
                disabled={(params.page ?? 1) >= totalPages}
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
                type="button"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}

      {reassignLead && (
        <ReassignDialog lead={reassignLead} onClose={() => setReassignLead(null)} onSuccess={() => refetch()} />
      )}
    </div>
  );
}
