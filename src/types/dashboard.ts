// ── Phase 9: Dashboard & Audit Types ─────────────────────────────────────────

// Shared
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type Period = 'week' | 'month' | 'quarter';

// ── QT — Audit & System Stats ─────────────────────────────────────────────────

export interface AuditLogDto {
  id: string;
  entityType: string; // 'LEAD' | 'TICKET' | 'USER' | 'RULE' | 'SYSTEM'
  entityId: string;
  action: string; // 'STATUS_CHANGED' | 'ASSIGNED' | 'ESCALATED' | 'CREATED' | ...
  oldValue: string | null; // JSON string
  newValue: string | null; // JSON string
  note: string | null;
  performedBy: string | null; // uuid, null = system
  performedByName: string | null;
  isInternal: boolean;
  performedAt: string; // ISO 8601 UTC
}

export interface DailyLeadStatsDto {
  date: string; // 'YYYY-MM-DD'
  totalLeads: number;
  autoRouted: number;
  defaultGroupHits: number;
}

export interface SystemStatsDto {
  period: string;
  periodStart: string;
  periodEnd: string;
  totalLeadsProcessed: number;
  autoRoutingSuccessRate: number; // 0–100 (%)
  defaultGroupHits: number;
  totalErrors: number;
  dailyTrend: DailyLeadStatsDto[];
  leadsByGroup: Record<string, number>; // { "Sale": 1800, "Cskh": 900, "StoreSupport": 228 }
  generatedAt: string;
}

// ── BQL — Dashboard Overview (BQL-01) ─────────────────────────────────────────

export interface KpiCardsDto {
  totalLeadsToday: number;
  totalLeadsThisWeek: number;
  totalLeadsThisMonth: number;
  slaAchievedRate: number | null; // 0–100 (%), null nếu không có data
  winRate: number | null;         // 0–100 (%), null nếu không có data
  slaViolatedCount: number;
}

export interface DailyTrendItemDto {
  date: string; // 'YYYY-MM-DD'
  totalLeads: number;
}

export interface TopStoreItemDto {
  storeId: string;
  storeName: string;
  leadCount: number;
}

export interface DashboardOverviewDto {
  period: string;
  periodStart: string;
  periodEnd: string;
  kpiCards: KpiCardsDto;
  leadsByChannel: Record<string, number>;
  leadsByNeedType: Record<string, number>;
  dailyTrend: DailyTrendItemDto[];
  top5Stores: TopStoreItemDto[];
  generatedAt: string;
}

// ── BQL — Drill-down (BQL-02) ─────────────────────────────────────────────────

export interface DrillDownChildDto {
  label: string;
  count: number;
}

export interface DrillDownDto {
  level: string; // 'unit' | 'channel'
  entityId: string | null;
  entityName: string | null;
  periodStart: string;
  periodEnd: string;
  totalLeads: number;
  byStatus: Record<string, number>;
  children: DrillDownChildDto[];
}

export type DrillDownLevel = 'unit' | 'channel';

export interface GetDrillDownParams {
  level: DrillDownLevel;
  id?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ── BQL — Routing KPI (BQL-03) ────────────────────────────────────────────────

export interface RoutingKpiComparisonDto {
  prevRuleMatchRate: number | null;
  prevAvgTimeToAssignMinutes: number | null;
  prevSlaAchievedRate: number | null;
  prevEscalationRate: number | null;
  prevPeriodStart: string;
  prevPeriodEnd: string;
}

export interface StoreSlaItemDto {
  storeId: string;
  storeName: string;
  slaAchievedRate: number; // 0–100 (%)
  totalLeads: number;
}

export interface RoutingKpiDto {
  period: string;
  periodStart: string;
  periodEnd: string;
  ruleMatchRate: number;
  avgTimeToAssignMinutes: number | null;
  slaAchievedRate: number | null;
  escalationRate: number | null;
  comparison: RoutingKpiComparisonDto | null;
  slaByStore: StoreSlaItemDto[];
  generatedAt: string;
}

// ── BQL — Unit Comparison (BQL-04) ───────────────────────────────────────────

export interface UnitComparisonItemDto {
  storeId: string;
  storeName: string;
  region: string | null;
  leadCount: number;
  winRate: number | null;              // 0–100 (%), null nếu không có Sale lead
  slaAchievedRate: number | null;     // 0–100 (%)
  avgProcessingTimeHours: number | null;
}

export interface UnitComparisonDto {
  period: string;
  periodStart: string;
  periodEnd: string;
  items: UnitComparisonItemDto[];
  generatedAt: string;
}

export type UnitComparisonSortBy = 'leadCount' | 'winRate' | 'slaAchievedRate' | 'avgProcessingTime';

// ── BQL — Sales Report (BQL-05) ──────────────────────────────────────────────

export interface DailySalesTrendItemDto {
  date: string; // 'YYYY-MM-DD'
  totalLeads: number;
  wonCount: number;
}

export interface SalesReportDto {
  period: string;
  periodStart: string;
  periodEnd: string;
  totalLeads: number;
  contactedCount: number;
  wonCount: number;
  contactRate: number | null;
  winRate: number | null;
  wonByChannel: Record<string, number>;
  wonByNeedType: Record<string, number>;
  dailyTrend: DailySalesTrendItemDto[];
  generatedAt: string;
}

// ── BQL — Export (BQL-06) ────────────────────────────────────────────────────

export type ExportReportType = 'overview' | 'unitComparison' | 'sales';

export interface ExportParams {
  reportType: ExportReportType;
  period?: Period;
  dateFrom?: string;
  dateTo?: string;
}

// ── Shared Query Params ───────────────────────────────────────────────────────

export interface DashboardPeriodParams {
  period?: Period;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetAuditLogsParams {
  entityType?: string;
  action?: string;
  performedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}
