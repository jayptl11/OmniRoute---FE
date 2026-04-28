import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dispatchService } from '../api/dispatchService';
import type { DispatchQueueParams, AssignLeadRequest } from '@/types/dispatch';

export const dispatchKeys = {
  all: ['dispatch'] as const,
  queue: (params?: DispatchQueueParams) => ['dispatch', 'queue', params] as const,
  queueItem: (id: string) => ['dispatch', 'queue', id] as const,
  storesCapacity: () => ['dispatch', 'stores', 'capacity'] as const,
  history: () => ['dispatch', 'history'] as const,
};

export function useDispatchQueue(params?: DispatchQueueParams) {
  return useQuery({
    queryKey: dispatchKeys.queue(params),
    queryFn: () => dispatchService.getQueue(params),
  });
}

export function useDispatchLeadDetail(id: string) {
  return useQuery({
    queryKey: dispatchKeys.queueItem(id),
    queryFn: () => dispatchService.getQueueItem(id),
    enabled: !!id,
  });
}

export function useStoresCapacity() {
  return useQuery({
    queryKey: dispatchKeys.storesCapacity(),
    queryFn: () => dispatchService.getStoresCapacity(),
    staleTime: 30_000, // 30s — store load changes in near-realtime
  });
}

export function useAssignLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignLeadRequest }) =>
      dispatchService.assignLead(id, data),
    onSuccess: () => {
      // Remove lead from queue & refresh history
      qc.invalidateQueries({ queryKey: dispatchKeys.all });
    },
  });
}

export function useDispatchHistory() {
  return useQuery({
    queryKey: dispatchKeys.history(),
    queryFn: () => dispatchService.getHistory(),
  });
}
