import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { toast } from 'sonner';
import { notificationConnection } from '@/lib/signalr';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { notificationService } from '../api/notificationService';
import type { NotificationDto } from '@/types/notifications';

// ── Route helper ──────────────────────────────────────────────────────────────

function getNotificationRoute(
  n: NotificationDto,
  roleName: string | null,
): string {
  const role = (roleName ?? '').toLowerCase();

  if (n.entityType === 'LEAD') {
    switch (role) {
      case 'tv': return `/tv/leads/${n.entityId}`;
      case 'sa': return `/sa/leads/${n.entityId}`;
      case 'dp': return `/dp/queue/${n.entityId}`;
      case 'tn': return `/tn/leads`;
      case 'ql': return `/ql/leads`;
      default:   return '/';
    }
  }

  if (n.entityType === 'TICKET') {
    switch (role) {
      case 'cs': return `/cs/tickets/${n.entityId}`;
      default:   return '/';
    }
  }

  return '/';
}

// ── useSignalR hook ───────────────────────────────────────────────────────────
// Gọi một lần trong component bên trong <RouterProvider> (vd: AppInner).

export function useSignalR() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const roleName = useAuthStore((s) => s.user?.roleName ?? null);
  const { prependNotification, incrementUnread, setUnreadCount } =
    useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Đăng ký handler TRƯỚC khi start
    notificationConnection.on(
      'ReceiveNotification',
      (notification: NotificationDto) => {
        // Thêm vào đầu danh sách local
        prependNotification(notification);
        incrementUnread();

        // Hiện sonner toast có thể click để navigate
        toast(notification.title, {
          description: notification.body,
          action: {
            label: 'Xem',
            onClick: () =>
              navigate(getNotificationRoute(notification, roleName)),
          },
          duration: 5000,
        });
      },
    );

    // Sau khi kết nối lại → sync lại unread count
    notificationConnection.onreconnected(async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch {
        // ignore
      }
    });

    const startConnection = async () => {
      if (
        notificationConnection.state ===
        signalR.HubConnectionState.Disconnected
      ) {
        try {
          await notificationConnection.start();
        } catch (err) {
          console.warn('[SignalR] Không thể kết nối:', err);
        }
      }
    };

    startConnection();

    return () => {
      notificationConnection.off('ReceiveNotification');
    };
  }, [isAuthenticated, roleName, prependNotification, incrementUnread, setUnreadCount, navigate]);

  // Stop khi user logout
  useEffect(() => {
    if (!isAuthenticated) {
      if (
        notificationConnection.state !==
        signalR.HubConnectionState.Disconnected
      ) {
        notificationConnection.stop().catch(() => {});
      }
    }
  }, [isAuthenticated]);
}
