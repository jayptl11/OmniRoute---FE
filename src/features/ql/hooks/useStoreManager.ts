import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { storeManagerService } from '../api/storeManagerService';
import type {
  AddStoreMemberRequest,
  AddStoreNoteRequest,
  GetStoreHistoryParams,
  GetStoreLeadsParams,
  GetStoreReportParams,
  ReassignStoreLeadRequest,
  SearchStoreMembersParams,
} from '@/types/storemanager';

export const qlKeys = {
  all: ['ql'] as const,
  members: () => [...qlKeys.all, 'members'] as const,
  membersSearch: (params?: SearchStoreMembersParams) =>
    [...qlKeys.all, 'members', 'search', params] as const,
  workload: () => [...qlKeys.all, 'workload'] as const,
  capacity: () => [...qlKeys.all, 'capacity'] as const,
  leads: (params?: GetStoreLeadsParams) => [...qlKeys.all, 'leads', params] as const,
  reassignTargets: (leadId: string, q?: string) =>
    [...qlKeys.all, 'reassign-targets', leadId, q] as const,
  history: (params?: GetStoreHistoryParams) => [...qlKeys.all, 'history', params] as const,
  historyActors: (q?: string) => [...qlKeys.all, 'history-actors', q] as const,
  report: (params?: GetStoreReportParams) => [...qlKeys.all, 'report', params] as const,
};

export function useStoreMembers() {
  return useQuery({
    queryKey: qlKeys.members(),
    queryFn: storeManagerService.getMembers,
    staleTime: 60_000,
  });
}

export function useSearchStoreMembers(params?: SearchStoreMembersParams, enabled = true) {
  return useQuery({
    queryKey: qlKeys.membersSearch(params),
    queryFn: () => storeManagerService.searchMembers(params),
    enabled,
    staleTime: 30_000,
  });
}

export function useAddStoreMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddStoreMemberRequest) => storeManagerService.addMember(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qlKeys.members() });
    },
  });
}

export function useRemoveStoreMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => storeManagerService.removeMember(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qlKeys.members() });
    },
  });
}

export function useStoreWorkload() {
  return useQuery({
    queryKey: qlKeys.workload(),
    queryFn: storeManagerService.getWorkload,
    staleTime: 60_000,
  });
}

export function useStoreCapacity() {
  return useQuery({
    queryKey: qlKeys.capacity(),
    queryFn: storeManagerService.getCapacity,
    staleTime: 60_000,
    retry: false,
  });
}

export function useStoreLeads(params?: GetStoreLeadsParams) {
  return useQuery({
    queryKey: qlKeys.leads(params),
    queryFn: () => storeManagerService.getLeads(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useReassignStoreLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: ReassignStoreLeadRequest }) =>
      storeManagerService.reassignLead(leadId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qlKeys.leads() });
    },
  });
}

export function useSearchStoreLeadReassignTargets(leadId: string, q?: string, enabled = true) {
  return useQuery({
    queryKey: qlKeys.reassignTargets(leadId, q),
    queryFn: () => storeManagerService.getReassignTargets(leadId, { q: q || undefined }),
    enabled: enabled && !!leadId,
    staleTime: 30_000,
  });
}

export function useStoreLeadHistory(params?: GetStoreHistoryParams) {
  return useQuery({
    queryKey: qlKeys.history(params),
    queryFn: () => storeManagerService.getLeadHistory(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useSearchStoreLeadHistoryActors(q?: string, enabled = true) {
  return useQuery({
    queryKey: qlKeys.historyActors(q),
    queryFn: () => storeManagerService.searchHistoryActors({ q: q || undefined }),
    enabled,
    staleTime: 30_000,
  });
}

export function useStoreReport(params?: GetStoreReportParams) {
  return useQuery({
    queryKey: qlKeys.report(params),
    queryFn: () => storeManagerService.getReport(params),
    staleTime: 120_000,
  });
}

export function useAddStoreNote() {
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: AddStoreNoteRequest }) =>
      storeManagerService.addInternalNote(leadId, data),
  });
}
