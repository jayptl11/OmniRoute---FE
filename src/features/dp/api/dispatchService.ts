import { api } from '@/lib/axios';
import type {
  DispatchQueueParams,
  DispatchQueueResponse,
  DispatchLeadDetailDto,
  StoreCapacityDto,
  AssignLeadRequest,
  AssignLeadResponse,
  DispatchHistoryItemDto,
} from '@/types/dispatch';

export const dispatchService = {
  // DP-01 + DP-07: Queue với filter/search/pagination
  getQueue: (params?: DispatchQueueParams) =>
    api
      .get<DispatchQueueResponse>('/api/dispatch/queue', { params })
      .then((r) => r.data),

  // DP-02: Chi tiết lead trong queue
  getQueueItem: (id: string) =>
    api
      .get<DispatchLeadDetailDto>(`/api/dispatch/queue/${id}`)
      .then((r) => r.data),

  // DP-03: Tình trạng tải từng cửa hàng
  getStoresCapacity: () =>
    api
      .get<StoreCapacityDto[]>('/api/dispatch/stores/capacity')
      .then((r) => r.data),

  // DP-04 + DP-05: Gán lead về cửa hàng (kèm ghi chú tuỳ chọn)
  assignLead: (id: string, data: AssignLeadRequest) =>
    api
      .post<AssignLeadResponse>(`/api/dispatch/queue/${id}/assign`, data)
      .then((r) => r.data),

  // DP-06: Lịch sử phân công của DP hiện tại
  getHistory: () =>
    api
      .get<DispatchHistoryItemDto[]>('/api/dispatch/history')
      .then((r) => r.data),
};
