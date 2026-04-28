import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Mail,
  Tag,
  FileText,
  Zap,
  Pencil,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useLeadDetail, useUpdateLead } from '@/features/tv/hooks/useLeads';
import type {
  LeadStatus,
  PriorityLevel,
  UpdateLeadRequest,
} from '@/types/leads';
import {
  LEAD_STATUS_CLOSED,
  LEAD_STATUS_LABELS,
  NEED_TYPE_LABELS,
  ASSIGNED_GROUP_LABELS,
} from '@/types/leads';
import styles from './LeadDetailPage.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priorityClass(level: PriorityLevel): string {
  if (level === 'High') return styles.priorityHigh;
  if (level === 'Medium') return styles.priorityMedium;
  return styles.priorityLow;
}

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

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateLead = useUpdateLead();

  const { data: lead, isLoading, isError } = useLeadDetail(id!, true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [editForm, setEditForm] = useState({
    customerAddress: '',
    customerEmail: '',
    needDescription: '',
    productInterest: [] as string[],
    productInterestInput: '',
  });

  const startEdit = () => {
    if (!lead) return;
    setEditForm({
      customerAddress: lead.customerAddress ?? '',
      customerEmail: lead.customerEmail ?? '',
      needDescription: lead.needDescription,
      productInterest: [...lead.productInterest],
      productInterestInput: '',
    });
    setEditing(true);
    setSaveOk(false);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async () => {
    if (!lead) return;
    const payload: UpdateLeadRequest = {
      leadId: lead.leadId,
      customerAddress: editForm.customerAddress.trim() || null,
      customerEmail: editForm.customerEmail.trim() || null,
      needDescription: editForm.needDescription.trim(),
      productInterest: editForm.productInterest,
    };
    await updateLead.mutateAsync({ id: lead.leadId, data: payload });
    setEditing(false);
    setSaveOk(true);
    setTimeout(() => setSaveOk(false), 3000);
  };

  const addTag = () => {
    const val = editForm.productInterestInput.trim();
    if (val && !editForm.productInterest.includes(val)) {
      setEditForm((f) => ({ ...f, productInterest: [...f.productInterest, val], productInterestInput: '' }));
    } else {
      setEditForm((f) => ({ ...f, productInterestInput: '' }));
    }
  };

  const removeTag = (tag: string) =>
    setEditForm((f) => ({ ...f, productInterest: f.productInterest.filter((t) => t !== tag) }));

  // ── Loading / Error states ──────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={styles.pageLoading}>
        <div className={styles.pageSpinner} />
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className={styles.notFound}>
        <AlertCircle size={40} className={styles.notFoundIcon} />
        <p>Lead không tồn tại hoặc bạn không có quyền xem.</p>
        <button className={styles.btnSecondary} onClick={() => navigate('/tv/leads')}>
          <ArrowLeft size={14} /> Quay lại
        </button>
      </div>
    );
  }

  const isClosed = LEAD_STATUS_CLOSED.includes(lead.leadStatus);
  const isNew = lead.leadStatus === 'New';

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/tv/leads')} aria-label="Quay lại">
            <ArrowLeft size={16} />
          </button>
          <div className={styles.titleGroup}>
            <span className={styles.leadCode}>{lead.leadCode}</span>
            <h1 className={styles.title}>{lead.customerName}</h1>
          </div>
          <span className={`${styles.statusBadge} ${statusClass(lead.leadStatus)}`}>
            {LEAD_STATUS_LABELS[lead.leadStatus]}
          </span>
        </div>

        <div className={styles.headerActions}>
          {saveOk && (
            <span className={styles.saveSuccess}>
              <CheckCircle2 size={14} /> Đã lưu
            </span>
          )}
          {editing ? (
            <>
              <button className={styles.btnSecondary} onClick={cancelEdit} disabled={updateLead.isPending}>
                <X size={13} /> Huỷ
              </button>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={updateLead.isPending}>
                {updateLead.isPending
                  ? <Loader2 size={13} className={styles.spinning} />
                  : <Save size={13} />}
                Lưu
              </button>
            </>
          ) : (
            !isClosed && (
              <button className={styles.btnEdit} onClick={startEdit}>
                <Pencil size={13} /> Chỉnh sửa
              </button>
            )
          )}
        </div>
      </div>

      {/* 2-col grid */}
      <div className={styles.grid}>
        {/* ── Left: Lead info ──────────────────────────────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <User size={15} className={styles.cardTitleIcon} />
              Thông tin khách hàng
            </h2>
          </div>
          <div className={styles.cardBody}>
            {/* Row: Tên + SĐT (readonly) */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}><Phone size={10} /> Số điện thoại</span>
                <span className={styles.fieldValue}>{lead.customerPhone}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}><Tag size={10} /> Kênh tiếp nhận</span>
                <span className={styles.fieldValue}>{lead.channel}</span>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}><MapPin size={10} /> Địa chỉ</span>
              {editing ? (
                <input
                  id="edit-address"
                  className={styles.editInput}
                  value={editForm.customerAddress}
                  onChange={(e) => setEditForm((f) => ({ ...f, customerAddress: e.target.value }))}
                  placeholder="Địa chỉ khách hàng"
                />
              ) : (
                <span className={lead.customerAddress ? styles.fieldValue : styles.fieldValueMuted}>
                  {lead.customerAddress ?? 'Chưa có'}
                </span>
              )}
            </div>

            {/* Email */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}><Mail size={10} /> Email</span>
              {editing ? (
                <input
                  id="edit-email"
                  type="email"
                  className={styles.editInput}
                  value={editForm.customerEmail}
                  onChange={(e) => setEditForm((f) => ({ ...f, customerEmail: e.target.value }))}
                  placeholder="email@example.com"
                />
              ) : (
                <span className={lead.customerEmail ? styles.fieldValue : styles.fieldValueMuted}>
                  {lead.customerEmail ?? 'Chưa có'}
                </span>
              )}
            </div>

            {/* Sản phẩm quan tâm */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}><Tag size={10} /> Sản phẩm quan tâm</span>
              {editing ? (
                <>
                  {editForm.productInterest.length > 0 && (
                    <div className={styles.tagsWrap}>
                      {editForm.productInterest.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                          <button className={styles.tagRemove} onClick={() => removeTag(tag)} aria-label={`Xoá ${tag}`}>
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={styles.tagAdd}>
                    <input
                      id="edit-product"
                      className={styles.editInput}
                      value={editForm.productInterestInput}
                      onChange={(e) => setEditForm((f) => ({ ...f, productInterestInput: e.target.value }))}
                      placeholder="Thêm sản phẩm..."
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      style={{ flex: 1 }}
                    />
                    <button className={styles.btnSecondary} onClick={addTag} style={{ padding: '7px 10px' }}>
                      Thêm
                    </button>
                  </div>
                </>
              ) : (
                lead.productInterest.length > 0 ? (
                  <div className={styles.tagsWrap}>
                    {lead.productInterest.map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                ) : (
                  <span className={styles.fieldValueMuted}>Chưa có</span>
                )
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Classification panel ───────────────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Zap size={15} className={styles.cardTitleIcon} />
              Kết quả phân loại
            </h2>
          </div>

          {isNew ? (
            <div className={styles.spinnerWrap}>
              <div className={styles.spinner} />
              <span>Đang phân loại...</span>
            </div>
          ) : (
            <div className={styles.classPanel}>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Loại nhu cầu</span>
                {lead.needType ? (
                  <span className={styles.classValue}>{NEED_TYPE_LABELS[lead.needType]}</span>
                ) : (
                  <span className={styles.classValueMuted}>—</span>
                )}
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Mức ưu tiên</span>
                {lead.priorityLevel ? (
                  <span className={`${styles.priorityBadge} ${priorityClass(lead.priorityLevel)}`}>
                    {lead.priorityLevel}
                  </span>
                ) : (
                  <span className={styles.classValueMuted}>—</span>
                )}
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Nhóm xử lý</span>
                {lead.assignedGroup ? (
                  <span className={styles.classValue}>{ASSIGNED_GROUP_LABELS[lead.assignedGroup]}</span>
                ) : (
                  <span className={styles.classValueMuted}>—</span>
                )}
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Nhân viên gán</span>
                <span className={lead.assignedUserName ? styles.classValue : styles.classValueMuted}>
                  {lead.assignedUserName ?? 'Đang chờ điều phối'}
                </span>
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Thời gian gán</span>
                <span className={styles.classValue}>{fmtDate(lead.assignedAt)}</span>
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>SLA Deadline</span>
                <span className={lead.slaViolated ? styles.slaViolated : styles.classValue}>
                  {fmtDate(lead.slaDeadline)}{lead.slaViolated && ' ⚠ Vi phạm'}
                </span>
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Loại định tuyến</span>
                <span className={styles.classValue}>{lead.routingType ?? '—'}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Full width: Mô tả nhu cầu ─────────────────────────────── */}
        <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FileText size={15} className={styles.cardTitleIcon} />
              Mô tả nhu cầu
            </h2>
          </div>
          <div className={styles.cardBody}>
            {editing ? (
              <textarea
                id="edit-need-description"
                className={styles.editTextarea}
                value={editForm.needDescription}
                onChange={(e) => setEditForm((f) => ({ ...f, needDescription: e.target.value }))}
                style={{ minHeight: '100px' }}
              />
            ) : (
              <p className={styles.fieldValue} style={{ margin: 0, lineHeight: 1.7 }}>
                {lead.needDescription}
              </p>
            )}
          </div>
        </div>

        {/* ── Metadata ──────────────────────────────────────────────── */}
        <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Thông tin hệ thống</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Ngày tạo</span>
                <span className={styles.fieldValue}>{fmtDate(lead.createdAt)}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Cập nhật lần cuối</span>
                <span className={styles.fieldValue}>{fmtDate(lead.updatedAt)}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Ngày đóng</span>
                <span className={lead.closedAt ? styles.fieldValue : styles.fieldValueMuted}>
                  {fmtDate(lead.closedAt)}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Người tạo</span>
                <span className={styles.fieldValue}>{lead.createdBy}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
