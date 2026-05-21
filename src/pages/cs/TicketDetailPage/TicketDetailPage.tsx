import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Send,
  ArrowUpRight,
  Star,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/errors';
import { useTicketDetail, useUpdateTicketStatus, useAddTicketNote, useEscalateTicket, useRecordSatisfaction } from '@/features/cs/hooks/useTickets';
import type {
  TicketStatus,
  TicketDetailDto,
} from '@/types/tickets';
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_NEED_TYPE_LABELS,
  TICKET_ACTIVITY_ACTION_LABELS,
  TICKET_VALID_TRANSITIONS,
  SATISFACTION_META,
} from '@/types/tickets';
import { GlassSelect } from '@/components/glass';
import styles from './TicketDetailPage.module.css';
import { getChannelLabel } from '@/lib/roleChannel';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function minutesUntil(iso: string) {
  return Math.floor((new Date(iso).getTime() - Date.now()) / 60000);
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function SlaBadge({ ticket }: { ticket: TicketDetailDto }) {
  if (ticket.slaViolated) {
    return (
      <span className={styles.slaViolated}>
        <AlertTriangle size={12} /> Vi phạm SLA
      </span>
    );
  }
  const mins = minutesUntil(ticket.slaDeadline);
  if (mins < 30) {
    return (
      <span className={styles.slaCritical}>
        <Clock size={12} /> Sắp đến hạn ({mins > 0 ? `${mins} phút` : 'Quá hạn'})
      </span>
    );
  }
  return (
    <span className={styles.slaNormal}>
      SLA: {formatDate(ticket.slaDeadline)}
    </span>
  );
}

// ─── CS-04: Update Status Panel ───────────────────────────────────────────────

function UpdateStatusPanel({ ticket }: { ticket: TicketDetailDto }) {
  const updateMutation = useUpdateTicketStatus();
  const validNextStates = TICKET_VALID_TRANSITIONS[ticket.ticketStatus] ?? [];
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('');
  const [note, setNote] = useState('');

  const noteRequired = selectedStatus === 'InProgress' || selectedStatus === 'Resolved';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStatus) return;
    try {
      await updateMutation.mutateAsync({
        id: ticket.ticketId,
        data: {
          ticketId: ticket.ticketId,
          newStatus: selectedStatus,
          note: note || undefined,
        },
      });
      toast.success(`Đã cập nhật trạng thái → ${TICKET_STATUS_LABELS[selectedStatus]}`);
      setSelectedStatus('');
      setNote('');
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  }

  if (validNextStates.length === 0) {
    return (
      <div className={styles.panelEmpty}>
        Không có trạng thái nào có thể chuyển từ{' '}
        <strong>{TICKET_STATUS_LABELS[ticket.ticketStatus] ?? ticket.ticketStatus ?? '(không xác định)'}</strong>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.panel}>
      <h3 className={styles.panelTitle}>
        <ChevronDown size={15} /> Cập nhật trạng thái
      </h3>
      <GlassSelect
        id="cs-ticket-status-select"
        value={selectedStatus}
        onChange={(val) => setSelectedStatus(val as TicketStatus | '')}
        options={[
          { value: '', label: '— Chọn trạng thái đích —' },
          ...validNextStates.map((s) => ({ value: s, label: TICKET_STATUS_LABELS[s] })),
        ]}
        placeholder="— Chọn trạng thái đích —"
      />

      {(selectedStatus || noteRequired) && (
        <textarea
          id="cs-ticket-status-note"
          className={styles.textarea}
          placeholder={
            noteRequired
              ? 'Ghi chú bắt buộc khi chuyển sang trạng thái này... (max 1000 ký tự)'
              : 'Ghi chú kèm theo (tuỳ chọn)...'
          }
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1000}
          rows={3}
          required={noteRequired}
        />
      )}

      <button
        id="cs-ticket-status-submit"
        type="submit"
        className={styles.btnPrimary}
        disabled={!selectedStatus || updateMutation.isPending || (noteRequired && !note.trim())}
      >
        {updateMutation.isPending ? 'Đang lưu...' : 'Cập nhật'}
      </button>
    </form>
  );
}

