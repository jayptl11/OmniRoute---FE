import { api } from '@/lib/axios';
import type {
  AssignLeadRequest,
  AssignLeadResponse,
  DispatchHistoryItemDto,
  DispatchLeadDetailDto,
  DispatchQueueParams,
  DispatchQueueResponse,
  SearchDispatchStoresParams,
  StoreCapacityDto,
} from '@/types/dispatch';

export const dispatchService = {
  getQueue: (params?: DispatchQueueParams) =>
    api.get<DispatchQueueResponse>('/api/dispatch/queue', { params }).then((r) => r.data),

  getQueueItem: (id: string) =>
    api.get<DispatchLeadDetailDto>(`/api/dispatch/queue/${id}`).then((r) => r.data),

  getStoresCapacity: (params?: SearchDispatchStoresParams) =>
    api.get<StoreCapacityDto[]>('/api/dispatch/stores/capacity', { params }).then((r) => r.data),

  assignLead: (id: string, data: AssignLeadRequest) =>
    api.post<AssignLeadResponse>(`/api/dispatch/queue/${id}/assign`, data).then((r) => r.data),

  getHistory: () => api.get<DispatchHistoryItemDto[]>('/api/dispatch/history').then((r) => r.data),
};
