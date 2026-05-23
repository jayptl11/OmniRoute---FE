import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dispatchService } from '../api/dispatchService';
import type { AssignLeadRequest, DispatchQueueParams } from '@/types/dispatch';

export const dispatchKeys = {
  all: ['dispatch'] as const,
  queue: (params?: DispatchQueueParams) => ['dispatch', 'queue', params] as const,
  queueItem: (id: string) => ['dispatch', 'queue', id] as const,
  storesCapacity: (q?: string) => ['dispatch', 'stores', 'capacity', q] as const,
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

export function useStoresCapacity(q?: string) {
  return useQuery({
    queryKey: dispatchKeys.storesCapacity(q),
    queryFn: () => dispatchService.getStoresCapacity({ q: q || undefined }),
    staleTime: 30_000,
  });
}

export function useAssignLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignLeadRequest }) =>
      dispatchService.assignLead(id, data),
    onSuccess: () => {
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
