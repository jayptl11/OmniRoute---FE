// ─── Enums ────────────────────────────────────────────────────────────────────

export type TicketStatus =
  | 'New'
  | 'InProgress'
  | 'WaitingCustomer'
  | 'Escalated'
  | 'Resolved'
  | 'Closed';

export type TicketChannel =
  | 'Hotline'   // added per spec example
  | 'Phone'
  | 'Chat'
  | 'Email'
  | 'Zalo'
  | 'Walkin'
  | 'Other';

export type TicketNeedType =
  | 'CskhSupport'      // added per spec example
  | 'TechnicalSupport'
  | 'Complaint'
  | 'Warranty'
  | 'Billing'
  | 'Other';

export type TicketPriorityLevel = 'Low' | 'Medium' | 'High';

export type TicketActivityAction =
  | 'TICKET_CREATED'
  | 'STATUS_CHANGED'
  | 'PROCESSING_NOTE'
  | 'ESCALATED'
  | 'SATISFACTION_RECORDED';

export type TicketPerformancePeriod = 'week' | 'month' | 'quarter';

// ─── Display Helpers ──────────────────────────────────────────────────────────

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  New:             'Mới',
  InProgress:      'Đang xử lý',
  WaitingCustomer: 'Chờ KH phản hồi',
  Escalated:       'Đã escalate',
  Resolved:        'Đã giải quyết',
  Closed:          'Đã đóng',
};

export const TICKET_CHANNEL_LABELS: Record<TicketChannel, string> = {
  Hotline: 'Hotline',
  Phone:   'Điện thoại',
  Chat:    'Chat',
  Email:   'Email',
  Zalo:    'Zalo',
  Walkin:  'Trực tiếp',
  Other:   'Khác',
};

