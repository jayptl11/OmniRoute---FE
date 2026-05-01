import { api } from '@/lib/axios';
import type {
  DashboardOverviewDto,
  DashboardPeriodParams,
  DrillDownDto,
  GetDrillDownParams,
  RoutingKpiDto,
  UnitComparisonDto,
  UnitComparisonSortBy,
  SalesReportDto,
  ExportParams,
} from '@/types/dashboard';

export const dashboardService = {
  // BQL-01: Dashboard tổng hợp
  getOverview: (params?: DashboardPeriodParams) =>
    api.get<DashboardOverviewDto>('/api/dashboard/overview', { params }).then((r) => r.data),

  // BQL-02: Drill-down theo unit/channel
  getDrillDown: (params: GetDrillDownParams) =>
    api.get<DrillDownDto>('/api/dashboard/drill-down', { params }).then((r) => r.data),

  // BQL-03: KPI phân luồng
  getRoutingKpi: (params?: DashboardPeriodParams) =>
    api.get<RoutingKpiDto>('/api/dashboard/routing-kpi', { params }).then((r) => r.data),

  // BQL-04: So sánh hiệu suất đơn vị
  getUnitComparison: (params?: DashboardPeriodParams & { sortBy?: UnitComparisonSortBy }) =>
    api.get<UnitComparisonDto>('/api/dashboard/unit-comparison', { params }).then((r) => r.data),

  // BQL-05: Báo cáo bán hàng
  getSalesReport: (params?: DashboardPeriodParams) =>
    api.get<SalesReportDto>('/api/dashboard/sales-report', { params }).then((r) => r.data),

  // BQL-06: Xuất báo cáo Excel
  exportReport: async (params: ExportParams): Promise<void> => {
    const res = await api.get('/api/dashboard/export', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([res.data as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Try to get filename from Content-Disposition header
    const cd = (res.headers as Record<string, string>)['content-disposition'] ?? '';
    const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    a.download = match?.[1]?.replace(/['"]/g, '') ?? `report_${params.reportType}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
