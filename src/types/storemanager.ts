// ─── Phase 7: Store Manager (QL) Types ───────────────────────────────────────

// ── Shared ────────────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── LeadStatus enum ───────────────────────────────────────────────────────────

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

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  New: 'Mới',
  Assigned: 'Đã phân công',
  PendingDispatch: 'Chờ dispatch',
  PendingAssignment: 'Chờ phân công',
  Contacted: 'Đã liên hệ',
  InProgress: 'Đang xử lý',
  Won: 'Chốt thành công',
  Lost: 'Thất bại',
  Cancelled: 'Đã hủy',
};

export const TERMINAL_STATUSES: LeadStatus[] = ['Won', 'Lost', 'Cancelled'];
export const ACTIVE_STATUSES: LeadStatus[] = [
  'Assigned',
  'Contacted',
  'InProgress',
  'PendingAssignment',
  'PendingDispatch',
];

// ── API 1 — Danh sách nhân sự (QL-06) ────────────────────────────────────────

export interface StoreStaffDto {
  userId: string;
  fullName: string;
  roleName: string | null; // "SA" | "CS" | "DP"
  roleDisplayName?: string | null;
  isActive: boolean;
  currentWorkload: number;
  lastAssignedAt: string | null; // ISO 8601
}

// ── API 2 — Tìm kiếm user để thêm (QL-07 helper) ─────────────────────────────

export interface AddableStoreUserDto {
  userId: string;
  fullName: string;
  username: string;
  roleName: string | null;
  roleDisplayName?: string | null;
  hasStore: boolean; // true = đang thuộc đơn vị khác
}

// ── API 5 — Workload nhân sự (QL-02) ─────────────────────────────────────────

export interface StoreStaffWorkloadDto {
  userId: string;
  fullName: string;
  roleName: string | null;
  roleDisplayName?: string | null;
  isActive: boolean;
  currentWorkload: number;
  slaViolatedCount: number;
  completedCount: number;
}

// ── API 6 — Năng lực tiếp nhận (QL-09) ───────────────────────────────────────

export interface StoreCapacityResultDto {
  storeId: string;
  storeCode: string;
  storeName: string;
  address: string | null;
  region: string | null;
  maxCapacity: number;
  activeLeads: number;
  availableSlots: number;  // maxCapacity - activeLeads (có thể âm)
  isOverCapacity: boolean;
  isNearCapacity: boolean; // availableSlots / maxCapacity < 20%
}

// ── API 7 — Danh sách lead đơn vị (QL-01) ────────────────────────────────────

export interface StoreLeadListItemDto {
  leadId: string;
  leadCode: string;
  customerName: string;
  customerPhone: string;
  needType: string | null;
  leadStatus: LeadStatus;
  priorityLevel: string | null; // "HIGH" | "MEDIUM" | "LOW"
  slaDeadline: string | null;
  slaViolated: boolean;
  assignedUserId: string | null;
  assignedUserName: string | null;
}

// ── API 9 — Lịch sử xử lý lead (QL-05) ──────────────────────────────────────

export interface StoreLeadHistoryItemDto {
  logId: string;
  leadId: string;
  leadCode: string | null;
  customerName: string | null;
  customerPhone: string | null;
  action: string;           // "LEAD_REASSIGNED" | "STATUS_CHANGED" | ...
  oldValue: string | null;
  newValue: string | null;
  note: string | null;
  performedBy: string | null;
  performedByName: string | null;
  performedAt: string;
}

// ── API 10 — Báo cáo đơn vị (QL-04) ─────────────────────────────────────────

export interface DailyLeadTrendDto {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface StoreReportDto {
  period: string;         // "week" | "month" | "quarter" | "custom"
  periodStart: string;
  periodEnd: string;
  totalLeads: number;
  byStatus: Record<string, number>; // { "New": 5, "Won": 12, ... }
  slaAchievedCount: number;
  slaViolatedCount: number;
  slaAchievedRate: number | null; // null nếu totalLeads = 0
  wonCount: number;
  winRate: number | null;
  dailyTrend: DailyLeadTrendDto[];
  generatedAt: string;
}

// ── Param types ───────────────────────────────────────────────────────────────

export type StoreReportPeriod = 'week' | 'month' | 'quarter' | 'custom';

export interface GetStoreLeadsParams {
  search?: string;
  status?: string;
  priorityLevel?: string;
  channel?: string;
  assignedUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface GetStoreHistoryParams {
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface GetStoreReportParams {
  period?: StoreReportPeriod;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReassignStoreLeadRequest {
  newUserId: string;
  reason: string;
}

export interface AddStoreMemberRequest {
  userId: string;
}

export interface AddStoreNoteRequest {
  content: string;
}

export interface SearchStoreMembersParams {
  q?: string;
}