export const TICKET_NEED_TYPE_LABELS: Record<TicketNeedType, string> = {
  CskhSupport:      'Hỗ trợ CSKH',
  TechnicalSupport: 'Hỗ trợ kỹ thuật',
  Complaint:        'Khiếu nại',
  Warranty:         'Bảo hành',
  Billing:          'Thanh toán',
  Other:            'Khác',
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriorityLevel, string> = {
  Low:    'Thấp',
  Medium: 'Trung bình',
  High:   'Cao',
};

export const TICKET_ACTIVITY_ACTION_LABELS: Record<TicketActivityAction, string> = {
  TICKET_CREATED:        'Ticket được tạo',
  STATUS_CHANGED:        'Chuyển trạng thái',
  PROCESSING_NOTE:       'Ghi chú xử lý',
  ESCALATED:             'Escalate ticket',
  SATISFACTION_RECORDED: 'Ghi nhận hài lòng',
};

/**
 * BR-05: Valid status transitions.
 * CS-04 does NOT allow transitioning to `Escalated` — use CS-06 (escalate endpoint) instead.
 */
export const TICKET_VALID_TRANSITIONS: Partial<Record<TicketStatus, TicketStatus[]>> = {
  New:             ['InProgress'],
  InProgress:      ['WaitingCustomer', 'Resolved'],   // Escalated removed — use CS-06
  WaitingCustomer: ['InProgress', 'Resolved'],
  Escalated:       ['Resolved'],
  Resolved:        ['Closed'],
};

/** Satisfaction score labels & colors */
export interface SatisfactionMeta {
  label: string;
  color: string;
}

export const SATISFACTION_META: Record<number, SatisfactionMeta> = {
  1: { label: 'Rất không hài lòng', color: '#ef4444' },
  2: { label: 'Không hài lòng',     color: '#f97316' },
  3: { label: 'Bình thường',         color: '#eab308' },
  4: { label: 'Hài lòng',            color: '#86efac' },
  5: { label: 'Rất hài lòng',        color: '#22c55e' },
};

// ─── CS-01 + CS-03: List Tickets ─────────────────────────────────────────────

export interface GetTicketsParams {
  search?:        string;
  status?:        TicketStatus;
  priorityLevel?: TicketPriorityLevel;
  dateFrom?:      string;
  dateTo?:        string;
  page?:          number;
  pageSize?:      number;
}

/**
 * CS-01 list item — only fields returned by GET /api/tickets.
 * NOTE: `ticketStatus` (not `status`) per spec.
 */
export interface TicketListItemDto {
  ticketId:      string;
  ticketCode:    string;
  customerName:  string;
  customerPhone: string;
  needType:      TicketNeedType;
  ticketStatus:  TicketStatus;   // field name per spec (not "status")
  priorityLevel: TicketPriorityLevel;
  slaDeadline:   string;
  slaViolated:   boolean;
  assignedAt:    string;
}

// ─── CS-02: Ticket Detail ─────────────────────────────────────────────────────

export interface TicketActivityLogDto {
  id:              string;
  action:          TicketActivityAction;
  note:            string | null;
  newValue:        string | null;
  performedAt:     string;
  performedByName: string;
}

export interface CustomerTicketHistoryDto {
  ticketId:     string;
  ticketCode:   string;
  needType:     TicketNeedType;   // replaces needDescription — spec only returns needType
  ticketStatus: TicketStatus;     // field name per spec (not "status")
  createdAt:    string;
  closedAt:     string | null;
}

/**
 * CS-02 detail — fields exactly as returned by GET /api/tickets/{id}.
 * NOTE: `ticketStatus` (not `status`) per spec.
 * NOTE: No `escalatedTo`/`escalatedAt` — spec uses `isEscalated: bool` + `escalatedReason`.
 */
export interface TicketDetailDto {
  ticketId:           string;
  ticketCode:         string;
  customerName:       string;
  customerPhone:      string;
  customerAddress:    string | null;
  customerEmail:      string | null;
  channel:            TicketChannel;
  needType:           TicketNeedType | null;
  needDescription:    string;
  priorityScore:      number;
  priorityLevel:      TicketPriorityLevel;
  assignedUserId:     string;
  assignedUserName:   string;
  assignedStoreId:    string;
  assignedAt:         string;
  slaDeadline:        string;
  slaViolated:        boolean;
  ticketStatus:       TicketStatus;   // field name per spec (not "status")
  isEscalated:        boolean;
  escalatedReason:    string | null;
  satisfactionScore:  number | null;
  satisfactionNote:   string | null;
  createdBy:          string;
  createdAt:          string;
  updatedAt:          string;
  closedAt:           string | null;
  activityLogs:          TicketActivityLogDto[] | null;
  customerTicketHistory: CustomerTicketHistoryDto[] | null;
}

// ─── CS-04: Update Status ─────────────────────────────────────────────────────

export interface UpdateTicketStatusRequest {
  ticketId:     string;
  newStatus:    TicketStatus;
  note?:        string;
  cancelReason?: string;  // optional, used when newStatus = Closed
}

export interface UpdateTicketStatusResponse {
  ticketId:  string;
  ticketCode: string;
  newStatus: TicketStatus;
  updatedAt: string;
}

// ─── CS-05: Add Note ─────────────────────────────────────────────────────────

export interface AddTicketNoteRequest {
  ticketId: string;
  content:  string; // BE field name is "content" (not "note"), max 4000 chars
}

export interface AddTicketNoteResponse {
  noteId:    string;
  ticketId:  string;
  createdAt: string;
}

// ─── CS-06: Escalate ─────────────────────────────────────────────────────────

export interface EscalateTicketRequest {
  ticketId:   string;
  escalateTo: string;  // field name per spec: "escalateTo" (not "escalatedTo")
  reason:     string;  // max 1000 chars
}

export interface EscalateTicketResponse {
  ticketId:    string;
  ticketCode:  string;
  escalatedTo: string;
  escalatedAt: string;
}

// ─── CS-07: Satisfaction ─────────────────────────────────────────────────────

export interface RecordSatisfactionRequest {
  ticketId: string;
  score:    number; // 1–5
  note?:    string; // max 1000 chars
}

export interface RecordSatisfactionResponse {
  ticketId:          string;
  ticketCode:        string;
  satisfactionScore: number;
  updatedAt:         string;
}

// ─── CS-08: Performance ───────────────────────────────────────────────────────

/**
 * onTimeRate: percentage 0–100 (NOT a 0.0–1.0 ratio).
 * avgHandlingTimeMinutes: null if no Closed/Resolved tickets yet.
 * avgSatisfactionScore: null if no satisfaction data yet.
 */
export interface TicketPerformanceDto {
  period:                  TicketPerformancePeriod;
  periodStart:             string;  // was dateFrom — renamed per spec
  periodEnd:               string;  // was dateTo   — renamed per spec
  totalAssigned:           number;
  totalProcessed:          number;
  resolvedCount:           number;
  onTimeRate:              number;        // 0–100 percent (not 0.0–1.0)
  avgHandlingTimeMinutes:  number | null; // null if no Closed/Resolved yet
  avgSatisfactionScore:    number | null; // null if no data
  slaViolatedCount:        number;
  generatedAt:             string;
}
