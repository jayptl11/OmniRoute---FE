# API Guide

## Axios Instance

```ts
// src/lib/axios.ts
import axios, { isAxiosError } from 'axios';
import { authStore } from '@/stores/authStore';
import { AppError } from '@/types/common';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request: đính token
api.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: normalize lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message ?? error.message;

      if (status === 401) {
        authStore.getState().logout();
        // redirect về login nếu cần
      }

      return Promise.reject(new AppError(message, `HTTP_${status}`, status));
    }
    return Promise.reject(error);
  },
);
```

---

## API Module per Feature

```ts
// src/features/users/api/userApi.ts
import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { User, CreateUserDto, UpdateUserDto } from '../types';

export const userApi = {
  getList: (params: { page: number; limit: number; search?: string }) =>
    api.get<PaginatedResponse<User>>('/users', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<User>>(`/users/${id}`).then((r) => r.data.data),

  create: (dto: CreateUserDto) =>
    api.post<ApiResponse<User>>('/users', dto).then((r) => r.data.data),

  update: (id: string, dto: UpdateUserDto) =>
    api.patch<ApiResponse<User>>(`/users/${id}`, dto).then((r) => r.data.data),

  remove: (id: string) =>
    api.delete<ApiResponse<null>>(`/users/${id}`).then((r) => r.data),
};
```

---

## TanStack Query Hooks

### Query Keys — định nghĩa tập trung

```ts
// src/features/users/api/userKeys.ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: object) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
```

### useQuery

```ts
// src/features/users/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import { userKeys } from '../api/userKeys';

interface UseUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useUsers(params: UseUsersParams = {}) {
  const { page = 1, limit = 20, search } = params;

  return useQuery({
    queryKey: userKeys.list({ page, limit, search }),
    queryFn: () => userApi.getList({ page, limit, search }),
    placeholderData: (prev) => prev, // giữ data cũ khi đổi page
    staleTime: 1000 * 60,           // 1 phút
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getById(id),
    enabled: Boolean(id),
  });
}
```

### useMutation (tạo / cập nhật / xoá)

```ts
// src/features/users/hooks/useCreateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import { userKeys } from '../api/userKeys';
import type { CreateUserDto } from '../types';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateUserDto) => userApi.create(dto),

    onSuccess: () => {
      // Invalidate toàn bộ list sau khi tạo
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },

    onError: (error: AppError) => {
      // Toast notification hoặc xử lý lỗi tập trung
      console.error(error.message);
    },
  });
}
```

### Optimistic Update

```ts
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.remove(id),

    onMutate: async (deletedId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });

      // Snapshot để rollback
      const previous = queryClient.getQueryData(userKeys.lists());

      // Optimistic remove
      queryClient.setQueriesData({ queryKey: userKeys.lists() }, (old: any) => ({
        ...old,
        data: old?.data?.filter((u: User) => u.id !== deletedId),
      }));

      return { previous };
    },

    onError: (_err, _id, context) => {
      // Rollback
      queryClient.setQueryData(userKeys.lists(), context?.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

---

## TanStack Query Client Config

```ts
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { AppError } from '@/types/common';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,       // 30s
      retry: (failureCount, error) => {
        // Không retry lỗi 4xx
        if (error instanceof AppError && error.statusCode && error.statusCode < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
```

---

## Environment Variables

```bash
# .env.example  (commit lên git — không chứa value thật)
VITE_API_URL=https://api.example.com
VITE_APP_NAME=MyApp
VITE_SENTRY_DSN=
```

```ts
// src/types/env.d.ts
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_SENTRY_DSN?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```
