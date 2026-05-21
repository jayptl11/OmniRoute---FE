# 🧠 OmniRoute FE — Tài Liệu Logic Frontend

> Tài liệu kỹ thuật mô tả kiến trúc, luồng dữ liệu, và logic chính của Frontend OmniRoute.

---

## 📁 Cấu Trúc Dự Án

```
src/
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
├── routes/                    # Routing + Route Guards
│   ├── index.tsx              # Khai báo toàn bộ routes
│   ├── AdminRoute.tsx         # Guard: role QT
│   ├── TvRoute.tsx            # Guard: role TV
│   ├── SaRoute.tsx            # Guard: role SA/SS
│   ├── DpRoute.tsx            # Guard: role DP
│   ├── CsRoute.tsx            # Guard: role CS
│   ├── TnRoute.tsx            # Guard: role TN
│   ├── QlRoute.tsx            # Guard: role QL
│   ├── BqlRoute.tsx           # Guard: role BQL
│   ├── PrivateRoute.tsx       # Redirect theo role
│   ├── PublicRoute.tsx        # Chặn nếu đã login
│   └── SignalRStarter.tsx     # Khởi động SignalR
├── pages/                     # UI Pages theo role
├── features/                  # Business logic (API + Hooks)
├── components/                # Shared UI components
├── layouts/                   # Layout wrappers
├── stores/                    # Global state (Zustand)
├── lib/                       # Utilities (axios, queryClient, signalr...)
└── types/                     # TypeScript type definitions
```

---

## ⚙️ Stack & Dependencies Chính

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|---------|
| React + TypeScript | 18+ | UI framework |
| Vite | 5+ | Build tool |
| React Router v6 | 6+ | Client-side routing |
| TanStack Query v5 | 5+ | Server state, caching, async |
| Zustand | 4+ | Global client state |
| Axios | 1+ | HTTP client |
| @microsoft/signalr | 8+ | WebSocket real-time |
| Sonner | 1+ | Toast notifications |
| Recharts | 2+ | Charts (BQL dashboard) |
| Lucide React | - | Icons |

---

## 🔗 Khởi Động Ứng Dụng (`App.tsx`)

```tsx
// App.tsx — entry wrapper
<QueryClientProvider client={queryClient}>
  <RouterProvider router={router} future={{ v7_startTransition: true }} />
  <Toaster position="top-right" richColors closeButton />
</QueryClientProvider>
```

- **QueryClientProvider**: cung cấp React Query context cho toàn app.
- **RouterProvider**: mount router với tất cả routes.
- **Toaster (Sonner)**: hiển thị toast thông báo toàn cục ở góc trên phải.

---

## 🔐 Authentication

### 1. Zustand Store — `authStore`

**File:** `src/stores/authStore.ts`

```ts
interface AuthState {
  user: AuthUser | null;       // { userId, email, username, roleId, roleName, lastLogin }
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth(data: LoginResponse): void;     // sau login thành công
  setTokens(access, refresh): void;      // sau refresh token
  logout(): void;
}
```

**Persistence:** sử dụng `zustand/middleware/persist` → lưu toàn bộ state vào `localStorage` với key `auth-storage`. Khi reload trang, auth state được khôi phục tự động.

**DevTools:** enabled với tên `auth-store` — debug qua Redux DevTools extension.

### 2. Axios Interceptors — `src/lib/axios.ts`

**Request interceptor:** tự động đính kèm `Authorization: Bearer <accessToken>` vào mỗi request.

**Response interceptor (401 handler):**
```
Nhận 401 → Có refreshToken?
  ├── Không → logout() + redirect /login
  └── Có → isRefreshing?
        ├── Đang refresh → queue request vào failedQueue
        └── Chưa → POST /api/auth/refresh-token
              ├── Thành công → setTokens() + processQueue() + retry request gốc
              └── Thất bại → processQueue(error) + logout() + redirect /login
```

**Token Refresh Queue:** tránh gọi refresh nhiều lần đồng thời. Các request thất bại trong lúc đang refresh sẽ được xếp vào `failedQueue` và retry sau khi có token mới.

