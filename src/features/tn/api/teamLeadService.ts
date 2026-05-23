import { api } from '@/lib/axios';
import type {
  AddableUserDto,
  AddInternalNoteRequest,
  AddMemberRequest,
  EscalateHistoryParams,
  EscalateHistoryResponse,
  EscalateLeadRequest,
  EscalateTargetDto,
  GetTeamLeadsParams,
  GetTeamReportParams,
  MemberPerformanceDto,
  Period,
  ReassignLeadRequest,
  SearchEscalateTargetsParams,
  SearchMembersParams,
  SearchTeamLeadReassignTargetsParams,
  SlaViolationsParams,
  SlaViolationsResponse,
  TeamLeadOverviewDto,
  TeamLeadReassignTargetDto,
  TeamLeadsResponse,
  TeamMemberDto,
  TeamReportDto,
} from '@/types/teamlead';

export const teamLeadService = {
  getOverview: () =>
    api.get<TeamLeadOverviewDto>('/api/team-leads/overview').then((r) => r.data),

  getSlaViolations: (params?: SlaViolationsParams) =>
    api
      .get<SlaViolationsResponse>('/api/team-leads/sla-violations', { params })
      .then((r) => r.data),

  getLeads: (params?: GetTeamLeadsParams) =>
    api.get<TeamLeadsResponse>('/api/team-leads', { params }).then((r) => r.data),

  reassignLead: (leadId: string, data: ReassignLeadRequest) =>
    api.patch(`/api/team-leads/${leadId}/reassign`, data),

  getReassignTargets: (leadId: string, params?: SearchTeamLeadReassignTargetsParams) =>
    api
      .get<TeamLeadReassignTargetDto[]>(`/api/team-leads/${leadId}/reassign-targets`, { params })
      .then((r) => r.data),

  escalateLead: (leadId: string, data: EscalateLeadRequest) =>
    api.post(`/api/team-leads/${leadId}/escalate`, data),

  getEscalateTargets: (params?: SearchEscalateTargetsParams) =>
    api.get<EscalateTargetDto[]>('/api/team-leads/escalate-targets', { params }).then((r) => r.data),

  getEscalateHistory: (params?: EscalateHistoryParams) =>
    api
      .get<EscalateHistoryResponse>('/api/team-leads/escalate-history', { params })
      .then((r) => r.data),

  addLeadNote: (leadId: string, data: AddInternalNoteRequest) =>
    api.post(`/api/team-leads/${leadId}/internal-notes`, data),

  addTicketNote: (ticketId: string, data: AddInternalNoteRequest) =>
    api.post(`/api/my-team/tickets/${ticketId}/internal-notes`, data),

  getMemberPerformance: (userId: string, period: Period = 'month') =>
    api
      .get<MemberPerformanceDto>(`/api/my-team/members/${userId}/performance`, {
        params: { period },
      })
      .then((r) => r.data),

  getTeamReport: (params?: GetTeamReportParams) =>
    api.get<TeamReportDto>('/api/team-leads/report', { params }).then((r) => r.data),

  getTeamMembers: () =>
    api.get<TeamMemberDto[]>('/api/my-team/members').then((r) => r.data),

  searchMembers: (params?: SearchMembersParams) =>
    api.get<AddableUserDto[]>('/api/my-team/members/search', { params }).then((r) => r.data),

  addMember: (data: AddMemberRequest) => api.post('/api/my-team/members', data),

  removeMember: (userId: string) => api.delete(`/api/my-team/members/${userId}`),
};
