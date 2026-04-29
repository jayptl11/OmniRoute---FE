import { api } from '@/lib/axios';
import type {
  StoreStaffDto,
  AddableStoreUserDto,
  StoreStaffWorkloadDto,
  StoreCapacityResultDto,
  StoreLeadListItemDto,
  StoreLeadHistoryItemDto,
  StoreReportDto,
  PagedResult,
  GetStoreLeadsParams,
  GetStoreHistoryParams,
  GetStoreReportParams,
  ReassignStoreLeadRequest,
  AddStoreMemberRequest,
  AddStoreNoteRequest,
  SearchStoreMembersParams,
} from '@/types/storemanager';

export const storeManagerService = {
  // QL-06: Danh sách toàn bộ nhân sự đơn vị
  getMembers: () =>
    api.get<StoreStaffDto[]>('/api/my-store/members').then((r) => r.data),

  // QL-07 helper: Tìm kiếm user có thể thêm vào đơn vị (debounce 300ms ở hook)
  searchMembers: (params?: SearchStoreMembersParams) =>
    api
      .get<AddableStoreUserDto[]>('/api/my-store/members/search', { params })
      .then((r) => r.data),

  // QL-07: Thêm nhân sự vào đơn vị
  addMember: (data: AddStoreMemberRequest) =>
    api.post('/api/my-store/members', data),

  // QL-08: Xóa nhân sự khỏi đơn vị
  removeMember: (userId: string) =>
    api.delete(`/api/my-store/members/${userId}`),

  // QL-02: Workload + hiệu suất từng nhân sự
  getWorkload: () =>
    api.get<StoreStaffWorkloadDto[]>('/api/my-store/workload').then((r) => r.data),

  // QL-09: Năng lực tiếp nhận đơn vị
  getCapacity: () =>
    api.get<StoreCapacityResultDto>('/api/my-store/capacity').then((r) => r.data),

  // QL-01: Danh sách lead có phân trang + filter
  getLeads: (params?: GetStoreLeadsParams) =>
    api
      .get<PagedResult<StoreLeadListItemDto>>('/api/store-leads', { params })
      .then((r) => r.data),

  // QL-03: Reassign lead sang nhân sự khác trong đơn vị
  reassignLead: (leadId: string, data: ReassignStoreLeadRequest) =>
    api.patch(`/api/store-leads/${leadId}/reassign`, data),

  // QL-05: Lịch sử xử lý lead của đơn vị
  getLeadHistory: (params?: GetStoreHistoryParams) =>
    api
      .get<PagedResult<StoreLeadHistoryItemDto>>('/api/store-leads/history', { params })
      .then((r) => r.data),

  // QL-04: Báo cáo hiệu quả đơn vị
  getReport: (params?: GetStoreReportParams) =>
    api.get<StoreReportDto>('/api/store-leads/report', { params }).then((r) => r.data),

  // API 11: Ghi chú nội bộ trên lead
  addInternalNote: (leadId: string, data: AddStoreNoteRequest) =>
    api.post(`/api/store-leads/${leadId}/internal-notes`, data),
};
