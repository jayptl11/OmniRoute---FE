import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { storeService } from '../api/storeService';
import type { CreateStoreRequest, GetStoresParams, UpdateStoreRequest } from '@/types/admin';

export const storeKeys = {
  all: ['stores'] as const,
  list: (params?: GetStoresParams) => ['stores', 'list', params] as const,
  detail: (id: string) => ['stores', 'detail', id] as const,
  managers: (q?: string) => ['stores', 'managers', q] as const,
};

export function useStores(params?: GetStoresParams) {
  return useQuery({
    queryKey: storeKeys.list(params),
    queryFn: () => storeService.getStores(params),
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: storeKeys.detail(id),
    queryFn: () => storeService.getStore(id),
    enabled: !!id,
  });
}

export function useSearchStoreManagers(q?: string, enabled = true) {
  return useQuery({
    queryKey: storeKeys.managers(q),
    queryFn: () => storeService.searchManagers(q),
    enabled,
    staleTime: 30_000,
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStoreRequest) => storeService.createStore(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreRequest }) =>
      storeService.updateStore(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
}

export function useToggleStoreStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      storeService.toggleStoreStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
}
