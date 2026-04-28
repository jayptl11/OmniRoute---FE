import { api } from '@/lib/axios';
import type {
  SlaConfigDto,
  UpdateSlaConfigRequest,
  ToggleStatusRequest,
} from '@/types/admin';

export const slaConfigService = {
  getSlaConfigs: () =>
    api.get<SlaConfigDto[]>('/api/sla-config').then((r) => r.data),

  updateSlaConfig: (id: string, data: UpdateSlaConfigRequest) =>
    api.put<void>(`/api/sla-config/${id}`, data),

  toggleSlaConfigStatus: (id: string, isActive: boolean) =>
    api.patch<void>(`/api/sla-config/${id}/status`, {
      isActive,
    } satisfies ToggleStatusRequest),
};
