# Tài liệu tích hợp Frontend — Phase 8: Thông báo & Alert

> **Dành cho:** Frontend AI / Developer tích hợp tất cả role  
> **Base URL:** `/api`  
> **Auth:** `Authorization: Bearer <token>` — mọi role đã đăng nhập (trừ QT-12 chỉ dành cho `QT`)  
> **Ngày cập nhật:** 2026-04-30

---

## Mục lục

- [Types TypeScript](#types-typescript)
- [REST API — Thông báo (mọi role)](#rest-api--thông-báo-mọi-role)
  - [API 1 — Lấy danh sách thông báo](#api-1--lấy-danh-sách-thông-báo)
  - [API 2 — Số thông báo chưa đọc](#api-2--số-thông-báo-chưa-đọc)
  - [API 3 — Đánh dấu 1 thông báo đã đọc](#api-3--đánh-dấu-1-thông-báo-đã-đọc)
  - [API 4 — Đánh dấu tất cả đã đọc](#api-4--đánh-dấu-tất-cả-đã-đọc)
- [REST API — Cấu hình thông báo (QT-12, chỉ QT)](#rest-api--cấu-hình-thông-báo-qt-12-chỉ-qt)
  - [API 5 — Danh sách cấu hình](#api-5--danh-sách-cấu-hình)
  - [API 6 — Bật / tắt cấu hình](#api-6--bật--tắt-cấu-hình)
- [SignalR — Kết nối real-time](#signalr--kết-nối-real-time)
- [Danh sách loại thông báo](#danh-sách-loại-thông-báo)
- [Luồng UX khuyến nghị](#luồng-ux-khuyến-nghị)

---

## Types TypeScript

```typescript
// Một thông báo
interface NotificationDto {
  id: string            // uuid
  type: NotificationType
  title: string
  body: string
  entityType: 'LEAD' | 'TICKET' | 'SYSTEM'
  entityId: string      // uuid — dùng để điều hướng khi click
  isRead: boolean
  createdAt: string     // ISO 8601 UTC
}

// Response GET /api/notifications
interface GetNotificationsResponse {
  items: NotificationDto[]
  totalCount: number
  page: number
  pageSize: number
}

// Các loại thông báo
type NotificationType =
  | 'NEW_LEAD'
  | 'SLA_WARNING'
  | 'SLA_VIOLATED'
  | 'ESCALATED'
  | 'REASSIGNED'
  | 'FOLLOW_UP_DUE'

// QT-12: Một dòng cấu hình thông báo
interface NotificationConfigDto {
  id: string            // uuid — dùng để update
  notificationType: string
  targetRole: string    // TV | SA | CS | DP | TN | QL | QT | BQL
  isEnabled: boolean
  updatedAt: string     // ISO 8601
}
```

---

## REST API — Thông báo (mọi role)

### API 1 — Lấy danh sách thông báo

#### `GET /api/notifications`

Lấy danh sách thông báo của **user đang đăng nhập**, sắp xếp mới nhất trước. Phân trang.

**Query params:**

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `page` | number | `1` | Trang hiện tại (1-indexed) |
| `pageSize` | number | `20` | Số bản ghi mỗi trang |

**Response `200 OK`:**
```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "type": "NEW_LEAD",
      "title": "Lead mới được gán: LD-20260430-0012",
      "body": "Lead LD-20260430-0012 - Nguyễn Văn A đã được gán cho bạn.",
      "entityType": "LEAD",
      "entityId": "abc12345-0000-0000-0000-000000000000",
      "isRead": false,
      "createdAt": "2026-04-30T08:15:00Z"
    },
    {
      "id": "4fb85f64-5717-4562-b3fc-2c963f66afa6",
      "type": "SLA_WARNING",
      "title": "Cảnh báo SLA sắp hết hạn: LD-20260430-0010",
      "body": "Lead LD-20260430-0010 - Trần Thị B sẽ vi phạm SLA lúc 10:30 30/04/2026.",
      "entityType": "LEAD",
      "entityId": "def67890-0000-0000-0000-000000000000",
      "isRead": true,
      "createdAt": "2026-04-30T07:45:00Z"
    }
  ],
  "totalCount": 42,
  "page": 1,
  "pageSize": 20
}
```

**Lưu ý tích hợp:**
- Dùng `totalCount` và `pageSize` để tính tổng số trang: `Math.ceil(totalCount / pageSize)`
- `entityId` là ID của lead/ticket → dùng để điều hướng khi user click vào thông báo (xem bảng điều hướng ở mục [Luồng UX](#luồng-ux-khuyến-nghị))
- Không có filter server-side (unread/all) — nếu cần filter unread, lọc client-side theo `isRead`

---

### API 2 — Số thông báo chưa đọc

#### `GET /api/notifications/unread-count`

Trả về một số nguyên — số thông báo có `isRead = false` của user hiện tại.

**Response `200 OK`:**
```json
7
```

**Lưu ý tích hợp:**
- Gọi API này khi **khởi động app** để hiển thị badge trên icon chuông
- Sau khi nhận sự kiện SignalR `ReceiveNotification` → tự động tăng count lên 1 (không cần gọi lại API)
- Sau khi gọi `PUT /api/notifications/read-all` thành công → reset count về 0
- Sau khi gọi `PUT /api/notifications/{id}/read` thành công → giảm count xuống 1 (nếu notification đó chưa đọc)

---

### API 3 — Đánh dấu 1 thông báo đã đọc

#### `PUT /api/notifications/{id}/read`

**Path param:** `id` — uuid của thông báo

**Request body:** Không có

**Response thành công:** `204 No Content`

**Error responses:**

| Status | errorCode | Xử lý UI |
|---|---|---|
| 404 | (string message) | Bỏ qua hoặc toast nhẹ — hiếm gặp |
| 403 | (Forbidden) | Không hiển thị — thông báo không thuộc user |

**Lưu ý tích hợp:**
- Gọi khi user **click vào một thông báo** trong panel
- Nếu `isRead` đã là `true` — vẫn có thể gọi, server sẽ bỏ qua (idempotent)
- Sau khi thành công, cập nhật local state: set `isRead = true` cho item có `id` tương ứng

---

### API 4 — Đánh dấu tất cả đã đọc

#### `PUT /api/notifications/read-all`

**Request body:** Không có

**Response thành công:** `204 No Content`

**Lưu ý tích hợp:**
- Gọi khi user click nút "Đánh dấu tất cả đã đọc"
- Sau khi thành công: set `isRead = true` cho toàn bộ items trong local state + reset unread count về 0
- Không cần refetch danh sách

---

## REST API — Cấu hình thông báo (QT-12, chỉ QT)

> **Yêu cầu:** Role `QT`. Các role khác nhận `401 Unauthorized`.

### API 5 — Danh sách cấu hình

#### `GET /api/notification-configs`

Trả về toàn bộ bảng cấu hình "loại thông báo → role nhận". Mỗi dòng là một cặp duy nhất.

**Response `200 OK`:**
```json
[
  {
    "id": "c1000001-0000-0000-0000-000000000001",
    "notificationType": "NEW_LEAD",
    "targetRole": "TN",
    "isEnabled": true,
    "updatedAt": "2026-01-01T00:00:00Z"
  },
  {
    "id": "c1000003-0000-0000-0000-000000000003",
    "notificationType": "SLA_VIOLATED",
    "targetRole": "TN",
    "isEnabled": true,
    "updatedAt": "2026-01-01T00:00:00Z"
  },
  {
    "id": "c1000004-0000-0000-0000-000000000004",
    "notificationType": "SLA_VIOLATED",
    "targetRole": "QL",
    "isEnabled": false,
    "updatedAt": "2026-04-30T09:00:00Z"
  }
]
```

**Dữ liệu mặc định khi seed:**

| notificationType | targetRole | isEnabled mặc định |
|---|---|---|
| `NEW_LEAD` | `TN` | true |
| `SLA_WARNING` | `TN` | true |
| `SLA_VIOLATED` | `TN` | true |
| `SLA_VIOLATED` | `QL` | true |
| `ESCALATED` | `TN` | true |
| `ESCALATED` | `QL` | true |

**Lưu ý:** Bảng này chỉ kiểm soát thông báo gửi đến **theo role** (broadcast). Thông báo gửi trực tiếp đến người được gán (assigned user) luôn được gửi bất kể cấu hình này.

**Lưu ý tích hợp:**
- Gợi ý hiển thị theo nhóm `notificationType` — mỗi type là một section, các dòng con là role nhận
- Dùng toggle switch cho `isEnabled`

---

### API 6 — Bật / tắt cấu hình

#### `PUT /api/notification-configs/{id}`

**Path param:** `id` — uuid của config entry (lấy từ API 5)

**Request body:**
```json
{
  "isEnabled": false
}
```

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `isEnabled` | boolean | Có | `true` = bật, `false` = tắt |

**Response thành công:** `204 No Content`

**Error responses:**

| Status | errorCode | Xử lý UI |
|---|---|---|
| 404 | (string message) | Toast "Không tìm thấy cấu hình" |
| 400 | (string message) | Toast lỗi chung |

**Lưu ý tích hợp:**
- Sau khi thành công: cập nhật local state, không cần refetch
- Hiệu lực ngay lập tức — lần SLA job tiếp theo (sau tối đa 5 phút) sẽ áp dụng cấu hình mới

---

## SignalR — Kết nối real-time

> SignalR cho phép server **push thông báo ngay lập tức** đến client mà không cần polling.

### Cài đặt

```bash
npm install @microsoft/signalr
```

### Kết nối hub

```typescript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl('/hubs/notifications', {
    // Truyền JWT token — SignalR WebSocket không hỗ trợ Authorization header
    // Server đọc từ query string ?access_token=...
    accessTokenFactory: () => localStorage.getItem('access_token') ?? ''
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // retry intervals (ms)
  .configureLogging(signalR.LogLevel.Warning)
  .build();
```

### Khởi động và lắng nghe sự kiện

```typescript
// Đăng ký handler TRƯỚC khi start
connection.on('ReceiveNotification', (notification: NotificationDto) => {
  // Thêm vào đầu danh sách local
  addNotificationToState(notification);
  // Tăng unread count nếu chưa đọc
  incrementUnreadCount();
  // Hiển thị toast
  showToast(notification);
});

connection.onreconnecting(() => {
  console.log('SignalR: đang kết nối lại...');
});

connection.onreconnected(() => {
  console.log('SignalR: đã kết nối lại');
  // Nên refetch unread-count để sync lại sau khi mất kết nối
  refetchUnreadCount();
});

connection.onclose(() => {
  console.log('SignalR: đã ngắt kết nối');
});

// Bắt đầu kết nối
await connection.start();
```

### Payload sự kiện `ReceiveNotification`

```typescript
// Nhận được khi có thông báo mới từ server
interface SignalRNotificationPayload {
  id: string
  type: NotificationType
  title: string
  body: string
  entityType: 'LEAD' | 'TICKET' | 'SYSTEM'
  entityId: string
  isRead: boolean       // luôn là false khi mới nhận
  createdAt: string     // ISO 8601
}
```

**Ví dụ payload thực tế:**
```json
{
  "id": "7ab85f64-5717-4562-b3fc-2c963f66afa6",
  "type": "NEW_LEAD",
  "title": "Lead mới được gán: LD-20260430-0015",
  "body": "Lead LD-20260430-0015 - Lê Thị C đã được gán cho bạn.",
  "entityType": "LEAD",
  "entityId": "feed1234-0000-0000-0000-000000000000",
  "isRead": false,
  "createdAt": "2026-04-30T10:22:00Z"
}
```

### Ngắt kết nối đúng cách

```typescript
// Khi user logout hoặc unmount app
await connection.stop();
```

### Xử lý token hết hạn

```typescript
// Nếu access_token hết hạn, connection.start() sẽ fail với lỗi 401.
// Xử lý bằng cách refresh token trước khi start lại:
connection.onclose(async (error) => {
  if (isTokenExpired()) {
    await refreshAccessToken();
    await connection.start();
  }
});
```

---

## Danh sách loại thông báo

| `type` | Trigger | Ai nhận | Điều hướng khi click |
|---|---|---|---|
| `NEW_LEAD` | Lead mới được gán cho nhân viên | Nhân viên được gán (SA/CS) + role TN (nếu cấu hình) | `/leads/{entityId}` |
| `SLA_WARNING` | Lead sắp hết hạn SLA (trước X giờ theo config) | Assigned user + role TN (nếu cấu hình) | `/leads/{entityId}` |
| `SLA_VIOLATED` | Lead đã vượt deadline SLA | Assigned user + role TN + QL (nếu cấu hình) | `/leads/{entityId}` |
| `ESCALATED` | Lead/ticket được escalate | Người nhận escalate + role TN/QL (nếu cấu hình) | `/leads/{entityId}` hoặc `/tickets/{entityId}` |
| `REASSIGNED` | Lead được reassign cho người mới | Người nhận mới | `/leads/{entityId}` |
| `FOLLOW_UP_DUE` | Follow-up task sắp đến giờ (30 phút trước) | User đặt lịch | `/leads/{entityId}` |

**Điều hướng theo `entityType`:**

```typescript
function getNotificationRoute(notification: NotificationDto): string {
  switch (notification.entityType) {
    case 'LEAD':   return `/leads/${notification.entityId}`;
    case 'TICKET': return `/tickets/${notification.entityId}`;
    default:       return '/dashboard';
  }
}
```

**Icon / màu sắc gợi ý theo type:**

| type | Icon | Màu |
|---|---|---|
| `NEW_LEAD` | 📋 UserPlus | Xanh lá (`green`) |
| `SLA_WARNING` | ⚠️ Clock | Cam (`orange`) |
| `SLA_VIOLATED` | 🚨 AlertCircle | Đỏ (`red`) |
| `ESCALATED` | ⬆️ ArrowUp | Tím (`purple`) |
| `REASSIGNED` | 🔄 RefreshCw | Xanh dương (`blue`) |
| `FOLLOW_UP_DUE` | 🔔 Bell | Vàng (`yellow`) |

---

## Luồng UX khuyến nghị

### 1. Notification Bell (góc trên phải navbar — mọi role)

```
[🔔 7]  ← badge hiển thị unread count
  ↓ click
[Panel thông báo]
  - "Đánh dấu tất cả đã đọc" (nút)
  - Danh sách thông báo (scroll vô hạn / phân trang)
    - Item chưa đọc: nền nhạt hơn + chấm tròn màu xanh
    - Item đã đọc: bình thường
    - Click item → điều hướng đến lead/ticket + gọi PUT /{id}/read
```

**Cài đặt khởi tạo (khi app load):**
```typescript
// 1. Kết nối SignalR
await connection.start();

// 2. Fetch unread count để hiện badge
const count = await fetchUnreadCount();
setUnreadBadge(count);

// 3. (Optional) Prefetch trang đầu danh sách nếu panel hay mở
```

**Khi nhận SignalR `ReceiveNotification`:**
```typescript
connection.on('ReceiveNotification', (n) => {
  // Prepend vào list (nếu panel đang mở và ở trang 1)
  prependToList(n);
  // Tăng badge
  incrementBadge();
  // Toast ngắn gọn ở góc màn hình
  toast({
    title: n.title,
    description: n.body,
    type: toastVariant(n.type), // 'error' | 'warning' | 'success' | 'info'
    onClick: () => navigate(getNotificationRoute(n))
  });
});
```

---

### 2. QT-12: Trang cấu hình thông báo (chỉ QT)

**URL gợi ý:** `/admin/notification-configs`

**Layout:**
```
Loại thông báo          | Role nhận  | Trạng thái
---------------------------------------------------
NEW_LEAD                |            |
  ↳ TN (Trưởng nhóm)   |     TN     | [Toggle ON]
---------------------------------------------------
SLA_WARNING             |            |
  ↳ TN (Trưởng nhóm)   |     TN     | [Toggle ON]
---------------------------------------------------
SLA_VIOLATED            |            |
  ↳ TN (Trưởng nhóm)   |     TN     | [Toggle ON]
  ↳ QL (Quản lý CH)    |     QL     | [Toggle OFF]
---------------------------------------------------
ESCALATED               |            |
  ↳ TN (Trưởng nhóm)   |     TN     | [Toggle ON]
  ↳ QL (Quản lý CH)    |     QL     | [Toggle ON]
```

**Lưu ý:** Hiển thị disclaimer dưới bảng:
> *"Cấu hình này chỉ ảnh hưởng đến thông báo gửi theo role. Nhân viên được gán trực tiếp vào lead/ticket luôn nhận thông báo bất kể cấu hình trên."*

**Toggle handler:**
```typescript
async function toggleConfig(id: string, currentValue: boolean) {
  const newValue = !currentValue;
  // Optimistic update
  updateLocalState(id, { isEnabled: newValue });
  try {
    await api.put(`/api/notification-configs/${id}`, { isEnabled: newValue });
  } catch {
    // Rollback
    updateLocalState(id, { isEnabled: currentValue });
    toast.error('Không thể cập nhật cấu hình. Vui lòng thử lại.');
  }
}
```

---

### 3. Badge count strategy

```
Khởi động app:
  unreadCount = GET /api/notifications/unread-count

Nhận SignalR ReceiveNotification:
  unreadCount += 1

Click "Đánh dấu tất cả đã đọc":
  PUT /api/notifications/read-all
  → unreadCount = 0

Click 1 thông báo chưa đọc:
  PUT /api/notifications/{id}/read
  → unreadCount -= 1

Kết nối lại SignalR sau mất mạng:
  unreadCount = GET /api/notifications/unread-count  // sync lại
```

---

## Error codes tổng hợp

| Endpoint | Status | Code / Body | Xử lý UI |
|---|---|---|---|
| `PUT /{id}/read` | 404 | string message | Bỏ qua (không ảnh hưởng UX) |
| `PUT /{id}/read` | 403 | Forbidden | Không hiển thị — không nên xảy ra |
| `PUT /read-all` | 400 | string message | Toast lỗi chung |
| `PUT /notification-configs/{id}` | 404 | string message | Toast "Không tìm thấy cấu hình" + rollback toggle |
| SignalR connect | 401 | — | Refresh token → reconnect |
