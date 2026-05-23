import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamLeadService } from '../api/teamLeadService';
import type {
  AddInternalNoteRequest,
  AddMemberRequest,
  EscalateHistoryParams,
  EscalateLeadRequest,
  GetTeamLeadsParams,
  GetTeamReportParams,
  Period,
  ReassignLeadRequest,
  SlaViolationsParams,
} from '@/types/teamlead';

export const tnKeys = {
  all: ['tn'] as const,
  overview: () => ['tn', 'overview'] as const,
  slaViolations: (params?: SlaViolationsParams) => ['tn', 'sla', params] as const,
  leads: (params?: GetTeamLeadsParams) => ['tn', 'leads', params] as const,
  reassignTargets: (leadId: string, q?: string) => ['tn', 'reassign-targets', leadId, q] as const,
  escalateTargets: (q?: string) => ['tn', 'escalate-targets', q] as const,
  escalateHistory: (params?: EscalateHistoryParams) => ['tn', 'escalate-history', params] as const,
  memberPerf: (userId: string, period: Period) => ['tn', 'member-perf', userId, period] as const,
  report: (params?: GetTeamReportParams) => ['tn', 'report', params] as const,
  members: () => ['tn', 'members'] as const,
  membersSearch: (q?: string) => ['tn', 'members-search', q] as const,
};

export function useTeamLeadOverview() {
  return useQuery({
    queryKey: tnKeys.overview(),
    queryFn: () => teamLeadService.getOverview(),
    refetchInterval: 60_000,
  });
}

export function useSlaViolations(params?: SlaViolationsParams) {
  return useQuery({
    queryKey: tnKeys.slaViolations(params),
    queryFn: () => teamLeadService.getSlaViolations(params),
  });
}

export function useTeamLeads(params?: GetTeamLeadsParams) {
  return useQuery({
    queryKey: tnKeys.leads(params),
    queryFn: () => teamLeadService.getLeads(params),
  });
}

export function useReassignLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: ReassignLeadRequest }) =>
      teamLeadService.reassignLead(leadId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tnKeys.leads() });
      qc.invalidateQueries({ queryKey: tnKeys.slaViolations() });
      qc.invalidateQueries({ queryKey: tnKeys.overview() });
    },
  });
}

export function useSearchReassignTargets(leadId: string, q?: string, enabled = true) {
  return useQuery({
    queryKey: tnKeys.reassignTargets(leadId, q),
    queryFn: () => teamLeadService.getReassignTargets(leadId, { q: q || undefined }),
    enabled: enabled && !!leadId,
    staleTime: 30_000,
  });
}

export function useEscalateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: EscalateLeadRequest }) =>
      teamLeadService.escalateLead(leadId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tnKeys.escalateHistory() });
    },
  });
}

export function useEscalateTargets(q?: string, enabled = true) {
  return useQuery({
    queryKey: tnKeys.escalateTargets(q),
    queryFn: () => teamLeadService.getEscalateTargets({ q: q || undefined }),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useEscalateHistory(params?: EscalateHistoryParams) {
  return useQuery({
    queryKey: tnKeys.escalateHistory(params),
    queryFn: () => teamLeadService.getEscalateHistory(params),
  });
}

export function useAddLeadNote() {
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: AddInternalNoteRequest }) =>
      teamLeadService.addLeadNote(leadId, data),
  });
}

export function useAddTicketNote() {
  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: AddInternalNoteRequest }) =>
      teamLeadService.addTicketNote(ticketId, data),
  });
}

export function useMemberPerformance(userId: string, period: Period = 'month') {
  return useQuery({
    queryKey: tnKeys.memberPerf(userId, period),
    queryFn: () => teamLeadService.getMemberPerformance(userId, period),
    enabled: !!userId,
  });
}

export function useTeamReport(params?: GetTeamReportParams) {
  return useQuery({
    queryKey: tnKeys.report(params),
    queryFn: () => teamLeadService.getTeamReport(params),
  });
}

export function useTeamMembers() {
  return useQuery({
    queryKey: tnKeys.members(),
    queryFn: () => teamLeadService.getTeamMembers(),
  });
}

export function useSearchMembers(q: string, enabled = true) {
  return useQuery({
    queryKey: tnKeys.membersSearch(q),
    queryFn: () => teamLeadService.searchMembers({ q: q || undefined }),
    enabled,
    staleTime: 30_000,
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddMemberRequest) => teamLeadService.addMember(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tnKeys.members() });
    },
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => teamLeadService.removeMember(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tnKeys.members() });
    },
  });
}
