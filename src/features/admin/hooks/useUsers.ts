import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/userService';
import type {
  CreateUserRequest,
  GetUsersParams,
  UpdateUserRequest,
} from '@/types/admin';

export const userKeys = {
  all: ['users'] as const,
  list: (params?: GetUsersParams) => ['users', 'list', params] as const,
};

export function useUsers(params?: GetUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.toggleUserStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useSendResetLink() {
  return useMutation({
    mutationFn: (id: string) => userService.sendResetLink(id),
  });
}

export function useSetTemporaryPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      userService.setTemporaryPassword(id, password),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: userService.getRoles,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
