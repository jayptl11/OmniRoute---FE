import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { masterDataService } from '../api/masterDataService';
import type {
  CreateMasterDataRequest,
  GetMasterDataParams,
  UpdateMasterDataRequest,
} from '@/types/admin';

export const masterDataKeys = {
  all: ['master-data'] as const,
  list: (params?: GetMasterDataParams) => ['master-data', 'list', params] as const,
  enums: (enumType: string) => ['master-data', 'enums', enumType] as const,
};

export function useMasterData(params?: GetMasterDataParams) {
  return useQuery({
    queryKey: masterDataKeys.list(params),
    queryFn: () => masterDataService.getMasterData(params),
  });
}

export function useEnums(enumType: 'Channel' | 'NeedType' | 'LeadStatus') {
  return useQuery({
    queryKey: masterDataKeys.enums(enumType),
    queryFn: () => masterDataService.getEnums(enumType),
    staleTime: Infinity, // enums rarely change
  });
}

export function useCreateMasterData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMasterDataRequest) =>
      masterDataService.createMasterData(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: masterDataKeys.all });
    },
  });
}

export function useUpdateMasterData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMasterDataRequest }) =>
      masterDataService.updateMasterData(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: masterDataKeys.all });
    },
  });
}

export function useToggleMasterDataStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      masterDataService.toggleMasterDataStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: masterDataKeys.all });
    },
  });
}
