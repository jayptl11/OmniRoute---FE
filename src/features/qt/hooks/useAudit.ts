import { useQuery, useMutation } from '@tanstack/react-query';
import { auditService } from '../api/auditService';
import type { GetAuditLogsParams, Period } from '@/types/dashboard';

// ── QT-13: Audit Logs ─────────────────────────────────────────────────────────

export function useAuditLogs(params?: GetAuditLogsParams) {
  return useQuery({
    queryKey: ['audit', 'logs', params],
    queryFn: () => auditService.getLogs(params),
    staleTime: 60 * 1000, // 1 phút — log thay đổi thường xuyên hơn
  });
}

// ── QT-14: System Stats ───────────────────────────────────────────────────────

// ── QT-13 Export ────────────────────────────────────────────────────────────

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (params?: Omit<GetAuditLogsParams, 'page' | 'pageSize'>) =>
      auditService.exportAuditLogs(params),
  });
}

// ── QT-14: System Stats ───────────────────────────────────────────────────────

export function useSystemStats(
  period?: Period,
  dateFrom?: string,
  dateTo?: string,
) {
  return useQuery({
    queryKey: ['audit', 'system-stats', period, dateFrom, dateTo],
    queryFn: () => auditService.getSystemStats({ period, dateFrom, dateTo }),
    staleTime: 3 * 60 * 1000, // 3 phút
  });
}
