import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { slaConfigService } from '../api/slaConfigService';
import type { UpdateSlaConfigRequest } from '@/types/admin';

export const slaKeys = {
  all: ['sla-config'] as const,
  list: () => ['sla-config', 'list'] as const,
};

export function useSlaConfigs() {
  return useQuery({
    queryKey: slaKeys.list(),
    queryFn: slaConfigService.getSlaConfigs,
  });
}

export function useUpdateSlaConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSlaConfigRequest }) =>
      slaConfigService.updateSlaConfig(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: slaKeys.all });
    },
  });
}

export function useToggleSlaConfigStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      slaConfigService.toggleSlaConfigStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: slaKeys.all });
    },
  });
}
