import axios, { isAxiosError } from 'axios';
import { authStore } from '@/stores/authStore';
import { AppError } from '@/types/common';
import type { LoginResponse } from '@/features/auth/types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Token refresh queue ----
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

// ---- Request interceptor: attach accessToken ----
api.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Response interceptor: handle 401 with token refresh ----
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (isAxiosError(error) && error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = authStore.getState().refreshToken;

      if (!refreshToken) {
        authStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<LoginResponse>(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        authStore.getState().setTokens(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error — ưu tiên errorCode từ body (ví dụ: 'NO_TEAM', 'LEAD_NOT_FOUND')
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as
        | { errorCode?: string; errorMessage?: string; message?: string }
        | undefined;
      const errorCode = data?.errorCode;
      const message = data?.errorMessage ?? data?.message ?? error.message;
      // Dùng errorCode từ body nếu có, fallback về HTTP_${status}
      return Promise.reject(new AppError(message, errorCode ?? `HTTP_${status}`, status));
    }

    return Promise.reject(error);
  },
);