// ─── CS-05: Add Note Panel ────────────────────────────────────────────────────

function AddNotePanel({ ticket }: { ticket: TicketDetailDto }) {
  const noteMutation = useAddTicketNote();
  const [note, setNote] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      await noteMutation.mutateAsync({
        id: ticket.ticketId,
        data: { ticketId: ticket.ticketId, content: note },
      });
      toast.success('Đã thêm ghi chú');
      setNote('');
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.panel}>
      <h3 className={styles.panelTitle}>
        <FileText size={15} /> Ghi chú xử lý
      </h3>
      <textarea
        id="cs-ticket-note-input"
        className={styles.textarea}
        placeholder="Nhập ghi chú kết quả xử lý... (tối đa 4000 ký tự)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={4000}
        rows={4}
        required
      />
      <div className={styles.textareaFooter}>
        <span className={styles.charCount}>{note.length}/4000</span>
        <button
          id="cs-ticket-note-submit"
          type="submit"
          className={styles.btnPrimary}
          disabled={!note.trim() || note.length < 1 || noteMutation.isPending}
        >
          <Send size={13} />
          {noteMutation.isPending ? 'Đang lưu...' : 'Ghi chú'}
        </button>
      </div>
    </form>
  );
}

// ─── CS-06: Escalate Panel ────────────────────────────────────────────────────

