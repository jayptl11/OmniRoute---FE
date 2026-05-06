import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, MapPin, Mail, Tag, FileText, Zap,
  AlertCircle, GitCommitVertical, RefreshCw, StickyNote,
  ArrowRightLeft, Loader2, X, Send, Bell, AlertTriangle,
} from 'lucide-react';
import {
  useSaleLeadDetail, useUpdateSaleLeadStatus, useAddNote,
  useReportInvalid, useCreateFollowUp,
} from '@/features/sa/hooks/useSaleLeads';
import type {
  LeadStatus, PriorityLevel, ActivityAction, ActivityLogDto,
  UpdateSaleLeadStatusRequest, InvalidReason,
} from '@/types/leads';
import {
  SA_LEAD_STATUS_LABELS, LEAD_STATUS_CLOSED, SALE_LEAD_VALID_TRANSITIONS,
  NEED_TYPE_LABELS, ASSIGNED_GROUP_LABELS, ACTIVITY_ACTION_LABELS,
  INVALID_REASON_LABELS,
} from '@/types/leads';
import styles from './SaleLeadDetailPage.module.css';
import { GlassSelect } from '@/components/glass';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priorityClass(level: PriorityLevel) {
  if (level === 'High') return styles.priorityHigh;
  if (level === 'Medium') return styles.priorityMedium;
  return styles.priorityLow;
}

function statusClass(status: LeadStatus) {
  switch (status) {
    case 'Assigned': return styles.statusAssigned;
    case 'Contacted': return styles.statusContacted;
    case 'InProgress': return styles.statusProgress;
    case 'Won': return styles.statusWon;
    case 'Lost': return styles.statusLost;
    case 'Cancelled': return styles.statusCancelled;
    default: return styles.statusDefault;
  }
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function actionIconClass(action: ActivityAction) {
  switch (action) {
    case 'LEAD_CREATED': return styles.actionCreated;
    case 'LEAD_ASSIGNED': return styles.actionAssigned;
    case 'STATUS_CHANGED': return styles.actionStatus;
    case 'CONSULTATION_NOTE': return styles.actionNote;
    case 'LEAD_UPDATED': return styles.actionUpdated;
  }
}

function ActionIcon({ action }: { action: ActivityAction }) {
  switch (action) {
    case 'LEAD_CREATED': return <GitCommitVertical size={14} />;
    case 'LEAD_ASSIGNED': return <User size={14} />;
    case 'STATUS_CHANGED': return <ArrowRightLeft size={14} />;
    case 'CONSULTATION_NOTE': return <StickyNote size={14} />;
    case 'LEAD_UPDATED': return <RefreshCw size={14} />;
  }
}

// ─── Status Update Dialog — SA-04 ────────────────────────────────────────────

function StatusUpdateDialog({ leadId, currentStatus, onClose }: {
  leadId: string; currentStatus: LeadStatus; onClose: () => void;
}) {
  const updateStatus = useUpdateSaleLeadStatus();
  const validNext = SALE_LEAD_VALID_TRANSITIONS[currentStatus] ?? [];
  const [newStatus, setNewStatus] = useState<LeadStatus | ''>('');
  const [note, setNote] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [wonDetails, setWonDetails] = useState('');
  const [error, setError] = useState('');

  const needsNote = newStatus === 'Contacted' || newStatus === 'InProgress';
  const needsLost = newStatus === 'Lost';
  const needsCancel = newStatus === 'Cancelled';

  const handleSubmit = async () => {
    setError('');
    if (!newStatus) { setError('Vui lòng chọn trạng thái mới'); return; }
    if (needsNote && !note.trim()) { setError('Ghi chú là bắt buộc'); return; }
    if (needsLost && !lostReason.trim()) { setError('Lý do không chốt là bắt buộc'); return; }
    if (needsCancel && !cancelReason.trim()) { setError('Lý do huỷ là bắt buộc'); return; }
    const payload: UpdateSaleLeadStatusRequest = {
      leadId, newStatus: newStatus as LeadStatus,
      note: note.trim() || null, lostReason: lostReason.trim() || null,
      cancelReason: cancelReason.trim() || null, wonDetails: wonDetails.trim() || null,
    };
    await updateStatus.mutateAsync({ id: leadId, data: payload });
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Cập nhật trạng thái</h2>
          <button className={styles.dialogClose} onClick={onClose}><X size={15} /></button>
        </div>
        <div className={styles.dialogBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Trạng thái mới <span className={styles.required}>*</span></label>
            <GlassSelect
              id="status-dialog-new-status"
              value={newStatus}
              onChange={(val) => { setNewStatus(val as LeadStatus); setError(''); }}
              options={[
                { value: '', label: 'Chọn trạng thái...' },
                ...validNext.map((s) => ({ value: s, label: SA_LEAD_STATUS_LABELS[s] ?? s })),
              ]}
              placeholder="Chọn trạng thái..."
            />
          </div>
          {(needsNote || newStatus === 'Won') && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ghi chú {needsNote && <span className={styles.required}>*</span>}</label>
              <textarea id="status-dialog-note" className={styles.formTextarea}
                placeholder={needsNote ? 'Nhập ghi chú liên hệ...' : 'Ghi chú thêm (tuỳ chọn)'}
                value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          )}
          {newStatus === 'Won' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Chi tiết chốt deal</label>
              <textarea id="status-dialog-won" className={styles.formTextarea}
                placeholder="Sản phẩm đã chốt, giá trị hợp đồng..."
                value={wonDetails} onChange={(e) => setWonDetails(e.target.value)} />
            </div>
          )}
          {needsLost && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Lý do không chốt <span className={styles.required}>*</span></label>
              <input id="status-dialog-lost" className={styles.formInput}
                placeholder="Khách không có nhu cầu / Giá không phù hợp..."
                value={lostReason} onChange={(e) => setLostReason(e.target.value)} />
            </div>
          )}
          {needsCancel && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Lý do huỷ <span className={styles.required}>*</span></label>
              <input id="status-dialog-cancel" className={styles.formInput}
                placeholder="Lý do huỷ lead..." value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)} />
            </div>
          )}
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
        <div className={styles.dialogFooter}>
          <button className={styles.btnSecondary} onClick={onClose} disabled={updateStatus.isPending}>Huỷ</button>
          <button id="status-dialog-submit" className={styles.btnPrimary}
            onClick={handleSubmit} disabled={updateStatus.isPending || !newStatus}>
            {updateStatus.isPending && <Loader2 size={13} className={styles.spinning} />}
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Report Invalid Dialog — SA-08 ───────────────────────────────────────────

