import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { storeManagerService } from '../api/storeManagerService';
import type {
  GetStoreLeadsParams,
  GetStoreHistoryParams,
  GetStoreReportParams,
  ReassignStoreLeadRequest,
  AddStoreMemberRequest,
  AddStoreNoteRequest,
  SearchStoreMembersParams,
} from '@/types/storemanager';

// ── Query Keys ────────────────────────────────────────────────────────────────
export const qlKeys = {
  all: ['ql'] as const,
  members: () => [...qlKeys.all, 'members'] as const,
  membersSearch: (params?: SearchStoreMembersParams) =>
    [...qlKeys.all, 'members', 'search', params] as const,
  workload: () => [...qlKeys.all, 'workload'] as const,
  capacity: () => [...qlKeys.all, 'capacity'] as const,
  leads: (params?: GetStoreLeadsParams) => [...qlKeys.all, 'leads', params] as const,
  history: (params?: GetStoreHistoryParams) => [...qlKeys.all, 'history', params] as const,
  report: (params?: GetStoreReportParams) => [...qlKeys.all, 'report', params] as const,
};

// ── QL-06: Danh sách nhân sự ──────────────────────────────────────────────────
export function useStoreMembers() {
  return useQuery({
    queryKey: qlKeys.members(),
    queryFn: storeManagerService.getMembers,
    staleTime: 60_000,
  });
}

// ── QL-07 helper: Tìm kiếm user để thêm ──────────────────────────────────────
export function useSearchStoreMembers(params?: SearchStoreMembersParams) {
  return useQuery({
    queryKey: qlKeys.membersSearch(params),
    queryFn: () => storeManagerService.searchMembers(params),
    staleTime: 30_000,
  });
}

// ── QL-07: Thêm nhân sự ──────────────────────────────────────────────────────
export function useAddStoreMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddStoreMemberRequest) => storeManagerService.addMember(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qlKeys.members() });
    },
  });
}

// ── QL-08: Xóa nhân sự ───────────────────────────────────────────────────────
// Caller phải tự xử lý lỗi 409 ACTIVE_LEADS_WARNING
export function useRemoveStoreMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => storeManagerService.removeMember(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qlKeys.members() });
    },
  });
}

// ── QL-02: Workload nhân sự ───────────────────────────────────────────────────
export function useStoreWorkload() {
  return useQuery({
    queryKey: qlKeys.workload(),
    queryFn: storeManagerService.getWorkload,
    staleTime: 60_000,
  });
}

// ── QL-09: Năng lực đơn vị ────────────────────────────────────────────────────
export function useStoreCapacity() {
  return useQuery({
    queryKey: qlKeys.capacity(),
    queryFn: storeManagerService.getCapacity,
    staleTime: 60_000,
    retry: false, // không retry NO_STORE / STORE_NOT_FOUND
  });
}

// ── QL-01: Danh sách lead ────────────────────────────────────────────────────
export function useStoreLeads(params?: GetStoreLeadsParams) {
  return useQuery({
    queryKey: qlKeys.leads(params),
    queryFn: () => storeManagerService.getLeads(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

// ── QL-03: Reassign lead ─────────────────────────────────────────────────────
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

// ── QL-05: Lịch sử xử lý ────────────────────────────────────────────────────
export function useStoreLeadHistory(params?: GetStoreHistoryParams) {
  return useQuery({
    queryKey: qlKeys.history(params),
    queryFn: () => storeManagerService.getLeadHistory(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

// ── QL-04: Báo cáo đơn vị ────────────────────────────────────────────────────
export function useStoreReport(params?: GetStoreReportParams) {
  return useQuery({
    queryKey: qlKeys.report(params),
    queryFn: () => storeManagerService.getReport(params),
    staleTime: 120_000,
  });
}

// ── API 11: Ghi chú nội bộ ───────────────────────────────────────────────────
export function useAddStoreNote() {
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: AddStoreNoteRequest }) =>
      storeManagerService.addInternalNote(leadId, data),
  });
}
