import { useQuery, useMutation } from '@tanstack/react-query';
import { dashboardService } from '../api/dashboardService';
import type {
  Period,
  DrillDownLevel,
  UnitComparisonSortBy,
  ExportReportType,
} from '@/types/dashboard';

const STALE = 3 * 60 * 1000; // 3 phút

// ── BQL-01: Dashboard tổng hợp ───────────────────────────────────────────────

export function useDashboardOverview(
  period?: Period,
  dateFrom?: string,
  dateTo?: string,
) {
  return useQuery({
    queryKey: ['dashboard', 'overview', period, dateFrom, dateTo],
    queryFn: () => dashboardService.getOverview({ period, dateFrom, dateTo }),
    staleTime: STALE,
  });
}

// ── BQL-02: Drill-down ────────────────────────────────────────────────────────

export function useDrillDown(
  level: DrillDownLevel,
  id?: string,
  dateFrom?: string,
  dateTo?: string,
) {
  return useQuery({
    queryKey: ['dashboard', 'drill-down', level, id, dateFrom, dateTo],
    queryFn: () => dashboardService.getDrillDown({ level, id, dateFrom, dateTo }),
    staleTime: STALE,
  });
}

// ── BQL-03: KPI phân luồng ────────────────────────────────────────────────────

export function useRoutingKpi(
  period?: Period,
  dateFrom?: string,
  dateTo?: string,
) {
  return useQuery({
    queryKey: ['dashboard', 'routing-kpi', period, dateFrom, dateTo],
    queryFn: () => dashboardService.getRoutingKpi({ period, dateFrom, dateTo }),
    staleTime: STALE,
  });
}

// ── BQL-04: So sánh đơn vị ───────────────────────────────────────────────────

export function useUnitComparison(
  period?: Period,
  sortBy?: UnitComparisonSortBy,
  dateFrom?: string,
  dateTo?: string,
) {
  return useQuery({
    queryKey: ['dashboard', 'unit-comparison', period, sortBy, dateFrom, dateTo],
    queryFn: () => dashboardService.getUnitComparison({ period, sortBy, dateFrom, dateTo }),
    staleTime: STALE,
  });
}

// ── BQL-05: Báo cáo bán hàng ─────────────────────────────────────────────────

export function useSalesReport(
  period?: Period,
  dateFrom?: string,
  dateTo?: string,
) {
  return useQuery({
    queryKey: ['dashboard', 'sales-report', period, dateFrom, dateTo],
    queryFn: () => dashboardService.getSalesReport({ period, dateFrom, dateTo }),
    staleTime: STALE,
  });
}

// ── BQL-06: Xuất Excel / PDF ────────────────────────────────────────────────────────────

export function useExportReport() {
  return useMutation({
    mutationFn: ({
      reportType,
      period,
      dateFrom,
      dateTo,
      format,
    }: {
      reportType: ExportReportType;
      period?: Period;
      dateFrom?: string;
      dateTo?: string;
      format?: 'excel' | 'pdf';
    }) => dashboardService.exportReport({ reportType, period, dateFrom, dateTo, format }),
  });
}