function ReportInvalidDialog({ leadId, onClose, onSuccess }: {
  leadId: string; onClose: () => void; onSuccess: () => void;
}) {
  const reportInvalid = useReportInvalid();
  const [reason, setReason] = useState<InvalidReason | ''>('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason) { setError('Vui lòng chọn lý do'); return; }
    await reportInvalid.mutateAsync({ id: leadId, data: { leadId, reason: reason as InvalidReason } });
    onSuccess();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle} style={{ color: '#b45309' }}>
            <AlertTriangle size={16} style={{ display: 'inline', marginRight: 6 }} />
            Báo lead không hợp lệ
          </h2>
          <button className={styles.dialogClose} onClick={onClose}><X size={15} /></button>
        </div>
        <div className={styles.dialogBody}>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            Lead sẽ bị huỷ và Trưởng nhóm sẽ nhận thông báo để review.
          </p>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Lý do <span className={styles.required}>*</span></label>
            <GlassSelect
              id="report-invalid-reason"
              value={reason}
              onChange={(val) => { setReason(val as InvalidReason); setError(''); }}
              options={[
                { value: '', label: 'Chọn lý do...' },
                ...(Object.entries(INVALID_REASON_LABELS) as [InvalidReason, string][]).map(([val, label]) => ({ value: val, label })),
              ]}
              placeholder="Chọn lý do..."
            />
          </div>
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
        <div className={styles.dialogFooter}>
          <button className={styles.btnSecondary} onClick={onClose} disabled={reportInvalid.isPending}>Huỷ</button>
          <button id="report-invalid-submit" className={styles.btnWarning}
            onClick={handleSubmit} disabled={reportInvalid.isPending || !reason}>
            {reportInvalid.isPending && <Loader2 size={13} className={styles.spinning} />}
            Xác nhận báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Follow-Up Dialog — SA-06 ─────────────────────────────────────────

function CreateFollowUpDialog({ leadId, onClose }: { leadId: string; onClose: () => void; }) {
  const createFollowUp = useCreateFollowUp();
  const [dueAt, setDueAt] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const MAX = 500;

  const handleSubmit = async () => {
    setError('');
    if (!dueAt) { setError('Vui lòng chọn thời gian nhắc nhở'); return; }
    if (new Date(dueAt) <= new Date()) { setError('Thời gian phải ở trong tương lai'); return; }
    if (!note.trim()) { setError('Nội dung nhắc nhở là bắt buộc'); return; }
    await createFollowUp.mutateAsync({
      id: leadId,
      data: { leadId, dueAt: new Date(dueAt).toISOString(), note: note.trim() },
    });
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Đặt nhắc nhở follow-up</h2>
          <button className={styles.dialogClose} onClick={onClose}><X size={15} /></button>
        </div>
        <div className={styles.dialogBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Thời gian nhắc nhở <span className={styles.required}>*</span></label>
            <input id="followup-due-at" type="datetime-local" className={styles.formInput}
              value={dueAt} onChange={(e) => { setDueAt(e.target.value); setError(''); }}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Nội dung <span className={styles.required}>*</span>
              <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 6 }}>({note.length}/{MAX})</span>
            </label>
            <textarea id="followup-note" className={styles.formTextarea}
              placeholder="Gọi lại sau 2 ngày / Hẹn demo sản phẩm..."
              value={note} onChange={(e) => setNote(e.target.value.slice(0, MAX))} rows={3} />
          </div>
          {error && <p className={styles.fieldError}>{error}</p>}
        </div>
        <div className={styles.dialogFooter}>
          <button className={styles.btnSecondary} onClick={onClose} disabled={createFollowUp.isPending}>Huỷ</button>
          <button id="followup-submit" className={styles.btnPrimary}
            onClick={handleSubmit} disabled={createFollowUp.isPending}>
            {createFollowUp.isPending && <Loader2 size={13} className={styles.spinning} />}
            Lưu nhắc nhở
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Item ────────────────────────────────────────────────────────────

function TimelineItem({ log }: { log: ActivityLogDto }) {
  return (
    <div className={styles.timelineItem}>
      <div className={`${styles.timelineIconWrap} ${actionIconClass(log.action)}`}>
        <ActionIcon action={log.action} />
      </div>
      <div className={styles.timelineContent}>
        <div className={styles.timelineMeta}>
          <span className={styles.timelineActor}>{log.performedByName}</span>
          <span className={styles.timelineAction}>{ACTIVITY_ACTION_LABELS[log.action]}</span>
          <span className={styles.timelineTime}>{fmtDate(log.performedAt)}</span>
        </div>
        {log.newValue && (
          <p className={styles.timelineNewStatus}>→ {SA_LEAD_STATUS_LABELS[log.newValue as LeadStatus] ?? log.newValue}</p>
        )}
        {log.note && <p className={styles.timelineNote}>{log.note}</p>}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SaleLeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addNote = useAddNote();
  const { data: lead, isLoading, isError } = useSaleLeadDetail(id!);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const MAX_NOTE = 2000;

  const handleSendNote = async () => {
    if (!noteContent.trim() || !lead) return;
    await addNote.mutateAsync({ id: lead.leadId, data: { leadId: lead.leadId, content: noteContent.trim() } });
    setNoteContent('');
  };

  if (isLoading) return <div className={styles.pageLoading}><div className={styles.pageSpinner} /></div>;

  if (isError || !lead) {
    return (
      <div className={styles.notFound}>
        <AlertCircle size={40} className={styles.notFoundIcon} />
        <p>Lead không tồn tại hoặc chưa được gán cho bạn.</p>
        <button className={styles.btnSecondary} onClick={() => navigate('/sa/leads')}>
          <ArrowLeft size={14} /> Quay lại
        </button>
      </div>
    );
  }

  const isClosed = LEAD_STATUS_CLOSED.includes(lead.leadStatus);
  const hasNextStates = (SALE_LEAD_VALID_TRANSITIONS[lead.leadStatus] ?? []).length > 0;
  const sortedLogs = [...(lead.activityLogs ?? [])].sort(
    (a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime()
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/sa/leads')}><ArrowLeft size={16} /></button>
          <div className={styles.titleGroup}>
            <span className={styles.leadCode}>{lead.leadCode}</span>
            <h1 className={styles.title}>{lead.customerName}</h1>
          </div>
          <span className={`${styles.statusBadge} ${statusClass(lead.leadStatus)}`}>
            {SA_LEAD_STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus}
          </span>
        </div>
        <div className={styles.headerActions}>
          {!isClosed && (
            <>
              <button id="btn-report-invalid" className={styles.btnWarning}
                onClick={() => setReportDialogOpen(true)}>
                <AlertTriangle size={13} /> Báo không hợp lệ
              </button>
              <button id="btn-follow-up" className={styles.btnSecondary}
                onClick={() => setFollowUpDialogOpen(true)}>
                <Bell size={13} /> Đặt nhắc nhở
              </button>
              {hasNextStates && (
                <button id="btn-update-status" className={styles.btnPrimary}
                  onClick={() => setStatusDialogOpen(true)}>
                  <ArrowRightLeft size={14} /> Cập nhật trạng thái
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2-col grid */}
      <div className={styles.grid}>
        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><User size={15} className={styles.cardTitleIcon} /> Thông tin khách hàng</h2>
            </div>
            <div className={styles.cardBody}>
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
              <div className={styles.field}>
                <span className={styles.fieldLabel}><MapPin size={10} /> Địa chỉ</span>
                <span className={lead.customerAddress ? styles.fieldValue : styles.fieldValueMuted}>
                  {lead.customerAddress ?? 'Chưa có'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}><Mail size={10} /> Email</span>
                <span className={lead.customerEmail ? styles.fieldValue : styles.fieldValueMuted}>
                  {lead.customerEmail ?? 'Chưa có'}
                </span>
              </div>
              {(lead.productInterest ?? []).length > 0 && (
                <div className={styles.field}>
                  <span className={styles.fieldLabel}><Tag size={10} /> Sản phẩm quan tâm</span>
                  <div className={styles.tagsWrap}>
                    {(lead.productInterest ?? []).map((t) => <span key={t} className={styles.tag}>{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><FileText size={15} className={styles.cardTitleIcon} /> Mô tả nhu cầu</h2>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.fieldValue} style={{ margin: 0, lineHeight: 1.7 }}>{lead.needDescription}</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Thông tin hệ thống</h2></div>
            <div className={styles.cardBody}>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Ngày tạo</span>
                  <span className={styles.fieldValue}>{fmtDate(lead.createdAt)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Ngày gán</span>
                  <span className={styles.fieldValue}>{fmtDate(lead.assignedAt)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Cập nhật lần cuối</span>
                  <span className={styles.fieldValue}>{fmtDate(lead.updatedAt)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Ngày đóng</span>
                  <span className={lead.closedAt ? styles.fieldValue : styles.fieldValueMuted}>{fmtDate(lead.closedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><Zap size={15} className={styles.cardTitleIcon} /> Kết quả phân loại</h2>
            </div>
            <div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Loại nhu cầu</span>
                {lead.needType ? <span className={styles.classValue}>{NEED_TYPE_LABELS[lead.needType]}</span>
                  : <span className={styles.classValueMuted}>—</span>}
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Mức ưu tiên</span>
                {lead.priorityLevel
                  ? <span className={`${styles.priorityBadge} ${priorityClass(lead.priorityLevel)}`}>{lead.priorityLevel}</span>
                  : <span className={styles.classValueMuted}>—</span>}
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Nhóm xử lý</span>
                {lead.assignedGroup ? <span className={styles.classValue}>{ASSIGNED_GROUP_LABELS[lead.assignedGroup]}</span>
                  : <span className={styles.classValueMuted}>—</span>}
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>SLA Deadline</span>
                <span className={lead.slaViolated ? styles.slaViolated : styles.classValue}>
                  {fmtDate(lead.slaDeadline)}{lead.slaViolated && ' ⚠'}
                </span>
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Điểm ưu tiên</span>
                <span className={styles.classValue}>{lead.priorityScore ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><GitCommitVertical size={15} className={styles.cardTitleIcon} /> Lịch sử hoạt động</h2>
            </div>
            {sortedLogs.length === 0 ? (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>Chưa có hoạt động</div>
            ) : (
              <div className={styles.timeline}>
                {sortedLogs.map((log) => <TimelineItem key={log.id} log={log} />)}
              </div>
            )}
            {!isClosed && (
              <div className={styles.noteBox}>
                <span className={styles.noteBoxTitle}>Thêm ghi chú tư vấn</span>
                <textarea id="note-content" className={styles.noteTextarea}
                  placeholder="Nhập nội dung ghi chú... (tối đa 2000 ký tự)"
                  value={noteContent} onChange={(e) => setNoteContent(e.target.value.slice(0, MAX_NOTE))} rows={3} />
                <div className={styles.noteFooter}>
                  <span className={`${styles.charCount} ${noteContent.length >= MAX_NOTE ? styles.charCountOver : ''}`}>
                    {noteContent.length}/{MAX_NOTE}
                  </span>
                  <button id="btn-send-note" className={styles.btnPrimary}
                    onClick={handleSendNote} disabled={addNote.isPending || !noteContent.trim()}
                    style={{ padding: '7px 14px' }}>
                    {addNote.isPending ? <Loader2 size={13} className={styles.spinning} /> : <Send size={13} />}
                    Gửi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {statusDialogOpen && (
        <StatusUpdateDialog leadId={lead.leadId} currentStatus={lead.leadStatus}
          onClose={() => setStatusDialogOpen(false)} />
      )}
      {reportDialogOpen && (
        <ReportInvalidDialog leadId={lead.leadId}
          onClose={() => setReportDialogOpen(false)}
          onSuccess={() => { setReportDialogOpen(false); navigate('/sa/leads'); }} />
      )}
      {followUpDialogOpen && (
        <CreateFollowUpDialog leadId={lead.leadId} onClose={() => setFollowUpDialogOpen(false)} />
      )}
    </div>
  );
}