**Error normalization:** mọi lỗi Axios đều được chuyển thành `AppError(message, errorCode, statusCode)`. Priority đọc message: `errors[]` (validation) → `errorMessage` → `message` → `error.message`.

### 3. Auth Hooks — `src/features/auth/hooks/`

Mỗi action auth là một `useMutation` riêng:

| Hook | API Endpoint | Hành động sau |
|------|-------------|--------------|
| `useLogin` | `POST /api/auth/login` | `setAuth(data)` + navigate `/` |
| `useRegister` | `POST /api/auth/register` | navigate `/verify-otp` |
| `useVerifyOtp` | `POST /api/auth/verify-otp` | navigate theo `purpose` (register → login, reset → reset-password) |
| `useResendOtp` | `POST /api/auth/resend-otp` | toast success |
| `useForgotPassword` | `POST /api/auth/forgot-password` | toast thông báo gửi email |
| `useResetPassword` | `POST /api/auth/reset-password` | navigate `/login` |
| `useLogout` | `POST /api/auth/logout` | `logout()` store + navigate `/login` |

### 4. OTP Flow

OTP page nhận state từ React Router navigation:
```ts
interface OtpPageState { email: string; flow: 'register' | 'reset'; }
```
- `flow === 'register'` → xác thực tài khoản mới → redirect `/login`
- `flow === 'reset'` → lấy `resetToken` → redirect `/reset-password` với state `{ resetToken }`

---

## 🗺️ Routing & Route Guards

### Cấu trúc Routes (`src/routes/index.tsx`)

```
/ (root)
├── PublicRoute (redirect nếu đã login)
│   └── AuthLayout
│       ├── /login
│       ├── /register
│       ├── /verify-otp
│       ├── /forgot-password
│       └── /reset-password
│
└── SignalRStarter (khởi động WS sau login)
    ├── AdminRoute  → /admin/** (role QT)
    ├── TvRoute     → /tv/**    (role TV)
    ├── SaRoute     → /sa/**    (role SA, SS)
    ├── DpRoute     → /dp/**    (role DP)
    ├── CsRoute     → /cs/**    (role CS)
    ├── TnRoute     → /tn/**    (role TN)
    ├── QlRoute     → /ql/**    (role QL)
    ├── BqlRoute    → /bql/**   (role BQL)
    └── PrivateRoute → /        (DashboardPage — fallback)
```

### Route Guard Logic

**`AdminRoute`** (ví dụ điển hình, các route khác tương tự):
```
Chưa login → /login
Login nhưng không phải QT → getDefaultRouteForRole(roleName)
QT → render <Outlet />
```

**`getDefaultRouteForRole(roleName)`:**
```ts
QT  → /admin/users
TV  → /tv/leads
SA/SS → /sa/leads
DP  → /dp/queue
CS  → /cs/tickets
TN  → /tn/overview
QL  → /ql/dashboard
BQL → /bql/dashboard
default → /
```

**`PublicRoute`:** kiểm tra `isAuthenticated` → nếu đã login, redirect tới default route của role thay vì hiển thị trang login/register.

**`PrivateRoute`:** kiểm tra login, sau đó redirect từng role về module đúng. Chỉ cho pass nếu role không khớp bất kỳ case nào (fallback về DashboardPage).

### Lazy Loading

Tất cả pages đều dùng `React.lazy()` + `<Suspense>` với `PageLoader` (spinner) làm fallback → code splitting tự động, chỉ load JS của page khi cần.

---

## 📡 Server State — React Query

**Config** (`src/lib/queryClient.ts`):
```ts
{
  staleTime: 30_000,  // data coi là fresh trong 30 giây
  retry: (failureCount, error) => {
    if (isAppError(error) && error.statusCode < 500) return false; // không retry 4xx
    return failureCount < 2;  // retry tối đa 2 lần với 5xx
  },
  mutations: { retry: false }
}
```

### Query Key Convention

Mỗi feature định nghĩa `*Keys` object để quản lý cache keys:

