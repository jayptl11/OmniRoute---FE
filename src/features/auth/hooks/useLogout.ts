import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/stores/authStore';

export function useLogout() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => {
      if (accessToken && refreshToken) {
        return authApi.logout({ accessToken, refreshToken });
      }
      return Promise.resolve({ message: 'ok' });
    },

    onSettled: () => {
      // Always clear client state regardless of API response
      logout();
      navigate('/login', { replace: true });
    },

    onError: () => {
      toast.error('Đã có lỗi khi đăng xuất, nhưng bạn đã được đăng xuất khỏi thiết bị này.');
    },
  });
}
