import { CHANNEL_LABELS, type ChannelValue } from '@/lib/roleChannel';

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
  New: 'Moi',
  PendingResponse: 'Cho phan hoi',
  InProgress: 'Dang xu ly',
  Escalated: 'Da escalate',
  Won: 'Thanh cong',
  Lost: 'That bai',
  Invalid: 'Khong hop le',
  Closed: 'Da dong',
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
  Medium: 'Trung binh',
  Low: 'Thap',
};

export const TN_PRIORITY_COLORS: Record<TnPriorityLevel, string> = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

export type TnChannel = ChannelValue;

export const TN_CHANNEL_LABELS: Record<TnChannel, string> = CHANNEL_LABELS;

export type Period = 'today' | 'week' | 'month' | 'quarter';

export const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hom nay',
  week: '7 ngay',
  month: '30 ngay',
  quarter: '90 ngay',
};

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
  channel?: TnChannel | null;
  channelDisplayName?: string | null;
}

export interface TeamLeadsResponse {
  items: TeamLeadListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ReassignLeadRequest {
  newUserId: string;
  reason: string;
}

export interface TeamLeadReassignTargetDto {
  userId: string;
  fullName: string;
  roleName: string;
  roleDisplayName?: string | null;
}

export interface EscalateLeadRequest {
  escalateTo: string;
  reason: string;
}

export interface EscalateTargetDto {
  userId: string;
  fullName: string;
  roleName: 'TN' | 'QL' | 'QT';
  roleDisplayName?: string | null;
}

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

export interface AddInternalNoteRequest {
  content: string;
}

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

export interface TeamMemberDto {
  userId: string;
  fullName: string;
  roleName: string;
  roleDisplayName?: string | null;
  isActive: boolean;
  currentWorkload: number;
  lastAssignedAt: string | null;
}

export interface AddMemberRequest {
  userId: string;
}

export interface AddableUserDto {
  userId: string;
  fullName: string;
  username: string;
  roleName: string;
  roleDisplayName?: string | null;
  hasTeam: boolean;
}

export interface SearchMembersParams {
  q?: string;
}

export interface SearchTeamLeadReassignTargetsParams {
  q?: string;
}

export interface SearchEscalateTargetsParams {
  q?: string;
}

export interface ActiveLeadsWarningDto {
  errorCode: 'ACTIVE_LEADS_WARNING';
  errorMessage: string;
}
