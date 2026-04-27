import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../utils/errorMessages';
import type { VerifyOtpRequest, SingleErrorResponse } from '../types';

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
      if (isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 429) {
          toast.error(getErrorMessage('OTP_RATE_LIMITED'));
          return;
        }
        const body = error.response.data as SingleErrorResponse;
        if ('errorCode' in body) {
          toast.error(getErrorMessage(body.errorCode));
        }
      } else {
        toast.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    },
  });
}