```ts
// Ví dụ: leadKeys (TV feature)
export const leadKeys = {
  all:       ['leads'],
  list:      (params) => ['leads', 'list', params],
  detail:    (id) => ['leads', 'detail', id],
  duplicate: (phone) => ['leads', 'duplicate', phone],
};
```

Khi mutation thành công, dùng `queryClient.invalidateQueries({ queryKey: leadKeys.all })` để invalidate cache → UI tự refetch.

### Polling Pattern

`useLeadDetail` có hỗ trợ polling khi lead còn ở trạng thái `New` (engine AI chưa phân loại xong):
```ts
refetchInterval: (query) => {
  const data = query.state.data;
  return data?.leadStatus === 'New' ? 3000 : false; // poll mỗi 3s
}
```

---

## 🌐 Feature Modules — Cấu Trúc

Mỗi feature module (TV, SA, DP, CS, TN, QL, BQL, Admin) có cấu trúc chuẩn:

```
features/<role>/
├── api/
│   └── <entity>Service.ts   # Axios calls thuần (không có state)
└── hooks/
    └── use<Entity>.ts       # useQuery + useMutation wrappers
```

**Service layer** chỉ lo gọi API:
```ts
// leadService.ts
export const leadService = {
  getLeads: (params?) => api.get('/api/leads', { params }).then(r => r.data),
  createLead: (data) => api.post('/api/leads', data).then(r => r.data),
  getLeadById: (id) => api.get(`/api/leads/${id}`).then(r => r.data),
  updateLead: (id, data) => api.put(`/api/leads/${id}`, data).then(r => r.data),
  checkDuplicate: (phone) => api.get('/api/leads/check-duplicate', { params: { phone } }).then(r => r.data),
};
```

**Hook layer** lo state management:
```ts
export function useLeads(params?) {
  return useQuery({ queryKey: leadKeys.list(params), queryFn: () => leadService.getLeads(params) });
}
export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => leadService.createLead(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKeys.all }),
  });
}
```

---

## 📋 Business Logic Đáng Chú Ý

### TV — Tạo Lead (Duplicate Check)

```
User nhập SĐT → onBlur → debounce 500ms → GET /api/leads/check-duplicate?phone=...
                                                  ↓
                                          hasDuplicate: true?
                                          ├── Hiển thị banner cảnh báo + link lead cũ
                                          └── false → không hiển thị gì

User nhấn "Tạo lead" → POST /api/leads { ..., forceCreate: false }
                              ↓
                    isDuplicate && !forceCreate?
                    ├── true → hiển thị dialog confirm (Xem lead cũ | Tạo lead mới)
                    │         Nếu chọn "Tạo mới" → POST lại với forceCreate: true
                    └── false → navigate /tv/leads/:id
```

### SA — State Machine Chuyển Trạng Thái Lead

Quy tắc chuyển trạng thái hợp lệ (Business Rule BR-05):
```ts
const SALE_LEAD_VALID_TRANSITIONS = {
  Assigned:   ['Contacted', 'Lost', 'Cancelled'],
  Contacted:  ['InProgress', 'Lost', 'Cancelled'],
  InProgress: ['Won', 'Lost', 'Cancelled'],
};
```
UI chỉ hiển thị các nút tương ứng với trạng thái hợp lệ tiếp theo.

Khi chuyển sang `Lost`/`Won`/`Cancelled`, form yêu cầu nhập lý do:
- `Lost` → `lostReason`
- `Cancelled` → `cancelReason`
- `Won` → `wonDetails`

### DP — Dispatch Queue Filtering

Filter được giữ trong state cục bộ, chỉ apply khi user nhấn "Tìm kiếm" (không auto-search):
```ts
const [search, setSearch] = useState('');
const [appliedParams, setAppliedParams] = useState({ page:1, pageSize:20 });

const handleSearch = () => {
  const params = { page:1, pageSize:20 };
  if (search) params.search = search;
  if (priorityLevel) params.priorityLevel = priorityLevel;
  if (waitedMinutesInput) params.waitedMoreThanMinutes = parseInt(waitedMinutesInput);
  setAppliedParams(params);
};
```

