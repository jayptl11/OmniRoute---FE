import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '../utils/errorMessages';
import type { LoginRequest, ValidationErrorResponse, SingleErrorResponse } from '../types';
import type { UseFormSetError } from 'react-hook-form';

export function useLogin(setError?: UseFormSetError<LoginRequest>) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: LoginRequest) => authApi.login(dto),

    onSuccess: (data) => {
      setAuth(data);
      navigate('/', { replace: true });
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
            setError(field.toLowerCase() as keyof LoginRequest, {
              message: getErrorMessage(codes[0]),
            });
          });
        } else if ('errorCode' in body) {
          toast.error(getErrorMessage(body.errorCode));
        }
      } else {
        toast.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    },
  });
}
