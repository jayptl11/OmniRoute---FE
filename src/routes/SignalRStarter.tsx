import { Outlet } from 'react-router-dom';
import { useSignalR } from '@/features/notifications/hooks/useSignalR';

/**
 * Wrapper layout không có UI — chỉ khởi động SignalR khi user authenticated.
 * Mount bao ngoài tất cả authenticated routes trong router.
 */
export function SignalRStarter() {
  useSignalR();
  return <Outlet />;
}
