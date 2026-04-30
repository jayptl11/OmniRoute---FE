// ── Notification Types — Phase 8 ──────────────────────────────────────────────

export type NotificationType =
  | 'NEW_LEAD'
  | 'SLA_WARNING'
  | 'SLA_VIOLATED'
  | 'ESCALATED'
  | 'REASSIGNED'
  | 'FOLLOW_UP_DUE';

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType: 'LEAD' | 'TICKET' | 'SYSTEM';
  entityId: string;
  isRead: boolean;
  createdAt: string; // ISO 8601 UTC
}

export interface GetNotificationsResponse {
  items: NotificationDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// QT-12: Notification config
export interface NotificationConfigDto {
  id: string;
  notificationType: string;
  targetRole: string; // TV | SA | CS | DP | TN | QL | QT | BQL
  isEnabled: boolean;
  updatedAt: string; // ISO 8601
}