### CS — SLA Warning Real-time trong List

```ts
function SlaCell({ ticket }) {
  if (ticket.slaViolated) return <span>⚠️ Vi phạm SLA</span>;

  const minsLeft = Math.floor((new Date(ticket.slaDeadline) - Date.now()) / 60000);
  if (minsLeft < 30) return <span>🕐 Sắp đến hạn</span>;

  return <span>{formatDate(ticket.slaDeadline)}</span>;
}
```

Row highlight theo mức độ khẩn cấp:
- `slaViolated` → class `rowViolated` (đỏ)
- `priorityLevel === 'High'` → `rowHigh` (vàng đậm)
- `priorityLevel === 'Medium'` → `rowMedium` (vàng nhạt)

### Admin — Khóa User Có Lead Active

```
Admin nhấn khóa user → toggleStatus.mutateAsync({ id, isActive: false })
                              ↓
                    API trả về { activeLeadCount }
                    ├── > 0 → setPendingToggle(user) → hiển thị dialog cảnh báo
                    │         Admin xác nhận → mutate lại để force lock
                    └── = 0 → khóa ngay
```

---

## 🔔 Real-time Notifications — SignalR

### Cấu hình Connection (`src/lib/signalr.ts`)

```ts
export const notificationConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${VITE_API_URL}/hubs/notifications`, {
    // JWT qua query string (WebSocket không hỗ trợ Authorization header)
    accessTokenFactory: () => authStore.getState().accessToken ?? '',
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // retry intervals ms
  .configureLogging(signalR.LogLevel.Warning)
  .build();
```

**Singleton:** một HubConnection duy nhất cho toàn app.

### Lifecycle (`src/features/notifications/hooks/useSignalR.ts`)

```
Component mount (SignalRStarter) → useSignalR()
                                         ↓
                               isAuthenticated?
                               ├── false → stop connection
                               └── true → đăng ký handler 'ReceiveNotification'
                                          → start connection nếu Disconnected
                                               ↓
                               Nhận notification → prependNotification() + incrementUnread()
                                                 → toast với action "Xem" → navigate đến entity
                               Reconnected → sync lại unreadCount từ API
                               Unmount → off('ReceiveNotification')
```

### Notification Routing Theo Role

```ts
function getNotificationRoute(n: NotificationDto, roleName: string): string {
  if (n.entityType === 'LEAD') {
    switch (role) {
      case 'tv': return `/tv/leads/${n.entityId}`;
      case 'sa': return `/sa/leads/${n.entityId}`;
      case 'dp': return `/dp/queue/${n.entityId}`;
      case 'tn': return `/tn/leads`;
      case 'ql': return `/ql/leads`;
    }
  }
  if (n.entityType === 'TICKET') {
    if (role === 'cs') return `/cs/tickets/${n.entityId}`;
  }
  return '/';
}
```

### Notification Store (`src/stores/notificationStore.ts`)

```ts
interface NotificationState {
  unreadCount: number;
  notifications: NotificationDto[];  // cache trang 1 của panel
  totalCount: number;

  // Actions
  setUnreadCount(count): void;
  incrementUnread(): void;       // khi nhận notification mới qua WS
  decrementUnread(): void;
  resetUnread(): void;
  prependNotification(item): void;  // thêm vào đầu khi nhận WS
  appendNotifications(items): void; // load more pagination
  markOneRead(id): void;
  markAllRead(): void;
}
```

---

## 🎨 Design System — Glass Components

### `GlassSelect` (`src/components/glass/GlassSelect.tsx`)

Custom dropdown thay thế `<select>` HTML native, dùng **Portal** để tránh bị clip bởi `overflow: hidden`:

```
User click trigger → tính toán getBoundingClientRect()
                   → render dropdown vào document.body (Portal)
                   → position: absolute với { top, left, width } chính xác
```

**Close triggers:** click ngoài, scroll ngoài, resize window.

**Props:**
```ts
interface GlassSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}
```

### `GlassButton` (`src/components/glass/GlassButton.tsx`)

Button với glassmorphism styling, forward-compatible với HTML button props.

---

## 🗂️ Type System

### Core Types

**`PaginatedResponse<T>`** (dùng cho tất cả list API):
```ts
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
```

**`AppError`** (normalized error từ API):
```ts
class AppError extends Error {
  constructor(message: string, public code: string, public statusCode?: number) {}
}
```

**`LeadStatus` enum:**
```
New → Assigned / PendingDispatch / PendingAssignment
PendingDispatch → (DP phân công) → Assigned
Assigned → Contacted → InProgress → Won / Lost / Cancelled
```

**`LeadChannel`:** `Hotline | Walkin | Webform | Chat | Email | Zalo | Referral`

**`NeedType`:** `SaleNew | SaleUpgrade | SaleRenew | CskhSupport | CskhComplaint | CskhWarranty | StoreVisit | Other`

### Types Per Domain

| File | Nội dung |
|------|---------|
| `types/leads.ts` | Lead, SaleLead, FollowUp, Performance (TV + SA) |
| `types/tickets.ts` | Ticket, TicketStatus, TicketPriority (CS) |
| `types/dispatch.ts` | DispatchQueue, DispatchHistory (DP) |
| `types/teamlead.ts` | TeamOverview, SlaViolation, MemberPerformance (TN) |
| `types/storemanager.ts` | StoreCapacity, StoreWorkload (QL) |
| `types/dashboard.ts` | KpiCards, RoutingKpi, DashboardOverview (BQL) |
| `types/admin.ts` | User, RoutingRule, Store, Team, SlaConfig, AiApiKey (QT) |
| `types/notifications.ts` | NotificationDto |
| `types/common.ts` | AppError, PaginatedResponse |

---

## 🌍 Environment Variables

| Biến | Mô tả |
|------|-------|
| `VITE_API_URL` | Base URL của Backend API (ví dụ: `https://api.omniroute.vn`) |

