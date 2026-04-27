import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../utils/errorMessages';
import type { ResendOtpRequest, SingleErrorResponse } from '../types';

export function useResendOtp() {
  return useMutation({
    mutationFn: (dto: ResendOtpRequest) => authApi.resendOtp(dto),

    onSuccess: () => {
      toast.success('Mã OTP đã được gửi lại. Vui lòng kiểm tra email.');
    },

    onError: (error) => {
      if (isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 429) {
          toast.error(getErrorMessage('RESEND_RATE_LIMITED'));
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
