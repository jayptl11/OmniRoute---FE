import { QueryClient } from '@tanstack/react-query';
import { isAppError } from '@/types/common';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30s
      retry: (failureCount, error) => {
        // Không retry lỗi 4xx
        if (isAppError(error) && error.statusCode !== undefined && error.statusCode < 500) {
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
