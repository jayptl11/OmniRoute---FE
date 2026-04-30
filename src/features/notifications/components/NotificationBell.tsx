import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  UserPlus,
  Clock,
  AlertCircle,
  ArrowUp,
  RefreshCw,
  BellRing,
  BellOff,
} from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import {
  useUnreadCount,
  useFetchNotificationPage,
  useMarkAllRead,
} from '../hooks/useNotifications';
import { notificationService } from '../api/notificationService';
import type { NotificationDto, NotificationType } from '@/types/notifications';
import styles from './NotificationBell.module.css';

// ── Icon / color helpers ──────────────────────────────────────────────────────

const TYPE_META: Record<
  NotificationType,
  { icon: React.ElementType; colorClass: string }
> = {
  NEW_LEAD:      { icon: UserPlus,    colorClass: styles.iconGreen  },
  SLA_WARNING:   { icon: Clock,       colorClass: styles.iconOrange },
  SLA_VIOLATED:  { icon: AlertCircle, colorClass: styles.iconRed    },
  ESCALATED:     { icon: ArrowUp,     colorClass: styles.iconPurple },
  REASSIGNED:    { icon: RefreshCw,   colorClass: styles.iconBlue   },
  FOLLOW_UP_DUE: { icon: BellRing,   colorClass: styles.iconYellow },
};

function getNotificationRoute(n: NotificationDto, roleName: string | null) {
  const role = (roleName ?? '').toLowerCase();

  if (n.entityType === 'LEAD') {
    switch (role) {
      case 'tv': return `/tv/leads/${n.entityId}`;
      case 'sa': return `/sa/leads/${n.entityId}`;
      case 'dp': return `/dp/queue/${n.entityId}`;
      // TN và QL không có trang detail lead — về danh sách
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

// ── Notification Item ─────────────────────────────────────────────────────────

function NotificationItem({
  item,
  onClickItem,
}: {
  item: NotificationDto;
  onClickItem: (item: NotificationDto) => void;
}) {
  const meta = TYPE_META[item.type] ?? { icon: Bell, colorClass: styles.iconBlue };
  const Icon = meta.icon;

  return (
    <div
      className={`${styles.item} ${!item.isRead ? styles.itemUnread : ''}`}
      onClick={() => onClickItem(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClickItem(item)}
    >
      {!item.isRead && <span className={styles.unreadDot} />}

      <div className={`${styles.iconWrap} ${meta.colorClass}`}>
        <Icon size={15} strokeWidth={2} />
      </div>

      <div className={styles.itemBody}>
        <p className={styles.itemTitle}>{item.title}</p>
        <p className={styles.itemDesc}>{item.body}</p>
        <p className={styles.itemTime}>{timeAgo(item.createdAt)}</p>
      </div>
    </div>
  );
}

// ── NotificationBell ──────────────────────────────────────────────────────────

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const roleName = useAuthStore((s) => s.user?.roleName ?? null);

  const { unreadCount, notifications, totalCount, markOneRead, decrementUnread } = useNotificationStore();
  const { fetchPage } = useFetchNotificationPage();
  const markAll = useMarkAllRead();

  // Bootstrap: lấy unread count khi mount
  useUnreadCount();

  // Đóng panel khi click ngoài
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Load trang 1 khi mở panel lần đầu
  const handleOpen = useCallback(async () => {
    const next = !open;
    setOpen(next);
    if (next && notifications.length === 0) {
      setLoading(true);
      try {
        await fetchPage(1);
        setPage(1);
      } finally {
        setLoading(false);
      }
    }
  }, [open, notifications.length, fetchPage]);

  // Load thêm
  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      await fetchPage(nextPage);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  // Click item — update store ngay lập tức, gọi API fire-and-forget
  // Không dùng mutation để tránh isPending → re-render → giật
  const handleClickItem = (item: NotificationDto) => {
    setOpen(false);
    if (!item.isRead) {
      markOneRead(item.id);
      decrementUnread();
      notificationService.markOneRead(item.id).catch(() => {}); // fire-and-forget
    }
    navigate(getNotificationRoute(item, roleName));
  };

  const hasMore = notifications.length < totalCount;
  const badgeLabel = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <div className={styles.bellWrap} ref={panelRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        className={styles.bellBtn}
        onClick={handleOpen}
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
      >
        <Bell size={16} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {badgeLabel}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Danh sách thông báo">
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Thông báo</span>
            {unreadCount > 0 && (
              <button
                className={styles.readAllBtn}
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
              >
                {markAll.isPending ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
              </button>
            )}
          </div>

          <div className={styles.list}>
            {loading && notifications.length === 0 && (
              <div className={styles.loadingRow}>Đang tải...</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className={styles.empty}>
                <BellOff size={28} strokeWidth={1.4} />
                <span>Chưa có thông báo nào</span>
              </div>
            )}

            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                item={n}
                onClickItem={handleClickItem}
              />
            ))}

            {loading && notifications.length > 0 && (
              <div className={styles.loadingRow}>Đang tải thêm...</div>
            )}
          </div>

          {hasMore && !loading && (
            <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
              Xem thêm thông báo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
