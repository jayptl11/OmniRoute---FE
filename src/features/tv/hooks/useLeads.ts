import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadService } from '../api/leadService';
import type {
  CreateLeadRequest,
  GetLeadsParams,
  UpdateLeadRequest,
} from '@/types/leads';

export const leadKeys = {
  all: ['leads'] as const,
  list: (params?: GetLeadsParams) => ['leads', 'list', params] as const,
  detail: (id: string) => ['leads', 'detail', id] as const,
  duplicate: (phone: string) => ['leads', 'duplicate', phone] as const,
};

export function useLeads(params?: GetLeadsParams) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => leadService.getLeads(params),
  });
}

export function useLeadDetail(id: string, pollWhileNew = false) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadService.getLeadById(id),
    enabled: !!id,
    // Poll every 3s when status is still New (engine not done yet)
    refetchInterval: (query) => {
      if (!pollWhileNew) return false;
      const data = query.state.data;
      return data?.leadStatus === 'New' ? 3000 : false;
    },
  });
}

export function useCheckDuplicate(phone: string) {
  return useQuery({
    queryKey: leadKeys.duplicate(phone),
    queryFn: () => leadService.checkDuplicate(phone),
    enabled: /^0\d{9}$/.test(phone),
    staleTime: 0,
    retry: false,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeadRequest) => leadService.createLead(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
      leadService.updateLead(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: leadKeys.detail(id) });
      qc.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}
