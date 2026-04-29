import { useState, useCallback } from 'react';
import { useStoreLeads, useStoreMembers, useStoreWorkload, useReassignStoreLead } from '@/features/ql/hooks/useStoreManager';
import type { GetStoreLeadsParams, StoreLeadListItemDto, LeadStatus } from '@/types/storemanager';
import { LEAD_STATUS_LABELS } from '@/types/storemanager';
import { AlertTriangle, Clock, RefreshCw, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import styles from './QlLeadsPage.module.css';

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDatetime(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

function slaUrgent(deadline: string | null): boolean {
  if (!deadline) return false;
  const diff = new Date(deadline).getTime() - Date.now();
  return diff > 0 && diff < 2 * 60 * 60 * 1000; // < 2 giờ
}

function priorityBadgeClass(level: string | null, cssModule: Record<string, string>): string {
  if (level === 'HIGH') return cssModule.prioHigh;
  if (level === 'MEDIUM') return cssModule.prioMed;
  if (level === 'LOW') return cssModule.prioLow;
  return cssModule.prioNone;
}

// ── ReassignDialog ─────────────────────────────────────────────────────────────

interface ReassignDialogProps {
  lead: StoreLeadListItemDto;
  onClose: () => void;
  onSuccess: () => void;
}

function ReassignDialog({ lead, onClose, onSuccess }: ReassignDialogProps) {
  const { data: members = [] } = useStoreMembers();
  const { data: workload = [] } = useStoreWorkload();
  const reassign = useReassignStoreLead();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Merge members + workload, filter active, sort by currentWorkload ASC
  const options = members
    .filter((m) => m.isActive && m.userId !== lead.assignedUserId)
    .map((m) => {
      const wl = workload.find((w) => w.userId === m.userId);
      return { ...m, currentWorkload: wl?.currentWorkload ?? m.currentWorkload };
    })
    .sort((a, b) => a.currentWorkload - b.currentWorkload);

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!selectedUserId) { setErrorMsg('Vui lòng chọn nhân sự.'); return; }
    if (!reason.trim()) { setErrorMsg('Vui lòng nhập lý do.'); return; }
    if (reason.length > 500) { setErrorMsg('Lý do tối đa 500 ký tự.'); return; }

    try {
      await reassign.mutateAsync({ leadId: lead.leadId, data: { newUserId: selectedUserId, reason } });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { errorCode?: string } } })?.response?.data?.errorCode;
      const messages: Record<string, string> = {
        LEAD_NOT_FOUND: 'Không tìm thấy lead.',
        NEW_USER_NOT_FOUND: 'Không tìm thấy nhân sự.',
        LEAD_NOT_IN_STORE: 'Lead không thuộc đơn vị của bạn.',
        NEW_USER_NOT_IN_STORE: 'Nhân sự không thuộc đơn vị của bạn.',
        LEAD_TERMINAL_STATUS: 'Lead đã đóng, không thể reassign.',
      };
      setErrorMsg(messages[code ?? ''] ?? 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h3 className={styles.dialogTitle}>Reassign Lead</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={styles.dialogBody}>
          <div className={styles.leadInfo}>
            <span className={styles.leadCode}>{lead.leadCode}</span>
            <span className={styles.leadCustomer}>{lead.customerName}</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Chọn nhân sự nhận lead</label>
            <select
              className={styles.select}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">— Chọn nhân sự —</option>
              {options.map((o) => (
                <option key={o.userId} value={o.userId}>
                  {o.fullName} ({o.roleName ?? '—'}) · {o.currentWorkload} lead
                </option>
              ))}
            </select>
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
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
            />
            <span className={styles.charCount}>{reason.length}/500</span>
          </div>

          {errorMsg && <p className={styles.formError}>{errorMsg}</p>}
        </div>
        <div className={styles.dialogFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Hủy</button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={reassign.isPending}
          >
            {reassign.isPending ? 'Đang xử lý...' : 'Xác nhận Reassign'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const ALL_STATUSES: LeadStatus[] = [
  'New', 'Assigned', 'PendingDispatch', 'PendingAssignment',
  'Contacted', 'InProgress', 'Won', 'Lost', 'Cancelled',
];

export function QlLeadsPage() {
  const [params, setParams] = useState<GetStoreLeadsParams>({ page: 1, pageSize: 20 });
  const [searchInput, setSearchInput] = useState('');
  const [reassignLead, setReassignLead] = useState<StoreLeadListItemDto | null>(null);

  const { data: membersData = [] } = useStoreMembers();
  const { data, isLoading, isError, refetch } = useStoreLeads(params);

  const leads = data?.items ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.ceil(total / (params.pageSize ?? 20));

  const applyFilter = useCallback((patch: Partial<GetStoreLeadsParams>) => {
    setParams((prev) => ({ ...prev, page: 1, ...patch }));
  }, []);

  const handleSearch = () => {
    applyFilter({ search: searchInput || undefined });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Danh sách lead đơn vị</h1>
        <button className={styles.refreshBtn} onClick={() => refetch()}>
          <RefreshCw size={14} />
          Làm mới
        </button>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchGroup}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Tên khách / SĐT..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className={styles.searchBtn} onClick={handleSearch}>Tìm</button>
        </div>

        <select
          className={styles.filterSelect}
          value={params.status ?? ''}
          onChange={(e) => applyFilter({ status: e.target.value || undefined })}
        >
          <option value="">Tất cả trạng thái</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={params.priorityLevel ?? ''}
          onChange={(e) => applyFilter({ priorityLevel: e.target.value || undefined })}
        >
          <option value="">Tất cả ưu tiên</option>
          <option value="HIGH">Cao</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="LOW">Thấp</option>
        </select>

        <select
          className={styles.filterSelect}
          value={params.assignedUserId ?? ''}
          onChange={(e) => applyFilter({ assignedUserId: e.target.value || undefined })}
        >
          <option value="">Tất cả nhân sự</option>
          {membersData.map((m) => (
            <option key={m.userId} value={m.userId}>{m.fullName}</option>
          ))}
        </select>
      </div>

      {/* Table */}
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
                  <tr><td colSpan={8} className={styles.emptyCell}>Không có lead nào.</td></tr>
                )}
                {leads.map((lead) => {
                  const urgent = slaUrgent(lead.slaDeadline);
                  return (
                    <tr
                      key={lead.leadId}
                      className={lead.slaViolated ? styles.rowViolated : ''}
                    >
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
                        <button
                          className={styles.reassignBtn}
                          onClick={() => setReassignLead(lead)}
                        >
                          Reassign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              {total} lead · Trang {params.page}/{totalPages || 1}
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

      {reassignLead && (
        <ReassignDialog
          lead={reassignLead}
          onClose={() => setReassignLead(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
