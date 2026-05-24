import { CHANNEL_LABELS, type ChannelValue } from '@/lib/roleChannel';

export type TicketStatus =
  | 'New'
  | 'InProgress'
  | 'WaitingCustomer'
  | 'Escalated'
  | 'Resolved'
  | 'Closed';

export type TicketChannel = ChannelValue;

export type TicketNeedType =
  | 'CskhSupport'
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

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  New: 'Mới',
  InProgress: 'Đang xử lý',
  WaitingCustomer: 'Chờ KH phản hồi',
  Escalated: 'Đã escalate',
  Resolved: 'Đã giải quyết',
  Closed: 'Đã đóng',
};

export const TICKET_CHANNEL_LABELS: Record<TicketChannel, string> = {
  ...CHANNEL_LABELS,
};

export const TICKET_NEED_TYPE_LABELS: Record<TicketNeedType, string> = {
  CskhSupport: 'Hỗ trợ CSKH',
  TechnicalSupport: 'Hỗ trợ kỹ thuật',
  Complaint: 'Khiếu nại',
  Warranty: 'Bảo hành',
  Billing: 'Thanh toán',
  Other: 'Khác',
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriorityLevel, string> = {
  Low: 'Thấp',
  Medium: 'Trung bình',
  High: 'Cao',
};

export const TICKET_ACTIVITY_ACTION_LABELS: Record<TicketActivityAction, string> = {
  TICKET_CREATED: 'Ticket được tạo',
  STATUS_CHANGED: 'Chuyển trạng thái',
  PROCESSING_NOTE: 'Ghi chú xử lý',
  ESCALATED: 'Escalate ticket',
  SATISFACTION_RECORDED: 'Ghi nhận hài lòng',
};

export const TICKET_VALID_TRANSITIONS: Partial<Record<TicketStatus, TicketStatus[]>> = {
  New: ['InProgress'],
  InProgress: ['WaitingCustomer', 'Resolved'],
  WaitingCustomer: ['InProgress', 'Resolved'],
  Escalated: ['Resolved'],
  Resolved: ['Closed'],
};

export interface SatisfactionMeta {
  label: string;
  color: string;
}

export const SATISFACTION_META: Record<number, SatisfactionMeta> = {
  1: { label: 'Rất không hài lòng', color: '#ef4444' },
  2: { label: 'Không hài lòng', color: '#f97316' },
  3: { label: 'Bình thường', color: '#eab308' },
  4: { label: 'Hài lòng', color: '#86efac' },
  5: { label: 'Rất hài lòng', color: '#22c55e' },
};

export interface GetTicketsParams {
  search?: string;
  status?: TicketStatus;
  priorityLevel?: TicketPriorityLevel;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface TicketListItemDto {
  ticketId: string;
  ticketCode: string;
  customerName: string;
  customerPhone: string;
  needType: TicketNeedType;
  ticketStatus: TicketStatus;
  priorityLevel: TicketPriorityLevel;
  slaDeadline: string;
  slaViolated: boolean;
  assignedAt: string;
}

export interface TicketActivityLogDto {
  id: string;
  action: TicketActivityAction;
  note: string | null;
  newValue: string | null;
  performedAt: string;
  performedByName: string;
}

export interface CustomerTicketHistoryDto {
  ticketId: string;
  ticketCode: string;
  needType: TicketNeedType;
  ticketStatus: TicketStatus;
  createdAt: string;
  closedAt: string | null;
}

export interface TicketDetailDto {
  ticketId: string;
  ticketCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  customerEmail: string | null;
  channel: TicketChannel;
  channelDisplayName?: string | null;
  needType: TicketNeedType | null;
  needDescription: string;
  priorityScore: number;
  priorityLevel: TicketPriorityLevel;
  assignedUserId: string;
  assignedUserName: string;
  assignedStoreId: string;
  assignedAt: string;
  slaDeadline: string;
  slaViolated: boolean;
  ticketStatus: TicketStatus;
  isEscalated: boolean;
  escalatedReason: string | null;
  satisfactionScore: number | null;
  satisfactionNote: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  activityLogs: TicketActivityLogDto[] | null;
  customerTicketHistory: CustomerTicketHistoryDto[] | null;
}

export interface UpdateTicketStatusRequest {
  ticketId: string;
  newStatus: TicketStatus;
  note?: string;
  cancelReason?: string;
}

export interface UpdateTicketStatusResponse {
  ticketId: string;
  ticketCode: string;
  newStatus: TicketStatus;
  updatedAt: string;
}

export interface AddTicketNoteRequest {
  ticketId: string;
  content: string;
}

export interface AddTicketNoteResponse {
  noteId: string;
  ticketId: string;
  createdAt: string;
}

export interface EscalateTicketRequest {
  ticketId: string;
  escalateTo: string;
  reason: string;
}

export interface EscalateTicketResponse {
  ticketId: string;
  ticketCode: string;
  escalatedTo: string;
  escalatedAt: string;
}

export interface RecordSatisfactionRequest {
  ticketId: string;
  score: number;
  note?: string;
}

export interface RecordSatisfactionResponse {
  ticketId: string;
  ticketCode: string;
  satisfactionScore: number;
  updatedAt: string;
}

export interface TicketPerformanceDto {
  period: TicketPerformancePeriod;
  periodStart: string;
  periodEnd: string;
  totalAssigned: number;
  totalProcessed: number;
  resolvedCount: number;
  onTimeRate: number;
  avgHandlingTimeMinutes: number | null;
  avgSatisfactionScore: number | null;
  slaViolatedCount: number;
  generatedAt: string;
}
