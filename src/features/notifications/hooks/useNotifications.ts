import { useQuery, useMutation } from '@tanstack/react-query';
import { notificationService, notificationConfigService } from '../api/notificationService';
import { useNotificationStore } from '@/stores/notificationStore';

// ── Unread count (bootstrap khi app load) ────────────────────────────────────

export function useUnreadCount() {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      return count;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

// ── Notification list (lazy load cho panel) ───────────────────────────────────

export function useFetchNotificationPage() {
  const { appendNotifications, setNotifications } = useNotificationStore();

  const fetchPage = async (page: number) => {
    const res = await notificationService.getNotifications(page, 20);
    if (page === 1) {
      setNotifications(res.items, res.totalCount);
    } else {
      appendNotifications(res.items);
    }
    return res;
  };

  return { fetchPage };
}

// ── Mark one read ─────────────────────────────────────────────────────────────

export function useMarkOneRead() {
  const { markOneRead, decrementUnread, notifications } = useNotificationStore();

  return useMutation({
    mutationFn: notificationService.markOneRead,
    onSuccess: (_data, id) => {
      const item = notifications.find((n) => n.id === id);
      if (item && !item.isRead) {
        markOneRead(id);
        decrementUnread();
      } else {
        markOneRead(id);
      }
    },
    onError: () => {
      // 404/403 — bỏ qua, không ảnh hưởng UX
    },
  });
}

// ── Mark all read ─────────────────────────────────────────────────────────────

export function useMarkAllRead() {
  const { markAllRead } = useNotificationStore();

  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      markAllRead();
    },
  });
}

// ── QT-12: Notification configs ───────────────────────────────────────────────

export function useNotificationConfigs() {
  return useQuery({
    queryKey: ['notification-configs'],
    queryFn: notificationConfigService.getConfigs,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateNotificationConfig() {
  return useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
      notificationConfigService.updateConfig(id, isEnabled),
  });
}
