import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { LoginResponse } from '@/features/auth/types';

interface AuthUser {
  userId: string;
  email: string;
  username: string;
  roleId: string | null;
  roleName: string | null;
  lastLogin: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  // Actions
  setAuth: (data: LoginResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,

        setAuth: (data) =>
          set(
            {
              user: {
                userId: data.userId,
                email: data.email,
                username: data.username,
                roleId: data.roleId,
                roleName: data.roleName,
                lastLogin: data.lastLogin,
              },
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              isAuthenticated: true,
            },
            false,
            'setAuth',
          ),

        setTokens: (accessToken, refreshToken) =>
          set({ accessToken, refreshToken }, false, 'setTokens'),

        logout: () =>
          set(
            { user: null, accessToken: null, refreshToken: null, isAuthenticated: false },
            false,
            'logout',
          ),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: 'auth-store' },
  ),
);

// React hook
export const useAuthStore = authStore;

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectAccessToken = (state: AuthState) => state.accessToken;
