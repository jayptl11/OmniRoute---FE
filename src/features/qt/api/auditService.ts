import { api } from '@/lib/axios';
import type {
  AuditLogDto,
  SystemStatsDto,
  PagedResult,
  GetAuditLogsParams,
  DashboardPeriodParams,
} from '@/types/dashboard';

export const auditService = {
  // QT-13: Xem log hệ thống (phân trang + filter)
  getLogs: (params?: GetAuditLogsParams) =>
    api
      .get<PagedResult<AuditLogDto>>('/api/audit/logs', { params })
      .then((r) => r.data),

  // QT-13 Export: Xuất toàn bộ audit log ra Excel (không phân trang)
  exportAuditLogs: async (params?: Omit<GetAuditLogsParams, 'page' | 'pageSize'>): Promise<void> => {
    const res = await api.get('/api/audit/logs/export', {
      params,
      responseType: 'blob',
    });
    const blob = new Blob([res.data as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cd = (res.headers as Record<string, string>)['content-disposition'] ?? '';
    const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    a.download = match?.[1]?.replace(/['"]/g, '') ?? 'AuditLog.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // QT-14: Thống kê hoạt động hệ thống theo kỳ
  getSystemStats: (params?: DashboardPeriodParams) =>
    api
      .get<SystemStatsDto>('/api/audit/system-stats', { params })
      .then((r) => r.data),
};
