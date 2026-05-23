import { api } from '@/lib/axios';
import type {
  AddableStoreUserDto,
  AddStoreMemberRequest,
  AddStoreNoteRequest,
  GetStoreHistoryParams,
  GetStoreLeadsParams,
  GetStoreReportParams,
  PagedResult,
  ReassignStoreLeadRequest,
  SearchStoreLeadHistoryActorsParams,
  SearchStoreLeadReassignTargetsParams,
  SearchStoreMembersParams,
  StoreCapacityResultDto,
  StoreLeadHistoryActorDto,
  StoreLeadHistoryItemDto,
  StoreLeadListItemDto,
  StoreLeadReassignTargetDto,
  StoreReportDto,
  StoreStaffDto,
  StoreStaffWorkloadDto,
} from '@/types/storemanager';

export const storeManagerService = {
  getMembers: () =>
    api.get<StoreStaffDto[]>('/api/my-store/members').then((r) => r.data),

  searchMembers: (params?: SearchStoreMembersParams) =>
    api
      .get<AddableStoreUserDto[]>('/api/my-store/members/search', { params })
      .then((r) => r.data),

  addMember: (data: AddStoreMemberRequest) => api.post('/api/my-store/members', data),

  removeMember: (userId: string) => api.delete(`/api/my-store/members/${userId}`),

  getWorkload: () =>
    api.get<StoreStaffWorkloadDto[]>('/api/my-store/workload').then((r) => r.data),

  getCapacity: () =>
    api.get<StoreCapacityResultDto>('/api/my-store/capacity').then((r) => r.data),

  getLeads: (params?: GetStoreLeadsParams) =>
    api
      .get<PagedResult<StoreLeadListItemDto>>('/api/store-leads', { params })
      .then((r) => r.data),

  reassignLead: (leadId: string, data: ReassignStoreLeadRequest) =>
    api.patch(`/api/store-leads/${leadId}/reassign`, data),

  getReassignTargets: (leadId: string, params?: SearchStoreLeadReassignTargetsParams) =>
    api
      .get<StoreLeadReassignTargetDto[]>(`/api/store-leads/${leadId}/reassign-targets`, { params })
      .then((r) => r.data),

  getLeadHistory: (params?: GetStoreHistoryParams) =>
    api
      .get<PagedResult<StoreLeadHistoryItemDto>>('/api/store-leads/history', { params })
      .then((r) => r.data),

  searchHistoryActors: (params?: SearchStoreLeadHistoryActorsParams) =>
    api
      .get<StoreLeadHistoryActorDto[]>('/api/store-leads/history-actors/search', { params })
      .then((r) => r.data),

  getReport: (params?: GetStoreReportParams) =>
    api.get<StoreReportDto>('/api/store-leads/report', { params }).then((r) => r.data),

  addInternalNote: (leadId: string, data: AddStoreNoteRequest) =>
    api.post(`/api/store-leads/${leadId}/internal-notes`, data),
};
