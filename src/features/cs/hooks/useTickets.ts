import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '../api/ticketService';
import type {
  GetTicketsParams,
  UpdateTicketStatusRequest,
  AddTicketNoteRequest,
  EscalateTicketRequest,
  RecordSatisfactionRequest,
  TicketPerformancePeriod,
} from '@/types/tickets';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const ticketKeys = {
  all:         ['tickets'] as const,
  list:        (params?: GetTicketsParams) => ['tickets', 'list', params] as const,
  detail:      (id: string) => ['tickets', 'detail', id] as const,
  performance: (period?: TicketPerformancePeriod) => ['tickets', 'performance', period] as const,
};

// ─── CS-01 + CS-03: Danh sách ticket ────────────────────────────────────────

export function useTickets(params?: GetTicketsParams) {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => ticketService.getTickets(params),
  });
}

// ─── CS-02: Chi tiết ticket ──────────────────────────────────────────────────

export function useTicketDetail(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn:  () => ticketService.getTicketById(id),
    enabled:  !!id,
  });
}

// ─── CS-04: Cập nhật trạng thái ─────────────────────────────────────────────

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketStatusRequest }) =>
      ticketService.updateStatus(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ticketKeys.all });
    },
  });
}

// ─── CS-05: Ghi chú xử lý ───────────────────────────────────────────────────

export function useAddTicketNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddTicketNoteRequest }) =>
      ticketService.addNote(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(id) });
    },
  });
}

// ─── CS-06: Escalate ticket ─────────────────────────────────────────────────

export function useEscalateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EscalateTicketRequest }) =>
      ticketService.escalate(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ticketKeys.all });
    },
  });
}

// ─── CS-07: Ghi nhận hài lòng ───────────────────────────────────────────────

export function useRecordSatisfaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecordSatisfactionRequest }) =>
      ticketService.recordSatisfaction(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(id) });
    },
  });
}

// ─── CS-08: Hiệu suất cá nhân ───────────────────────────────────────────────

export function useTicketPerformance(period?: TicketPerformancePeriod) {
  return useQuery({
    queryKey: ticketKeys.performance(period),
    queryFn:  () => ticketService.getPerformance(period),
    staleTime: 5 * 60 * 1000,
  });
}
