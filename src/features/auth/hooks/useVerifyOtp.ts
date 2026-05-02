import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { extractErrorMessage } from '@/lib/errors';
import type { VerifyOtpRequest } from '../types';

export function useVerifyOtp() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: VerifyOtpRequest) => authApi.verifyOtp(dto),

    onSuccess: (data) => {
      if (data.purpose === 'Register') {
        toast.success('Tài khoản đã được kích hoạt! Vui lòng đăng nhập.');
        navigate('/login', { replace: true });
      } else {
        navigate('/reset-password', {
          state: { resetToken: data.resetToken },
          replace: true,
        });
      }
    },

    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });
}
