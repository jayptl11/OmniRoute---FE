import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { saleLeadService } from '../api/saleLeadService';
import type {
  GetSaleLeadsParams,
  UpdateSaleLeadStatusRequest,
  AddNoteRequest,
  ReportInvalidRequest,
  CreateFollowUpRequest,
  FollowUpFilter,
  PerformancePeriod,
} from '@/types/leads';

export const saleLeadKeys = {
  all: ['sale-leads'] as const,
  list: (params?: GetSaleLeadsParams) => ['sale-leads', 'list', params] as const,
  detail: (id: string) => ['sale-leads', 'detail', id] as const,
  followUps: (filter?: FollowUpFilter) => ['sale-leads', 'follow-ups', filter] as const,
  performance: (period?: PerformancePeriod) => ['sale-leads', 'performance', period] as const,
};

export function useSaleLeads(params?: GetSaleLeadsParams) {
  return useQuery({
    queryKey: saleLeadKeys.list(params),
    queryFn: () => saleLeadService.getSaleLeads(params),
  });
}

export function useSaleLeadDetail(id: string) {
  return useQuery({
    queryKey: saleLeadKeys.detail(id),
    queryFn: () => saleLeadService.getSaleLeadById(id),
    enabled: !!id,
  });
}

export function useUpdateSaleLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSaleLeadStatusRequest }) =>
      saleLeadService.updateStatus(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: saleLeadKeys.detail(id) });
      qc.invalidateQueries({ queryKey: saleLeadKeys.all });
    },
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddNoteRequest }) =>
      saleLeadService.addNote(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: saleLeadKeys.detail(id) });
    },
  });
}

export function useReportInvalid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReportInvalidRequest }) =>
      saleLeadService.reportInvalid(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: saleLeadKeys.detail(id) });
      qc.invalidateQueries({ queryKey: saleLeadKeys.all });
    },
  });
}

export function useCreateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateFollowUpRequest }) =>
      saleLeadService.createFollowUp(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: saleLeadKeys.followUps() });
    },
  });
}

export function useFollowUps(filter?: FollowUpFilter) {
  return useQuery({
    queryKey: saleLeadKeys.followUps(filter),
    queryFn: () => saleLeadService.getFollowUps(filter),
  });
}

export function usePerformance(period?: PerformancePeriod) {
  return useQuery({
    queryKey: saleLeadKeys.performance(period),
    queryFn: () => saleLeadService.getPerformance(period),
    staleTime: 5 * 60 * 1000,
  });
}
