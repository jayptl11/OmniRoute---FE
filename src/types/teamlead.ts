// ─── Enums ────────────────────────────────────────────────────────────────────

export type TnLeadStatus =
  | 'New'
  | 'PendingResponse'
  | 'InProgress'
  | 'Escalated'
  | 'Won'
  | 'Lost'
  | 'Invalid'
  | 'Closed';

export const TN_LEAD_STATUS_TERMINAL: TnLeadStatus[] = ['Won', 'Lost', 'Invalid', 'Closed'];

export const TN_LEAD_STATUS_LABELS: Record<TnLeadStatus, string> = {
  New: 'Mới',
  PendingResponse: 'Chờ phản hồi',
  InProgress: 'Đang xử lý',
  Escalated: 'Đã escalate',
  Won: 'Thành công',
  Lost: 'Thất bại',
  Invalid: 'Không hợp lệ',
  Closed: 'Đã đóng',
};

export const TN_LEAD_STATUS_COLORS: Record<TnLeadStatus, string> = {
  New: '#6366f1',
  PendingResponse: '#f59e0b',
  InProgress: '#3b82f6',
  Escalated: '#8b5cf6',
  Won: '#10b981',
  Lost: '#ef4444',
  Invalid: '#6b7280',
  Closed: '#94a3b8',
};

export type TnPriorityLevel = 'High' | 'Medium' | 'Low';

export const TN_PRIORITY_LABELS: Record<TnPriorityLevel, string> = {
  High: 'Cao',
  Medium: 'Trung bình',
  Low: 'Thấp',
};

export const TN_PRIORITY_COLORS: Record<TnPriorityLevel, string> = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

export type TnChannel = 'Web' | 'Facebook' | 'Zalo' | 'Phone' | 'Walkin' | 'Other';

export const TN_CHANNEL_LABELS: Record<TnChannel, string> = {
  Web: 'Website',
  Facebook: 'Facebook',
  Zalo: 'Zalo',
  Phone: 'Điện thoại',
  Walkin: 'Đến trực tiếp',
  Other: 'Khác',
};

export type Period = 'today' | 'week' | 'month' | 'quarter';

export const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hôm nay',
  week: '7 ngày',
  month: '30 ngày',
  quarter: '90 ngày',
};

// ─── TN-01: Overview ──────────────────────────────────────────────────────────

export interface TrendDayDto {
  date: string;
  count: number;
}

export interface TeamLeadOverviewDto {
  pendingResponse: number;
  inProgress: number;
  slaViolated: number;
  slaNearDeadline: number;
  trendLast7Days: TrendDayDto[];
}

// ─── TN-02: SLA Violations ────────────────────────────────────────────────────

export interface SlaViolationDto {
  leadId: string;
  leadCode: string;
  customerName: string;
  customerPhone: string;
  needType: string | null;
  leadStatus: TnLeadStatus;
  priorityLevel: TnPriorityLevel | null;
  slaDeadline: string;
  slaViolated: boolean;
  assignedUserId: string | null;
  assignedUserName: string | null;
  hoursUntilDeadline: number;
}

export interface SlaViolationsResponse {
  items: SlaViolationDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface SlaViolationsParams {
  page?: number;
  pageSize?: number;
}

// ─── TN-03: Team Leads List ───────────────────────────────────────────────────

export interface GetTeamLeadsParams {
  search?: string;
  status?: TnLeadStatus;
  priorityLevel?: TnPriorityLevel;
  channel?: TnChannel;
  assignedUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface TeamLeadListItemDto {
  leadId: string;
  leadCode: string;
  customerName: string;
  customerPhone: string;
  needType: string | null;
  leadStatus: TnLeadStatus;
  priorityLevel: TnPriorityLevel | null;
  slaDeadline: string | null;
  slaViolated: boolean;
  assignedUserId: string | null;
  assignedUserName: string | null;
}

export interface TeamLeadsResponse {
  items: TeamLeadListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ─── TN-04: Reassign Lead ─────────────────────────────────────────────────────

export interface ReassignLeadRequest {
  newUserId: string;
  reason: string;
}

// ─── TN-05: Escalate Lead ─────────────────────────────────────────────────────

export interface EscalateLeadRequest {
  escalateTo: string;
  reason: string;
}

export interface EscalateTargetDto {
  userId: string;
  fullName: string;
  roleName: 'TN' | 'QL' | 'QT';
}

// ─── TN-06: Escalate History ─────────────────────────────────────────────────

export interface EscalateHistoryItemDto {
  logId: string;
  leadId: string;
  leadCode: string;
  customerName: string;
  customerPhone: string;
  escalateTo: string;
  escalateToName: string;
  reason: string;
  performedAt: string;
}

export interface EscalateHistoryResponse {
  items: EscalateHistoryItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface EscalateHistoryParams {
  page?: number;
  pageSize?: number;
}

// ─── TN-07: Internal Note ─────────────────────────────────────────────────────

export interface AddInternalNoteRequest {
  content: string;
}

// ─── TN-08: Member Performance ───────────────────────────────────────────────

export interface MemberPerformanceDto {
  userId: string;
  fullName: string;
  period: Period;
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

// ─── TN-09: Team Report ──────────────────────────────────────────────────────

export interface GetTeamReportParams {
  period?: Period;
  dateFrom?: string;
  dateTo?: string;
}

export interface TeamReportDto {
  period: Period;
  periodStart: string;
  periodEnd: string;
  totalLeads: number;
  byStatus: Partial<Record<TnLeadStatus, number>>;
  slaAchievedCount: number;
  slaViolatedCount: number;
  slaAchievedRate: number | null;
  wonCount: number;
  winRate: number | null;
  dailyTrend: TrendDayDto[];
  generatedAt: string;
}

// ─── TN-10: Team Members ─────────────────────────────────────────────────────

export interface TeamMemberDto {
  userId: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
  currentWorkload: number;
  lastAssignedAt: string | null;
}

// ─── TN-11: Add Member ───────────────────────────────────────────────────────

export interface AddMemberRequest {
  userId: string;
}

// ─── TN-11 helper: Search addable users ──────────────────────────────────────

export interface AddableUserDto {
  userId: string;
  fullName: string;
  username: string;
  roleName: string;
  hasTeam: boolean;
}

export interface SearchMembersParams {
  q?: string;
}

// ─── TN-12: Active Leads Warning (409) ──────────────────────────────────────

export interface ActiveLeadsWarningDto {
  errorCode: 'ACTIVE_LEADS_WARNING';
  errorMessage: string;
}
