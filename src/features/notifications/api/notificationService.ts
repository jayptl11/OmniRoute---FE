import { api } from '@/lib/axios';
import type {
  GetNotificationsResponse,
  NotificationConfigDto,
} from '@/types/notifications';

// ── REST: Notifications (all roles) ──────────────────────────────────────────

export const notificationService = {
  /** GET /api/notifications — phân trang */
  getNotifications: async (
    page = 1,
    pageSize = 20,
  ): Promise<GetNotificationsResponse> => {
    const { data } = await api.get<GetNotificationsResponse>(
      '/api/notifications',
      { params: { page, pageSize } },
    );
    return data;
  },

  /** GET /api/notifications/unread-count → number */
  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<number>('/api/notifications/unread-count');
    return data;
  },

  /** PUT /api/notifications/{id}/read → 204 */
  markOneRead: async (id: string): Promise<void> => {
    await api.put(`/api/notifications/${id}/read`);
  },

  /** PUT /api/notifications/read-all → 204 */
  markAllRead: async (): Promise<void> => {
    await api.put('/api/notifications/read-all');
  },
};

// ── REST: Notification Configs (QT only) ─────────────────────────────────────

export const notificationConfigService = {
  /** GET /api/notification-configs */
  getConfigs: async (): Promise<NotificationConfigDto[]> => {
    const { data } = await api.get<NotificationConfigDto[]>(
      '/api/notification-configs',
    );
    return data;
  },

  /** PUT /api/notification-configs/{id} → 204 */
  updateConfig: async (id: string, isEnabled: boolean): Promise<void> => {
    await api.put(`/api/notification-configs/${id}`, { isEnabled });
  },
};
