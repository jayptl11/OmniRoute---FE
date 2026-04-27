import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../utils/errorMessages';
import type { ForgotPasswordRequest, SingleErrorResponse } from '../types';

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
