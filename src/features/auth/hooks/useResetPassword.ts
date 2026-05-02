import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { extractErrorMessage } from '@/lib/errors';
import type { ResetPasswordRequest } from '../types';

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: ResetPasswordRequest) => authApi.resetPassword(dto),

    onSuccess: () => {
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      navigate('/login', { replace: true });
    },

    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });
}
