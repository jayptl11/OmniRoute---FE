import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { extractErrorMessage } from '@/lib/errors';
import type { ForgotPasswordRequest } from '../types';

export function useForgotPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: ForgotPasswordRequest) => authApi.forgotPassword(dto),

    onSuccess: (_data, variables) => {
      navigate('/verify-otp', {
        state: { email: variables.email, flow: 'reset' },
      });
    },

    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });
}
