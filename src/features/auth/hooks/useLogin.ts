import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/stores/authStore';
import { extractErrorMessage } from '@/lib/errors';
import type { LoginRequest } from '../types';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: LoginRequest) => authApi.login(dto),

    onSuccess: (data) => {
      setAuth(data);
      navigate('/', { replace: true });
    },

    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });
}
