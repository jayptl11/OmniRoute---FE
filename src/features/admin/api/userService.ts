import { api } from '@/lib/axios';
import type {
  UserDto,
  GetUsersParams,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  ToggleUserStatusResponse,
  PaginatedResponse,
  ToggleStatusRequest,
  RoleDto,
} from '@/types/admin';

export const userService = {
  getUsers: (params?: GetUsersParams) =>
    api
      .get<PaginatedResponse<UserDto>>('/api/users', { params })
      .then((r) => r.data),

  createUser: (data: CreateUserRequest) =>
    api.post<CreateUserResponse>('/api/users', data).then((r) => r.data),

  updateUser: (id: string, data: UpdateUserRequest) =>
    api.put<void>(`/api/users/${id}`, data),

  toggleUserStatus: (id: string, isActive: boolean) =>
    api
      .patch<ToggleUserStatusResponse>(`/api/users/${id}/status`, {
        isActive,
      } satisfies ToggleStatusRequest)
      .then((r) => r.data),

  sendResetLink: (id: string) =>
    api.post<void>(`/api/users/${id}/send-reset-link`),

  setTemporaryPassword: (id: string, temporaryPassword: string) =>
    api.post<void>(`/api/users/${id}/set-temporary-password`, {
      temporaryPassword,
    }),

  getRoles: () =>
    api.get<RoleDto[]>('/api/users/roles').then((r) => r.data),
};
