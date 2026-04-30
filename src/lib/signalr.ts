import * as signalR from '@microsoft/signalr';
import { authStore } from '@/stores/authStore';

// ── SignalR singleton ─────────────────────────────────────────────────────────
// Một HubConnection duy nhất cho toàn app, khởi động sau khi user login,
// dừng khi logout.

export const notificationConnection = new signalR.HubConnectionBuilder()
  .withUrl('/hubs/notifications', {
    // SignalR WebSocket không hỗ trợ Authorization header.
    // Server đọc JWT từ query string ?access_token=...
    accessTokenFactory: () => authStore.getState().accessToken ?? '',
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
  .configureLogging(signalR.LogLevel.Warning)
  .build();
