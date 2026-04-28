import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Loader2,
  Eye,
} from 'lucide-react';
import { useLeads, useCreateLead } from '@/features/tv/hooks/useLeads';
import { leadService } from '@/features/tv/api/leadService';
import type {
  GetLeadsParams,
  LeadListItemDto,
  LeadStatus,
  LeadChannel,
  CreateLeadRequest,
  CreateLeadResponse,
  CheckDuplicateResponse,
} from '@/types/leads';
import {
  ALL_LEAD_CHANNELS,
  LEAD_STATUS_LABELS,
  NEED_TYPE_LABELS,
} from '@/types/leads';
import styles from './LeadsListPage.module.css';

const PAGE_SIZE = 20;

// ─── Status badge helper ──────────────────────────────────────────────────────

function statusClass(status: LeadStatus): string {
  switch (status) {
    case 'New': return styles.statusNew;
    case 'Assigned': return styles.statusAssigned;
    case 'PendingDispatch':
    case 'PendingAssignment': return styles.statusPending;
    case 'Contacted': return styles.statusContacted;
    case 'InProgress': return styles.statusProgress;
    case 'Won': return styles.statusWon;
    case 'Lost': return styles.statusLost;
    case 'Cancelled': return styles.statusCancelled;
    default: return styles.statusNew;
  }
}

