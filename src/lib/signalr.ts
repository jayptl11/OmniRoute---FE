import * as signalR from '@microsoft/signalr';
import { authStore } from '@/stores/authStore';

// ── SignalR singleton ─────────────────────────────────────────────────────────
// Một HubConnection duy nhất cho toàn app, khởi động sau khi user login,
// dừng khi logout.

const HUB_URL = `${import.meta.env.VITE_API_URL ?? ''}/hubs/notifications`;

export const notificationConnection = new signalR.HubConnectionBuilder()
  .withUrl(HUB_URL, {
    // SignalR WebSocket không hỗ trợ Authorization header.
    // Server đọc JWT từ query string ?access_token=...
    accessTokenFactory: () => authStore.getState().accessToken ?? '',
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
  .configureLogging(signalR.LogLevel.Warning)
  .build();
