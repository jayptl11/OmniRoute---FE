import { api } from '@/lib/axios';
import type {
  CheckDuplicateResponse,
  CreateLeadRequest,
  CreateLeadResponse,
  GetLeadsParams,
  LeadDetailDto,
  LeadListItemDto,
  UpdateLeadRequest,
  UpdateLeadResponse,
} from '@/types/leads';
import type { PaginatedResponse } from '@/types/admin';

export const leadService = {
  checkDuplicate: (phone: string) =>
    api
      .get<CheckDuplicateResponse>('/api/leads/check-duplicate', { params: { phone } })
      .then((r) => r.data),

  createLead: (data: CreateLeadRequest) =>
    api.post<CreateLeadResponse>('/api/leads', data).then((r) => r.data),

  getLeads: (params?: GetLeadsParams) =>
    api
      .get<PaginatedResponse<LeadListItemDto>>('/api/leads', { params })
      .then((r) => r.data),

  getLeadById: (id: string) =>
    api.get<LeadDetailDto>(`/api/leads/${id}`).then((r) => r.data),

  updateLead: (id: string, data: UpdateLeadRequest) =>
    api.put<UpdateLeadResponse>(`/api/leads/${id}`, data).then((r) => r.data),
};
