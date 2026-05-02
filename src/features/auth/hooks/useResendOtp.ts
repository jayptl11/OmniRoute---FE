import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { extractErrorMessage } from '@/lib/errors';
import type { ResendOtpRequest } from '../types';

export function useResendOtp() {
  return useMutation({
    mutationFn: (dto: ResendOtpRequest) => authApi.resendOtp(dto),

    onSuccess: () => {
      toast.success('Mã OTP đã được gửi lại. Vui lòng kiểm tra email.');
    },

    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });
}
