import { api } from '@/lib/axios';
import type { PaginatedResponse } from '@/types/admin';
import type {
  GetTicketsParams,
  TicketListItemDto,
  TicketDetailDto,
  UpdateTicketStatusRequest,
  UpdateTicketStatusResponse,
  AddTicketNoteRequest,
  AddTicketNoteResponse,
  EscalateTicketRequest,
  EscalateTicketResponse,
  RecordSatisfactionRequest,
  RecordSatisfactionResponse,
  TicketPerformanceDto,
  TicketPerformancePeriod,
} from '@/types/tickets';

export const ticketService = {
  // CS-01 + CS-03: Danh sách ticket + filter/search/pagination
  getTickets: (params?: GetTicketsParams) =>
    api
      .get<PaginatedResponse<TicketListItemDto>>('/api/tickets', { params })
      .then((r) => r.data),

  // CS-02: Chi tiết ticket + activity timeline + lịch sử KH
  getTicketById: (id: string) =>
    api.get<TicketDetailDto>(`/api/tickets/${id}`).then((r) => r.data),

  // CS-04: Cập nhật trạng thái theo BR-05
  updateStatus: (id: string, data: UpdateTicketStatusRequest) =>
    api
      .patch<UpdateTicketStatusResponse>(`/api/tickets/${id}/status`, data)
      .then((r) => r.data),

  // CS-05: Ghi chú kết quả xử lý
  addNote: (id: string, data: AddTicketNoteRequest) =>
    api
      .post<AddTicketNoteResponse>(`/api/tickets/${id}/notes`, data)
      .then((r) => r.data),

  // CS-06: Escalate ticket
  escalate: (id: string, data: EscalateTicketRequest) =>
    api
      .post<EscalateTicketResponse>(`/api/tickets/${id}/escalate`, data)
      .then((r) => r.data),

  // CS-07: Ghi nhận mức độ hài lòng KH
  recordSatisfaction: (id: string, data: RecordSatisfactionRequest) =>
    api
      .patch<RecordSatisfactionResponse>(`/api/tickets/${id}/satisfaction`, data)
      .then((r) => r.data),

  // CS-08: Hiệu suất cá nhân theo kỳ
  getPerformance: (period?: TicketPerformancePeriod) =>
    api
      .get<TicketPerformanceDto>('/api/tickets/performance', {
        params: period ? { period } : undefined,
      })
      .then((r) => r.data),
};
