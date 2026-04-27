import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../utils/errorMessages';
import type { RegisterRequest, ValidationErrorResponse, SingleErrorResponse } from '../types';
import type { UseFormSetError } from 'react-hook-form';

export function useRegister(setError?: UseFormSetError<RegisterRequest>) {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: RegisterRequest) => authApi.register(dto),

    onSuccess: (_data, variables) => {
      navigate('/verify-otp', {
        state: { email: variables.email, flow: 'register' },
      });
    },

    onError: (error) => {
      if (isAxiosError(error) && error.response) {
        const status = error.response.status;

        if (status === 429) {
          toast.error(getErrorMessage('OTP_RATE_LIMITED'));
          return;
        }

        const body = error.response.data as ValidationErrorResponse | SingleErrorResponse;

        if ('errors' in body && setError) {
          Object.entries(body.errors).forEach(([field, codes]) => {
            const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof RegisterRequest;
            setError(key, { message: getErrorMessage(codes[0]) });
          });
        } else if ('errorCode' in body) {
          if (body.errorCode === 'EMAIL_EXISTS' && setError) {
            setError('email', { message: getErrorMessage('EMAIL_EXISTS') });
          } else if (body.errorCode === 'USERNAME_EXISTS' && setError) {
            setError('username', { message: getErrorMessage('USERNAME_EXISTS') });
          } else {
            toast.error(getErrorMessage(body.errorCode));
          }
        }
      } else {
        toast.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    },
  });
}
