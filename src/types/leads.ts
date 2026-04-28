// ─── Enums ────────────────────────────────────────────────────────────────────

export type LeadStatus =
  | 'New'
  | 'Assigned'
  | 'PendingDispatch'
  | 'PendingAssignment'
  | 'Contacted'
  | 'InProgress'
  | 'Won'
  | 'Lost'
  | 'Cancelled';

export const LEAD_STATUS_CLOSED: LeadStatus[] = ['Won', 'Lost', 'Cancelled'];

export type LeadChannel =
  | 'Hotline'
  | 'Walkin'
  | 'Webform'
  | 'Chat'
  | 'Email'
  | 'Zalo'
  | 'Referral';

export const ALL_LEAD_CHANNELS: LeadChannel[] = [
  'Hotline',
  'Walkin',
  'Webform',
  'Chat',
  'Email',
  'Zalo',
  'Referral',
];

export type NeedType =
  | 'SaleNew'
  | 'SaleUpgrade'
  | 'SaleRenew'
  | 'CskhSupport'
  | 'CskhComplaint'
  | 'CskhWarranty'
  | 'StoreVisit'
  | 'Other';

export type PriorityLevel = 'Low' | 'Medium' | 'High';

export type AssignedGroup = 'Sale' | 'Cskh' | 'StoreSupport';

export type RoutingType = 'Auto' | 'Manual';

// ─── Display helpers ──────────────────────────────────────────────────────────

export const NEED_TYPE_LABELS: Record<NeedType, string> = {
  SaleNew: 'Bán hàng mới',
  SaleUpgrade: 'Nâng cấp',
  SaleRenew: 'Gia hạn',
  CskhSupport: 'Hỗ trợ CSKH',
  CskhComplaint: 'Khiếu nại',
  CskhWarranty: 'Bảo hành',
  StoreVisit: 'Đến cửa hàng',
  Other: 'Khác',
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  New: 'Mới',
  Assigned: 'Đã phân công',
  PendingDispatch: 'Chờ điều phối',
  PendingAssignment: 'Chờ gán',
  Contacted: 'Đã liên hệ',
  InProgress: 'Đang xử lý',
  Won: 'Thành công',
  Lost: 'Thất bại',
  Cancelled: 'Đã huỷ',
};

export const ASSIGNED_GROUP_LABELS: Record<AssignedGroup, string> = {
  Sale: 'Kinh doanh',
  Cskh: 'CSKH',
  StoreSupport: 'Hỗ trợ cửa hàng',
};

// ─── TV-02: Check Duplicate ───────────────────────────────────────────────────

export interface CheckDuplicateResponse {
  hasDuplicate: boolean;
  existingLeadId: string | null;
  existingLeadCode: string | null;
  existingLeadStatus: LeadStatus | null;
  existingLeadCreatedAt: string | null;
}

// ─── TV-01: Create Lead ───────────────────────────────────────────────────────

export interface CreateLeadRequest {
  customerName: string;
  customerPhone: string;
  channel: LeadChannel;
  needDescription: string;
  customerAddress?: string | null;
  customerEmail?: string | null;
  productInterest?: string[] | null;
  forceCreate?: boolean;
}

export interface CreateLeadResponse {
  leadId: string;
  leadCode: string;
  isDuplicate: boolean;
  existingLeadId: string | null;
  existingLeadCode: string | null;
  existingLeadStatus: LeadStatus | null;
}

// ─── TV-05/07: List Leads ─────────────────────────────────────────────────────

export interface GetLeadsParams {
  search?: string;
  status?: LeadStatus;
  channel?: LeadChannel;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface LeadListItemDto {
  leadId: string;
  leadCode: string;
  customerName: string;
  customerPhone: string;
  channel: LeadChannel;
  needType: NeedType | null;
  leadStatus: LeadStatus;
  priorityLevel: PriorityLevel | null;
  createdAt: string;
}

// ─── TV-06: Lead Detail ───────────────────────────────────────────────────────

export interface LeadDetailDto {
  leadId: string;
  leadCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  customerEmail: string | null;
  channel: LeadChannel;
  needDescription: string;
  productInterest: string[];

  // Classification (TV-03)
  needType: NeedType | null;
  priorityScore: number | null;
  priorityLevel: PriorityLevel | null;
  assignedGroup: AssignedGroup | null;
  routingType: RoutingType | null;

  // Assignment
  assignedUserId: string | null;
  assignedUserName: string | null;
  assignedStoreId: string | null;
  assignedAt: string | null;

  // SLA
  slaDeadline: string | null;
  slaViolated: boolean;

