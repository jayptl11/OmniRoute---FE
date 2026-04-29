import { api } from '@/lib/axios';
import type {
  StoreDto,
  StoreManagerDto,
  GetStoresParams,
  CreateStoreRequest,
  UpdateStoreRequest,
  ToggleStatusRequest,
} from '@/types/admin';

export const storeService = {
  // API 1: Tìm kiếm QL để gán làm quản lý (debounce 300ms ở UI)
  searchManagers: (q?: string) =>
    api
      .get<StoreManagerDto[]>('/api/stores/managers/search', { params: q ? { q } : undefined })
      .then((r) => r.data),

  // API 2: Danh sách cửa hàng (có filter search/region/isActive)
  getStores: (params?: GetStoresParams) =>
    api.get<StoreDto[]>('/api/stores', { params }).then((r) => r.data),

  // API 3: Chi tiết cửa hàng
  getStore: (id: string) =>
    api.get<StoreDto>(`/api/stores/${id}`).then((r) => r.data),

  // API 4: Tạo cửa hàng mới → 201 trả về StoreDto
  createStore: (data: CreateStoreRequest) =>
    api.post<StoreDto>('/api/stores', data).then((r) => r.data),

  // API 5: Cập nhật cửa hàng → 204
  updateStore: (id: string, data: UpdateStoreRequest) =>
    api.put<void>(`/api/stores/${id}`, data),

  // API 6: Kích hoạt / vô hiệu hóa → 204
  toggleStoreStatus: (id: string, isActive: boolean) =>
    api.patch<void>(`/api/stores/${id}/status`, {
      isActive,
    } satisfies ToggleStatusRequest),
};
