import { api } from '@/lib/axios';
import type {
  TeamLeadOverviewDto,
  SlaViolationsParams,
  SlaViolationsResponse,
  GetTeamLeadsParams,
  TeamLeadsResponse,
  ReassignLeadRequest,
  EscalateLeadRequest,
  EscalateTargetDto,
  EscalateHistoryParams,
  EscalateHistoryResponse,
  AddInternalNoteRequest,
  MemberPerformanceDto,
  GetTeamReportParams,
  TeamReportDto,
  TeamMemberDto,
  AddMemberRequest,
  AddableUserDto,
  SearchMembersParams,
  Period,
} from '@/types/teamlead';

export const teamLeadService = {
  // TN-01: Tổng quan queue + trend 7 ngày
  getOverview: () =>
    api.get<TeamLeadOverviewDto>('/api/team-leads/overview').then((r) => r.data),

  // TN-02: Lead vi phạm / sắp vi phạm SLA
  getSlaViolations: (params?: SlaViolationsParams) =>
    api
      .get<SlaViolationsResponse>('/api/team-leads/sla-violations', { params })
      .then((r) => r.data),

  // TN-03: Danh sách + tìm kiếm lead trong đội
  getLeads: (params?: GetTeamLeadsParams) =>
    api.get<TeamLeadsResponse>('/api/team-leads', { params }).then((r) => r.data),

  // TN-04: Reassign lead sang SA khác trong đội
  reassignLead: (leadId: string, data: ReassignLeadRequest) =>
    api.patch(`/api/team-leads/${leadId}/reassign`, data),

  // TN-05: Escalate lead ra ngoài đội
  escalateLead: (leadId: string, data: EscalateLeadRequest) =>
    api.post(`/api/team-leads/${leadId}/escalate`, data),

  // TN-05 helper: Danh sách user có thể escalate tới
  getEscalateTargets: () =>
    api.get<EscalateTargetDto[]>('/api/team-leads/escalate-targets').then((r) => r.data),

  // TN-06: Lịch sử escalate của TN hiện tại
  getEscalateHistory: (params?: EscalateHistoryParams) =>
    api
      .get<EscalateHistoryResponse>('/api/team-leads/escalate-history', { params })
      .then((r) => r.data),

  // TN-07a: Thêm ghi chú nội bộ trên Lead
  addLeadNote: (leadId: string, data: AddInternalNoteRequest) =>
    api.post(`/api/team-leads/${leadId}/internal-notes`, data),

  // TN-07b: Thêm ghi chú nội bộ trên Ticket
  addTicketNote: (ticketId: string, data: AddInternalNoteRequest) =>
    api.post(`/api/my-team/tickets/${ticketId}/internal-notes`, data),

  // TN-08: Hiệu suất từng thành viên
  getMemberPerformance: (userId: string, period: Period = 'month') =>
    api
      .get<MemberPerformanceDto>(`/api/my-team/members/${userId}/performance`, {
        params: { period },
      })
      .then((r) => r.data),

  // TN-09: Báo cáo tổng hợp hiệu suất đội
  getTeamReport: (params?: GetTeamReportParams) =>
    api.get<TeamReportDto>('/api/team-leads/report', { params }).then((r) => r.data),

  // TN-10: Danh sách thành viên trong đội
  getTeamMembers: () =>
    api.get<TeamMemberDto[]>('/api/my-team/members').then((r) => r.data),

  // TN-11 helper: Tìm kiếm user có thể thêm vào đội
  searchMembers: (params?: SearchMembersParams) =>
    api.get<AddableUserDto[]>('/api/my-team/members/search', { params }).then((r) => r.data),

  // TN-11: Thêm thành viên vào đội
  addMember: (data: AddMemberRequest) => api.post('/api/my-team/members', data),

  // TN-12: Xóa thành viên khỏi đội
  removeMember: (userId: string) => api.delete(`/api/my-team/members/${userId}`),
};
