import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { extractErrorMessage } from '@/lib/errors';
import type { RegisterRequest } from '../types';

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: RegisterRequest) => authApi.register(dto),

    onSuccess: (_data, variables) => {
      navigate('/verify-otp', {
        state: { email: variables.email, flow: 'register' },
      });
    },

    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });
}