  leadStatus: LeadStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

// ─── TV-04: Update Lead ───────────────────────────────────────────────────────

export interface UpdateLeadRequest {
  leadId: string;
  customerAddress?: string | null;
  customerEmail?: string | null;
  productInterest?: string[] | null;
  needDescription?: string;
}

export interface UpdateLeadResponse {
  leadId: string;
  leadCode: string;
  updatedAt: string;
}

// ─── SA-01/03: List Sale Leads ────────────────────────────────────────────────

export interface GetSaleLeadsParams {
  search?: string;
  status?: LeadStatus;
  priorityLevel?: PriorityLevel;
  channel?: LeadChannel;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface SaleLeadListItemDto {
  leadId: string;
  leadCode: string;
  customerName: string;
  customerPhone: string;
  needType: NeedType | null;
  leadStatus: LeadStatus;
  priorityLevel: PriorityLevel | null;
  slaDeadline: string | null;
  slaViolated: boolean;
  assignedAt: string;
}

// ─── SA-02: Activity Timeline ─────────────────────────────────────────────────

export type ActivityAction =
  | 'LEAD_CREATED'
  | 'LEAD_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'CONSULTATION_NOTE'
  | 'LEAD_UPDATED';

export interface ActivityLogDto {
  id: string;
  action: ActivityAction;
  note: string | null;
  newValue: string | null;
  performedAt: string;
  performedByName: string;
}

export interface SaleLeadDetailDto {
  leadId: string;
  leadCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  customerEmail: string | null;
  channel: LeadChannel;
  needDescription: string;
  productInterest: string[];

  needType: NeedType | null;
  priorityScore: number | null;
  priorityLevel: PriorityLevel | null;
  assignedGroup: AssignedGroup | null;
  routingType: RoutingType | null;

  assignedUserId: string | null;
  assignedUserName: string | null;
  assignedStoreId: string | null;
  assignedAt: string | null;

  slaDeadline: string | null;
  slaViolated: boolean;

  leadStatus: LeadStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;

  activityLogs: ActivityLogDto[];
}

// ─── SA-04: Update Status ─────────────────────────────────────────────────────

/** Valid next-states from a given status (BR-05 transition rules) */
export const SALE_LEAD_VALID_TRANSITIONS: Partial<Record<LeadStatus, LeadStatus[]>> = {
  Assigned:   ['Contacted',  'Lost', 'Cancelled'],
  Contacted:  ['InProgress', 'Lost', 'Cancelled'],
  InProgress: ['Won',        'Lost', 'Cancelled'],
};

export interface UpdateSaleLeadStatusRequest {
  leadId: string;
  newStatus: LeadStatus;
  note?: string | null;
  lostReason?: string | null;
  cancelReason?: string | null;
  wonDetails?: string | null;
}

export interface UpdateSaleLeadStatusResponse {
  leadId: string;
  leadCode: string;
  newStatus: LeadStatus;
  updatedAt: string;
}

// ─── SA-05: Add Note ──────────────────────────────────────────────────────────

export interface AddNoteRequest {
  leadId: string;
  content: string;
}

export interface AddNoteResponse {
  noteId: string;
  leadId: string;
  createdAt: string;
}

// ─── SA display helpers ───────────────────────────────────────────────────────

/** SA-specific status labels (context: lead assigned to SA) */
export const SA_LEAD_STATUS_LABELS: Partial<Record<LeadStatus, string>> = {
  Assigned:   'Chờ tiếp nhận',
  Contacted:  'Đã liên hệ',
  InProgress: 'Đang tư vấn',
  Won:        'Chốt thành công',
  Lost:       'Không chốt được',
  Cancelled:  'Đã hủy',
};

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  LEAD_CREATED:       'Lead được tạo',
  LEAD_ASSIGNED:      'Được gán cho nhân viên',
  STATUS_CHANGED:     'Chuyển trạng thái',
  CONSULTATION_NOTE:  'Ghi chú tư vấn',
  LEAD_UPDATED:       'Cập nhật thông tin',
};

// ─── SA-08: Report Invalid ────────────────────────────────────────────────────

export type InvalidReason = 'Spam' | 'WrongPhone' | 'Unreachable' | 'Other';

export const INVALID_REASON_LABELS: Record<InvalidReason, string> = {
  Spam:        'Spam / Cuộc gọi rác',
  WrongPhone:  'Số điện thoại sai',
  Unreachable: 'Không liên hệ được',
  Other:       'Lý do khác',
};

export interface ReportInvalidRequest {
  leadId: string;
  reason: InvalidReason;
}

export interface ReportInvalidResponse {
  leadId: string;
  leadCode: string;
  cancelledAt: string;
}

// ─── SA-06: Create Follow-Up ──────────────────────────────────────────────────

export interface CreateFollowUpRequest {
  leadId: string;
  dueAt: string; // ISO 8601 UTC, must be > now
  note: string;  // max 500 chars
}

export interface CreateFollowUpResponse {
  taskId: string;
  leadId: string;
  dueAt: string;
  createdAt: string;
}

// ─── SA-07: Follow-Up Tasks ───────────────────────────────────────────────────

export type FollowUpFilter = 'today' | 'upcoming' | 'overdue';

export interface FollowUpTaskDto {
  taskId: string;
  leadId: string;
  leadCode: string;
  customerName: string;
  customerPhone: string;
  dueAt: string;
  note: string;
  isOverdue: boolean;
  isToday: boolean;
}

// ─── SA-09: Performance ───────────────────────────────────────────────────────

export type PerformancePeriod = 'week' | 'month' | 'quarter';

export interface PerformanceDto {
  period: PerformancePeriod;
  periodStart: string;
  periodEnd: string;
  totalAssigned: number;
  totalProcessed: number;
  wonCount: number;
  winRate: number | null;
  avgResponseTimeMinutes: number | null;
  slaViolatedCount: number;
  generatedAt: string;
}


