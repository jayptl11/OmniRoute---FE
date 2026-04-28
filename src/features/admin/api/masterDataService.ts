import { api } from '@/lib/axios';
import type {
  MasterDataItemDto,
  GetMasterDataParams,
  CreateMasterDataRequest,
  UpdateMasterDataRequest,
  EnumValueDto,
  ToggleStatusRequest,
} from '@/types/admin';

export const masterDataService = {
  getMasterData: (params?: GetMasterDataParams) =>
    api
      .get<MasterDataItemDto[]>('/api/master-data', { params })
      .then((r) => r.data),

  getEnums: (enumType: 'Channel' | 'NeedType' | 'LeadStatus') =>
    api
      .get<EnumValueDto[]>(`/api/master-data/enums/${enumType}`)
      .then((r) => r.data),

  createMasterData: (data: CreateMasterDataRequest) =>
    api
      .post<MasterDataItemDto>('/api/master-data', data)
      .then((r) => r.data),

  updateMasterData: (id: string, data: UpdateMasterDataRequest) =>
    api.put<void>(`/api/master-data/${id}`, data),

  toggleMasterDataStatus: (id: string, isActive: boolean) =>
    api.patch<void>(`/api/master-data/${id}/status`, {
      isActive,
    } satisfies ToggleStatusRequest),
};
