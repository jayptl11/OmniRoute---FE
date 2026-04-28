import { api } from '@/lib/axios';
import type {
  StoreDto,
  GetStoresParams,
  CreateStoreRequest,
  UpdateStoreRequest,
  ToggleStatusRequest,
} from '@/types/admin';

export const storeService = {
  getStores: (params?: GetStoresParams) =>
    api.get<StoreDto[]>('/api/stores', { params }).then((r) => r.data),

  getStore: (id: string) =>
    api.get<StoreDto>(`/api/stores/${id}`).then((r) => r.data),

  createStore: (data: CreateStoreRequest) =>
    api.post<StoreDto>('/api/stores', data).then((r) => r.data),

  updateStore: (id: string, data: UpdateStoreRequest) =>
    api.put<void>(`/api/stores/${id}`, data),

  toggleStoreStatus: (id: string, isActive: boolean) =>
    api.patch<void>(`/api/stores/${id}/status`, {
      isActive,
    } satisfies ToggleStatusRequest),
};