function EscalatePanel({ ticket }: { ticket: TicketDetailDto }) {
  const escalateMutation = useEscalateTicket();
  const [escalatedTo, setEscalatedTo] = useState('');
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);

  const canEscalate =
    ticket.ticketStatus === 'InProgress' ||
    ticket.ticketStatus === 'WaitingCustomer' ||
    ticket.ticketStatus === 'New';

  if (!canEscalate) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!escalatedTo.trim() || !reason.trim()) return;
    try {
      await escalateMutation.mutateAsync({
        id: ticket.ticketId,
        data: { ticketId: ticket.ticketId, escalateTo: escalatedTo, reason },
      });
      toast.success('Đã escalate ticket');
      setOpen(false);
      setEscalatedTo('');
      setReason('');
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  }

  return (
    <div className={styles.panel}>
      <button
        id="cs-ticket-escalate-toggle"
        className={styles.btnDanger}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <ArrowUpRight size={14} /> Escalate ticket
      </button>

      {open && (
        <form onSubmit={handleSubmit} className={styles.escalateForm}>
          <label className={styles.label}>User ID người nhận (Supervisor/Manager)</label>
          <input
            id="cs-ticket-escalate-to"
            className={styles.inputText}
            placeholder="User GUID của người nhận..."
            value={escalatedTo}
            onChange={(e) => setEscalatedTo(e.target.value)}
            required
          />
          <label className={styles.label}>Lý do escalate (10–2000 ký tự)</label>
          <textarea
            id="cs-ticket-escalate-reason"
            className={styles.textarea}
            placeholder="Mô tả lý do vượt thẩm quyền xử lý..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            minLength={10}
            maxLength={2000}
            rows={3}
            required
          />
          <button
            id="cs-ticket-escalate-submit"
            type="submit"
            className={styles.btnDangerSolid}
            disabled={escalateMutation.isPending || !escalatedTo.trim() || reason.trim().length < 10}
          >
            {escalateMutation.isPending ? 'Đang gửi...' : 'Xác nhận escalate'}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── CS-07: Satisfaction Panel ────────────────────────────────────────────────

function SatisfactionPanel({ ticket }: { ticket: TicketDetailDto }) {
  const satisfactionMutation = useRecordSatisfaction();
  const [score, setScore] = useState<number>(0);
  const [note, setNote] = useState('');

  const canRecord =
    (ticket.ticketStatus === 'Resolved' || ticket.ticketStatus === 'Closed') &&
    ticket.satisfactionScore === null;

  if (!canRecord) {
    if (ticket.satisfactionScore !== null) {
      return (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}><Star size={15} /> Mức độ hài lòng KH</h3>
          <div className={styles.satisfactionRecorded}>
            <div className={styles.starsDisplay}>
              {[1,2,3,4,5].map((s) => (
                <Star
                  key={s}
                  size={22}
                  fill={s <= (ticket.satisfactionScore ?? 0) ? '#f59e0b' : 'transparent'}
                  color={s <= (ticket.satisfactionScore ?? 0) ? '#f59e0b' : '#d1d5db'}
                />
              ))}
              <span className={styles.satisfactionLabel}>
                {SATISFACTION_META[ticket.satisfactionScore!]?.label}
              </span>
            </div>
            {ticket.satisfactionNote && (
              <p className={styles.satisfactionNote}>{ticket.satisfactionNote}</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (score < 1 || score > 5) return;
    try {
      await satisfactionMutation.mutateAsync({
        id: ticket.ticketId,
        data: { ticketId: ticket.ticketId, score, note: note || undefined },
      });
      toast.success('Đã ghi nhận mức độ hài lòng');
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.panel}>
      <h3 className={styles.panelTitle}><Star size={15} /> Ghi nhận hài lòng KH</h3>
      <div className={styles.starsInput}>
        {[1,2,3,4,5].map((s) => (
          <button
            key={s}
            type="button"
            className={styles.starBtn}
            onClick={() => setScore(s)}
            title={SATISFACTION_META[s].label}
            id={`cs-ticket-star-${s}`}
          >
            <Star
              size={26}
              fill={s <= score ? '#f59e0b' : 'transparent'}
              color={s <= score ? '#f59e0b' : '#d1d5db'}
            />
          </button>
        ))}
        {score > 0 && (
          <span
            className={styles.scoreLabel}
            style={{ color: SATISFACTION_META[score].color }}
          >
            {SATISFACTION_META[score].label}
          </span>
        )}
      </div>
      <textarea
        id="cs-ticket-satisfaction-note"
        className={styles.textarea}
        placeholder="Ghi chú thêm (tuỳ chọn, max 500 ký tự)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        rows={2}
      />
      <button
        id="cs-ticket-satisfaction-submit"
        type="submit"
        className={styles.btnPrimary}
        disabled={score < 1 || satisfactionMutation.isPending}
      >
        {satisfactionMutation.isPending ? 'Đang lưu...' : 'Ghi nhận'}
      </button>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticket, isLoading, isError } = useTicketDetail(id ?? '');

  if (isLoading) {
    return (
      <div className={styles.centerState}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className={styles.centerState}>
        <AlertTriangle size={32} color="#ef4444" />
        <p>Không tìm thấy ticket hoặc bạn không có quyền truy cập.</p>
        <button className={styles.btnBack} onClick={() => navigate('/cs/tickets')}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Back nav */}
      <button className={styles.backBtn} onClick={() => navigate('/cs/tickets')}>
        <ArrowLeft size={15} /> Danh sách ticket
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.ticketCode}>{ticket.ticketCode}</span>
          <h1 className={styles.title}>{ticket.needDescription}</h1>
          <div className={styles.badges}>
            <span className={`${styles.statusBadge} ${statusClass(ticket.ticketStatus)}`}>
              {TICKET_STATUS_LABELS[ticket.ticketStatus]}
            </span>
            <span className={`${styles.priorityBadge} ${
              ticket.priorityLevel === 'High'   ? styles.priorityHigh   :
              ticket.priorityLevel === 'Medium' ? styles.priorityMedium :
              styles.priorityLow
            }`}>
              {TICKET_PRIORITY_LABELS[ticket.priorityLevel]} · {ticket.priorityScore} điểm
            </span>
            <span className={styles.channelBadge}>
              {getChannelLabel(ticket.channel, ticket.channelDisplayName)}
            </span>
            <SlaBadge ticket={ticket} />
          </div>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.metaItem}>
            Nhân viên: {ticket.assignedUserName}
          </span>
          <span className={styles.metaItem}>Gán lúc {formatDate(ticket.assignedAt)}</span>
          <span className={styles.metaItem}>Tạo lúc {formatDate(ticket.createdAt)}</span>
        </div>
      </div>

      {/* Body — 3-column layout */}
      <div className={styles.body}>
        {/* Left: Customer Info + History */}
        <div className={styles.leftCol}>
          {/* Customer info card */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Thông tin khách hàng</h2>
            <div className={styles.infoGrid}>
              <span className={styles.infoLabel}>Họ tên</span>
              <span className={styles.infoValue}>{ticket.customerName}</span>

              <span className={styles.infoLabel}>
                <Phone size={12} /> SĐT
              </span>
              <span className={styles.infoValue}>{ticket.customerPhone}</span>

              {ticket.customerEmail && (
                <>
                  <span className={styles.infoLabel}><Mail size={12} /> Email</span>
                  <span className={styles.infoValue}>{ticket.customerEmail}</span>
                </>
              )}

              {ticket.customerAddress && (
                <>
                  <span className={styles.infoLabel}><MapPin size={12} /> Địa chỉ</span>
                  <span className={styles.infoValue}>{ticket.customerAddress}</span>
                </>
              )}

              <span className={styles.infoLabel}>Loại nhu cầu</span>
              <span className={styles.infoValue}>
                {ticket.needType ? TICKET_NEED_TYPE_LABELS[ticket.needType] : '—'}
              </span>
            </div>

            {ticket.isEscalated && (
              <div className={styles.escalatedInfo}>
                <ArrowUpRight size={13} />
                <span>Escalated — {ticket.escalatedReason ?? '—'}</span>
              </div>
            )}
          </section>

          {/* Customer ticket history */}
          {(ticket.customerTicketHistory ?? []).length > 0 && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                Lịch sử ticket cùng số điện thoại ({(ticket.customerTicketHistory ?? []).length})
              </h2>
              <div className={styles.historyList}>
                {(ticket.customerTicketHistory ?? []).map((h) => (
                  <div key={h.ticketId} className={styles.historyItem}>
                    <div className={styles.historyHeader}>
                      <span className={styles.historyCode}>{h.ticketCode}</span>
                      <span className={`${styles.statusBadge} ${statusClass(h.ticketStatus)}`}>
                        {TICKET_STATUS_LABELS[h.ticketStatus]}
                      </span>
                    </div>
                    <p className={styles.historyDesc}>
                      {TICKET_NEED_TYPE_LABELS[h.needType] ?? h.needType}
                    </p>
                    <span className={styles.historyDate}>{formatDate(h.createdAt)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Middle: Action panels */}
        <div className={styles.middleCol}>
          <UpdateStatusPanel ticket={ticket} />
          <AddNotePanel ticket={ticket} />
          <EscalatePanel ticket={ticket} />
          <SatisfactionPanel ticket={ticket} />
        </div>

        {/* Right: Activity Timeline */}
        <div className={styles.rightCol}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Lịch sử hoạt động</h2>
            <div className={styles.timeline}>
              {(ticket.activityLogs ?? []).map((log) => (
                <div key={log.id} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineAction}>
                      {TICKET_ACTIVITY_ACTION_LABELS[log.action] ?? log.action}
                    </span>
                    {log.newValue && (
                      <span className={styles.timelineValue}>→ {log.newValue}</span>
                    )}
                    {log.note && (
                      <p className={styles.timelineNote}>{log.note}</p>
                    )}
                    <div className={styles.timelineMeta}>
                      <span>{log.performedByName}</span>
                      <span>{formatDate(log.performedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(ticket.activityLogs ?? []).length === 0 && (
                <p className={styles.timelineEmpty}>Chưa có hoạt động nào</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
