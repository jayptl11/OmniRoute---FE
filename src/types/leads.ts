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