function priorityClass(level: string): string {
  if (level === 'High') return styles.priorityHigh;
  if (level === 'Medium') return styles.priorityMedium;
  return styles.priorityLow;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Create Lead Dialog ───────────────────────────────────────────────────────

interface CreateLeadDialogProps {
  onClose: () => void;
  onCreated: (leadId: string) => void;
}

interface FormState {
  customerName: string;
  customerPhone: string;
  channel: LeadChannel | '';
  needDescription: string;
  customerAddress: string;
  customerEmail: string;
  productInterestInput: string;
  productInterest: string[];
}

const EMPTY_FORM: FormState = {
  customerName: '',
  customerPhone: '',
  channel: '',
  needDescription: '',
  customerAddress: '',
  customerEmail: '',
  productInterestInput: '',
  productInterest: [],
};

function CreateLeadDialog({ onClose, onCreated }: CreateLeadDialogProps) {
  const navigate = useNavigate();
  const createLead = useCreateLead();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [dupCheck, setDupCheck] = useState<CheckDuplicateResponse | null>(null);
  const [dupLoading, setDupLoading] = useState(false);
  // Duplicate confirmation flow after POST 200
  const [pendingForce, setPendingForce] = useState<CreateLeadResponse | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (field: keyof FormState, value: string | string[]) =>
    setForm((f) => ({ ...f, [field]: value }));

  // ── TV-02: debounced duplicate check on phone blur ───────────────────────
  const checkDuplicate = useCallback(async (phone: string) => {
    if (!/^0\d{9}$/.test(phone)) { setDupCheck(null); return; }
    setDupLoading(true);
    try {
      const res = await leadService.checkDuplicate(phone);
      setDupCheck(res);
    } catch {
      setDupCheck(null);
    } finally {
      setDupLoading(false);
    }
  }, []);

  const handlePhoneBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkDuplicate(form.customerPhone), 500);
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.customerName.trim()) e.customerName = 'Bắt buộc';
    if (!form.customerPhone.trim()) e.customerPhone = 'Bắt buộc';
    else if (!/^0\d{9}$/.test(form.customerPhone)) e.customerPhone = 'SĐT phải 10 chữ số, bắt đầu bằng 0';
    if (!form.channel) e.channel = 'Bắt buộc';
    if (!form.needDescription.trim()) e.needDescription = 'Bắt buộc';
    else if (form.needDescription.trim().length < 10) e.needDescription = 'Tối thiểu 10 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (forceCreate = false) => {
    if (!validate()) return;
    const payload: CreateLeadRequest = {
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      channel: form.channel as LeadChannel,
      needDescription: form.needDescription.trim(),
      customerAddress: form.customerAddress.trim() || null,
      customerEmail: form.customerEmail.trim() || null,
      productInterest: form.productInterest.length > 0 ? form.productInterest : null,
      forceCreate,
    };
    const result = await createLead.mutateAsync(payload);
    if (result.isDuplicate && !forceCreate) {
      // Show confirm popup
      setPendingForce(result);
    } else {
      onCreated(result.leadId);
    }
  };

  const handleAddTag = () => {
    const val = form.productInterestInput.trim();
    if (val && !form.productInterest.includes(val)) {
      set('productInterest', [...form.productInterest, val]);
    }
    set('productInterestInput', '');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }
  };

  // Duplicate force confirm dialog
  if (pendingForce) {
    return (
      <div className={styles.overlay}>
        <div className={styles.confirmDialog}>
          <div className={styles.confirmIcon}><AlertTriangle size={22} /></div>
          <h3 className={styles.confirmTitle}>Trùng số điện thoại</h3>
          <p className={styles.confirmText}>
            SĐT này đã tồn tại lead{' '}
            <span className={styles.confirmCode}>{pendingForce.existingLeadCode}</span>{' '}
            (Trạng thái: {LEAD_STATUS_LABELS[pendingForce.existingLeadStatus!]}).
            Bạn muốn xem lead cũ hay tạo lead mới?
          </p>
          <div className={styles.confirmActions}>
            <button
              className={styles.btnSecondary}
              onClick={() => { setPendingForce(null); onClose(); navigate(`/tv/leads/${pendingForce.existingLeadId}`); }}
            >
              <Eye size={13} /> Xem lead cũ
            </button>
            <button
              className={styles.btnWarning}
              onClick={() => handleSubmit(true)}
              disabled={createLead.isPending}
            >
              {createLead.isPending && <Loader2 size={13} className={styles.spinning} />}
              Tạo lead mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Tạo lead mới</h2>
          <button className={styles.dialogClose} onClick={onClose} aria-label="Đóng">
            <X size={16} />
          </button>
        </div>

        <div className={styles.dialogBody}>
          {/* Row 1: Tên KH + SĐT */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Tên khách hàng <span className={styles.required}>*</span>
              </label>
              <input
                id="create-lead-name"
                className={`${styles.input} ${errors.customerName ? styles.error : ''}`}
                placeholder="Nguyễn Văn A"
                value={form.customerName}
                onChange={(e) => set('customerName', e.target.value)}
              />
              {errors.customerName && <span className={styles.fieldError}>{errors.customerName}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Số điện thoại <span className={styles.required}>*</span>
              </label>
              <input
                id="create-lead-phone"
                className={`${styles.input} ${errors.customerPhone ? styles.error : ''}`}
                placeholder="0901234567"
                value={form.customerPhone}
                onChange={(e) => { set('customerPhone', e.target.value); setDupCheck(null); }}
                onBlur={handlePhoneBlur}
                maxLength={10}
              />
              {errors.customerPhone && <span className={styles.fieldError}>{errors.customerPhone}</span>}
              {dupLoading && <span className={styles.fieldError} style={{ color: '#94a3b8' }}>Đang kiểm tra...</span>}
            </div>
          </div>

          {/* Duplicate banner */}
          {dupCheck?.hasDuplicate && (
            <div className={styles.duplicateBanner}>
              <AlertTriangle size={15} className={styles.duplicateBannerIcon} />
              <p className={styles.duplicateBannerText}>
                SĐT này đã tồn tại lead{' '}
                <strong>{dupCheck.existingLeadCode}</strong>{' '}
                ({LEAD_STATUS_LABELS[dupCheck.existingLeadStatus!]}).{' '}
                <button
                  className={styles.duplicateBannerLink}
                  onClick={() => { onClose(); navigate(`/tv/leads/${dupCheck.existingLeadId}`); }}
                >
                  Xem lead cũ
                </button>
              </p>
            </div>
          )}

          {/* Row 2: Kênh */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Kênh tiếp nhận <span className={styles.required}>*</span>
            </label>
            <select
              id="create-lead-channel"
              className={`${styles.formSelect} ${errors.channel ? styles.error : ''}`}
              value={form.channel}
              onChange={(e) => set('channel', e.target.value)}
            >
              <option value="">Chọn kênh...</option>
              {ALL_LEAD_CHANNELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.channel && <span className={styles.fieldError}>{errors.channel}</span>}
          </div>

          {/* Row 3: Mô tả nhu cầu */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Mô tả nhu cầu <span className={styles.required}>*</span>
            </label>
            <textarea
              id="create-lead-need"
              className={`${styles.textarea} ${errors.needDescription ? styles.error : ''}`}
              placeholder="Khách muốn tư vấn... (tối thiểu 10 ký tự)"
              value={form.needDescription}
              onChange={(e) => set('needDescription', e.target.value)}
            />
            {errors.needDescription && <span className={styles.fieldError}>{errors.needDescription}</span>}
          </div>

          {/* Row 4: Địa chỉ + Email */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Địa chỉ</label>
              <input
                id="create-lead-address"
                className={styles.input}
                placeholder="123 Lê Lợi, Q1, TP.HCM"
                value={form.customerAddress}
                onChange={(e) => set('customerAddress', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                id="create-lead-email"
                type="email"
                className={styles.input}
                placeholder="example@email.com"
                value={form.customerEmail}
                onChange={(e) => set('customerEmail', e.target.value)}
              />
            </div>
          </div>

          {/* Row 5: Sản phẩm quan tâm */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Sản phẩm quan tâm</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="create-lead-product"
                className={styles.input}
                placeholder="Nhập rồi nhấn Enter hoặc Thêm"
                value={form.productInterestInput}
                onChange={(e) => set('productInterestInput', e.target.value)}
                onKeyDown={handleTagKeyDown}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={handleAddTag}
                style={{ padding: '8px 12px' }}
              >
                Thêm
              </button>
            </div>
            {form.productInterest.length > 0 && (
              <div className={styles.tagsWrap}>
                {form.productInterest.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button
                      className={styles.tagRemove}
                      onClick={() => set('productInterest', form.productInterest.filter((t) => t !== tag))}
                      aria-label={`Xoá ${tag}`}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.dialogFooter}>
          <button className={styles.btnSecondary} onClick={onClose} disabled={createLead.isPending}>
            Huỷ
          </button>
          <button
            id="create-lead-submit"
            className={styles.btnSubmit}
            onClick={() => handleSubmit(false)}
            disabled={createLead.isPending}
          >
            {createLead.isPending && <Loader2 size={13} className={styles.spinning} />}
            Tạo lead
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function LeadsListPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState<GetLeadsParams>({ page: 1, pageSize: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isFetching, refetch } = useLeads(params);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setParams((p) => ({ ...p, page: 1, search: searchInput || undefined }));
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  const leads: LeadListItemDto[] = data?.items ?? [];
  const total = data?.totalCount ?? 0;
  const page = params.page ?? 1;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const handleRowClick = (leadId: string) => navigate(`/tv/leads/${leadId}`);

  const handleCreated = (leadId: string) => {
    setCreateOpen(false);
    navigate(`/tv/leads/${leadId}`);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Danh sách Lead</h1>
          <p className={styles.subtitle}>Quản lý và tìm kiếm lead do bạn tiếp nhận</p>
        </div>
        <button
          id="btn-create-lead"
          className={styles.btnPrimary}
          onClick={() => setCreateOpen(true)}
        >
          <Plus size={15} />
          Tạo lead mới
        </button>
      </div>

      {/* Filters — TV-07 */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            id="leads-search"
            className={styles.searchInput}
            placeholder="Tìm theo SĐT hoặc tên KH..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select
          id="leads-status-filter"
          className={styles.select}
          onChange={(e) =>
            setParams((p) => ({ ...p, page: 1, status: (e.target.value as LeadStatus) || undefined }))
          }
        >
          <option value="">Tất cả trạng thái</option>
          {(Object.entries(LEAD_STATUS_LABELS) as [LeadStatus, string][]).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select
          id="leads-channel-filter"
          className={styles.select}
          onChange={(e) =>
            setParams((p) => ({ ...p, page: 1, channel: (e.target.value as LeadChannel) || undefined }))
          }
        >
          <option value="">Tất cả kênh</option>
          {ALL_LEAD_CHANNELS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          id="leads-date-from"
          type="date"
          className={styles.dateInput}
          onChange={(e) =>
            setParams((p) => ({ ...p, page: 1, dateFrom: e.target.value || undefined }))
          }
          title="Từ ngày"
        />
        <input
          id="leads-date-to"
          type="date"
          className={styles.dateInput}
          onChange={(e) =>
            setParams((p) => ({ ...p, page: 1, dateTo: e.target.value || undefined }))
          }
          title="Đến ngày"
        />
        <button className={styles.btnIcon} onClick={() => refetch()} title="Làm mới">
          <RefreshCw size={14} className={isFetching ? styles.spinning : ''} />
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã Lead</th>
              <th>Tên KH</th>
              <th>Số điện thoại</th>
              <th>Kênh</th>
              <th>Loại nhu cầu</th>
              <th>Trạng thái</th>
              <th>Ưu tiên</th>
              <th>Ngày tạo</th>
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
                  Không có lead nào
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.leadId} onClick={() => handleRowClick(lead.leadId)}>
                  <td><span className={styles.cellCode}>{lead.leadCode}</span></td>
                  <td className={styles.cellBold}>{lead.customerName}</td>
                  <td className={styles.cellMuted}>{lead.customerPhone}</td>
                  <td>
                    <span className={styles.channelBadge}>{lead.channel}</span>
                  </td>
                  <td className={styles.cellMuted}>
                    {lead.needType ? NEED_TYPE_LABELS[lead.needType] : '—'}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusClass(lead.leadStatus)}`}>
                      {LEAD_STATUS_LABELS[lead.leadStatus]}
                    </span>
                  </td>
                  <td>
                    {lead.priorityLevel ? (
                      <span className={`${styles.priorityBadge} ${priorityClass(lead.priorityLevel)}`}>
                        {lead.priorityLevel}
                      </span>
                    ) : '—'}
                  </td>
                  <td className={styles.cellMuted}>{formatDate(lead.createdAt)}</td>
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

      {/* Create Lead Dialog — TV-01 + TV-02 */}
      {createOpen && (
        <CreateLeadDialog
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
