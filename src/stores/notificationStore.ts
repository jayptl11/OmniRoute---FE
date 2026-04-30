import { create } from 'zustand';
import type { NotificationDto } from '@/types/notifications';

// ── Notification store ────────────────────────────────────────────────────────

interface NotificationState {
  unreadCount: number;
  notifications: NotificationDto[]; // cache — trang 1 của panel
  totalCount: number;

  // Actions
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
  resetUnread: () => void;

  setNotifications: (items: NotificationDto[], total: number) => void;
  appendNotifications: (items: NotificationDto[]) => void;
  prependNotification: (item: NotificationDto) => void;
  markOneRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],
  totalCount: 0,

  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  decrementUnread: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  resetUnread: () => set({ unreadCount: 0 }),

  setNotifications: (items, total) => set({ notifications: items, totalCount: total }),
  appendNotifications: (items) =>
    set((s) => ({
      notifications: [...s.notifications, ...items],
    })),
  prependNotification: (item) =>
    set((s) => ({
      notifications: [item, ...s.notifications],
      totalCount: s.totalCount + 1,
    })),
  markOneRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}));
