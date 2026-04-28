import { api } from '@/lib/axios';
import type {
  GetSaleLeadsParams,
  SaleLeadListItemDto,
  SaleLeadDetailDto,
  UpdateSaleLeadStatusRequest,
  UpdateSaleLeadStatusResponse,
  AddNoteRequest,
  AddNoteResponse,
  ReportInvalidRequest,
  ReportInvalidResponse,
  CreateFollowUpRequest,
  CreateFollowUpResponse,
  FollowUpFilter,
  FollowUpTaskDto,
  PerformancePeriod,
  PerformanceDto,
} from '@/types/leads';
import type { PaginatedResponse } from '@/types/admin';

export const saleLeadService = {
  getSaleLeads: (params?: GetSaleLeadsParams) =>
    api
      .get<PaginatedResponse<SaleLeadListItemDto>>('/api/sale-leads', { params })
      .then((r) => r.data),

  getSaleLeadById: (id: string) =>
    api.get<SaleLeadDetailDto>(`/api/sale-leads/${id}`).then((r) => r.data),

  updateStatus: (id: string, data: UpdateSaleLeadStatusRequest) =>
    api
      .patch<UpdateSaleLeadStatusResponse>(`/api/sale-leads/${id}/status`, data)
      .then((r) => r.data),

  addNote: (id: string, data: AddNoteRequest) =>
    api
      .post<AddNoteResponse>(`/api/sale-leads/${id}/notes`, data)
      .then((r) => r.data),

  // SA-08
  reportInvalid: (id: string, data: ReportInvalidRequest) =>
    api
      .patch<ReportInvalidResponse>(`/api/sale-leads/${id}/report-invalid`, data)
      .then((r) => r.data),

  // SA-06
  createFollowUp: (id: string, data: CreateFollowUpRequest) =>
    api
      .post<CreateFollowUpResponse>(`/api/sale-leads/${id}/follow-ups`, data)
      .then((r) => r.data),

  // SA-07
  getFollowUps: (filter?: FollowUpFilter) =>
    api
      .get<FollowUpTaskDto[]>('/api/sale-leads/follow-ups', { params: filter ? { filter } : undefined })
      .then((r) => r.data),

  // SA-09
  getPerformance: (period?: PerformancePeriod) =>
    api
      .get<PerformanceDto>('/api/sale-leads/performance', { params: period ? { period } : undefined })
      .then((r) => r.data),
};

