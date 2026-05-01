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

  // QT-14: Thống kê hoạt động hệ thống theo kỳ
  getSystemStats: (params?: DashboardPeriodParams) =>
    api
      .get<SystemStatsDto>('/api/audit/system-stats', { params })
      .then((r) => r.data),
};