Dùng trong:
- `src/lib/axios.ts`: `axios.create({ baseURL: import.meta.env.VITE_API_URL })`
- `src/lib/signalr.ts`: `${import.meta.env.VITE_API_URL}/hubs/notifications`

---

## 🔄 Luồng Dữ Liệu Tổng Quan

```
User Action
    ↓
React Component (Page)
    ↓
Custom Hook (useQuery / useMutation)
    ↓
Service Layer (axios calls)
    ↓
API Interceptor (attach token, handle 401)
    ↓
Backend API
    ↓
Response → normalize error hoặc return data
    ↓
React Query Cache
    ↓
UI re-render
```

**Parallel flow — Real-time:**
```
Backend sự kiện xảy ra
    ↓
SignalR Hub push 'ReceiveNotification'
    ↓
useSignalR handler
    ↓
notificationStore.prependNotification() + incrementUnread()
    ↓
Sonner toast hiển thị + badge unread count update
    ↓
User click "Xem" → navigate đến entity
```

---

## 📌 Coding Conventions

1. **Feature-first structure:** mỗi domain (tv, sa, dp...) tự chứa API + hooks.
2. **Service vs Hook:** service = pure function gọi API; hook = wraps service với React Query.
3. **Query key factories:** dùng `*Keys` object để tránh magic strings, dễ invalidate đúng scope.
4. **CSS Modules:** mỗi component có file `.module.css` riêng, không dùng inline style ngoại trừ dynamic values (width%, color...).
5. **Error handling:** luôn dùng `extractErrorMessage(error)` khi hiển thị lỗi ra toast.
6. **Pagination:** mặc định `pageSize = 20`, dùng `page` param để phân trang server-side.
7. **Debounce search:** search input dùng debounce 400ms trước khi gửi API.
8. **Type exports:** tất cả API request/response types được export từ `src/types/`.

---

*Tài liệu này được sinh từ source code thực tế của OmniRoute FE tại thời điểm 05/2026.*
