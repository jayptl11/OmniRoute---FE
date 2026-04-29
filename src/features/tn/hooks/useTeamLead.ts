import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamLeadService } from '../api/teamLeadService';
import type {
  SlaViolationsParams,
  GetTeamLeadsParams,
  ReassignLeadRequest,
  EscalateLeadRequest,
  AddInternalNoteRequest,
  EscalateHistoryParams,
  GetTeamReportParams,
  AddMemberRequest,
  Period,
} from '@/types/teamlead';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const tnKeys = {
  all: ['tn'] as const,
  overview: () => ['tn', 'overview'] as const,
  slaViolations: (params?: SlaViolationsParams) => ['tn', 'sla', params] as const,
  leads: (params?: GetTeamLeadsParams) => ['tn', 'leads', params] as const,
  escalateTargets: () => ['tn', 'escalate-targets'] as const,
  escalateHistory: (params?: EscalateHistoryParams) => ['tn', 'escalate-history', params] as const,
  memberPerf: (userId: string, period: Period) => ['tn', 'member-perf', userId, period] as const,
  report: (params?: GetTeamReportParams) => ['tn', 'report', params] as const,
  members: () => ['tn', 'members'] as const,
  membersSearch: (q?: string) => ['tn', 'members-search', q] as const,
};

// ─── TN-01: Overview ──────────────────────────────────────────────────────────

export function useTeamLeadOverview() {
  return useQuery({
    queryKey: tnKeys.overview(),
    queryFn: () => teamLeadService.getOverview(),
    refetchInterval: 60_000, // refresh mỗi 1 phút
  });
}

// ─── TN-02: SLA Violations ────────────────────────────────────────────────────

export function useSlaViolations(params?: SlaViolationsParams) {
  return useQuery({
    queryKey: tnKeys.slaViolations(params),
    queryFn: () => teamLeadService.getSlaViolations(params),
  });
}

// ─── TN-03: Team Leads List ───────────────────────────────────────────────────

export function useTeamLeads(params?: GetTeamLeadsParams) {
  return useQuery({
    queryKey: tnKeys.leads(params),
    queryFn: () => teamLeadService.getLeads(params),
  });
}

// ─── TN-04: Reassign Lead ─────────────────────────────────────────────────────

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

// ─── TN-05: Escalate Lead ─────────────────────────────────────────────────────

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

export function useEscalateTargets() {
  return useQuery({
    queryKey: tnKeys.escalateTargets(),
    queryFn: () => teamLeadService.getEscalateTargets(),
    staleTime: 5 * 60_000, // 5 phút — ít thay đổi
  });
}

// ─── TN-06: Escalate History ─────────────────────────────────────────────────

export function useEscalateHistory(params?: EscalateHistoryParams) {
  return useQuery({
    queryKey: tnKeys.escalateHistory(params),
    queryFn: () => teamLeadService.getEscalateHistory(params),
  });
}

// ─── TN-07a: Add Lead Note ────────────────────────────────────────────────────

export function useAddLeadNote() {
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: AddInternalNoteRequest }) =>
      teamLeadService.addLeadNote(leadId, data),
  });
}

// ─── TN-07b: Add Ticket Note ─────────────────────────────────────────────────

export function useAddTicketNote() {
  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: AddInternalNoteRequest }) =>
      teamLeadService.addTicketNote(ticketId, data),
  });
}

// ─── TN-08: Member Performance ───────────────────────────────────────────────

export function useMemberPerformance(userId: string, period: Period = 'month') {
  return useQuery({
    queryKey: tnKeys.memberPerf(userId, period),
    queryFn: () => teamLeadService.getMemberPerformance(userId, period),
    enabled: !!userId,
  });
}

// ─── TN-09: Team Report ──────────────────────────────────────────────────────

export function useTeamReport(params?: GetTeamReportParams) {
  return useQuery({
    queryKey: tnKeys.report(params),
    queryFn: () => teamLeadService.getTeamReport(params),
  });
}

// ─── TN-10: Team Members ─────────────────────────────────────────────────────

export function useTeamMembers() {
  return useQuery({
    queryKey: tnKeys.members(),
    queryFn: () => teamLeadService.getTeamMembers(),
  });
}

// ─── TN-11 helper: Search addable users ─────────────────────────────────────────

export function useSearchMembers(q: string) {
  return useQuery({
    queryKey: tnKeys.membersSearch(q),
    queryFn: () => teamLeadService.searchMembers({ q: q || undefined }),
    staleTime: 30_000,
  });
}

// ─── TN-11: Add Member ───────────────────────────────────────────────────────

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddMemberRequest) => teamLeadService.addMember(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tnKeys.members() });
    },
  });
}

// ─── TN-12: Remove Member ────────────────────────────────────────────────────

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => teamLeadService.removeMember(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tnKeys.members() });
    },
  });
}
