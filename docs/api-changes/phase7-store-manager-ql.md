# Tài liệu tích hợp Frontend — Phase 7: Quản lý đơn vị (QL)

> **Dành cho:** Frontend AI / Developer tích hợp giao diện cho vai trò **QL (Store Manager)**  
> **Base URL:** `/api`  
> **Auth:** Tất cả endpoints đều yêu cầu `Authorization: Bearer <token>` — người dùng phải có role `QL`  
> **Ngày cập nhật:** 2026-04-29

---

## Mục lục

- [Types TypeScript](#types-typescript)
- [API 1 — Danh sách nhân sự (QL-06)](#api-1--danh-sách-nhân-sự-ql-06)
- [API 2 — Tìm kiếm user để thêm vào đơn vị (QL-07 helper)](#api-2--tìm-kiếm-user-để-thêm-vào-đơn-vị-ql-07-helper)
- [API 3 — Thêm nhân sự (QL-07)](#api-3--thêm-nhân-sự-ql-07)
- [API 4 — Xóa nhân sự (QL-08)](#api-4--xóa-nhân-sự-ql-08)
- [API 5 — Workload nhân sự (QL-02)](#api-5--workload-nhân-sự-ql-02)
- [API 6 — Năng lực tiếp nhận đơn vị (QL-09)](#api-6--năng-lực-tiếp-nhận-đơn-vị-ql-09)
- [API 7 — Danh sách lead của đơn vị (QL-01)](#api-7--danh-sách-lead-của-đơn-vị-ql-01)
- [API 8 — Reassign lead (QL-03)](#api-8--reassign-lead-ql-03)
- [API 9 — Lịch sử xử lý lead (QL-05)](#api-9--lịch-sử-xử-lý-lead-ql-05)
- [API 10 — Báo cáo hiệu quả đơn vị (QL-04)](#api-10--báo-cáo-hiệu-quả-đơn-vị-ql-04)
- [API 11 — Ghi chú nội bộ trên lead](#api-11--ghi-chú-nội-bộ-trên-lead)
- [Enum values tham chiếu](#enum-values-tham-chiếu)
- [Error codes tổng hợp](#error-codes-tổng-hợp)
- [Luồng UX khuyến nghị](#luồng-ux-khuyến-nghị)

---

## Types TypeScript

```typescript
// Pagination wrapper — dùng cho tất cả endpoint có phân trang
interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

// API 1 — danh sách nhân sự
interface StoreStaffDto {
  userId: string          // uuid
  fullName: string
  roleName: string | null // "SA" | "CS" | "DP"
  isActive: boolean
  currentWorkload: number // số lead đang active
  lastAssignedAt: string | null // ISO 8601 datetime
}

// API 2 — kết quả tìm kiếm user để thêm
interface AddableStoreUserDto {
  userId: string
  fullName: string
  username: string
  roleName: string | null
  hasStore: boolean // true = đang thuộc đơn vị khác (xem lưu ý UX)
}

// API 5 — workload chi tiết từng nhân sự
interface StoreStaffWorkloadDto {
  userId: string
  fullName: string
  roleName: string | null
  isActive: boolean
  currentWorkload: number  // lead đang active
  slaViolatedCount: number // số lead active đang vi phạm SLA
  completedCount: number   // tổng lead đã hoàn tất (Won + Lost + Cancelled)
}

// API 6 — năng lực tiếp nhận
interface StoreCapacityResultDto {
  storeId: string
  storeCode: string
  storeName: string
  address: string | null
  region: string | null
  maxCapacity: number     // max_capacity từ DB
  activeLeads: number     // số lead đang active trong đơn vị
  availableSlots: number  // = maxCapacity - activeLeads (có thể âm nếu quá tải)
  isOverCapacity: boolean // activeLeads > maxCapacity
  isNearCapacity: boolean // availableSlots / maxCapacity < 20%
}

// API 7 — một dòng trong danh sách lead
interface StoreLeadListItemDto {
  leadId: string
  leadCode: string          // ví dụ: "LEAD-0042"
  customerName: string
  customerPhone: string
  needType: string | null
  leadStatus: LeadStatus    // xem enum bên dưới
  priorityLevel: string | null // "HIGH" | "MEDIUM" | "LOW"
  slaDeadline: string | null   // ISO 8601 datetime
  slaViolated: boolean
  assignedUserId: string | null
  assignedUserName: string | null
}

// API 9 — một dòng trong lịch sử
interface StoreLeadHistoryItemDto {
  logId: string
  leadId: string
  leadCode: string | null
  customerName: string | null
  customerPhone: string | null
  action: string           // ví dụ: "LEAD_REASSIGNED", "STATUS_CHANGED", "NOTE_ADDED"
  oldValue: string | null
  newValue: string | null
  note: string | null
  performedBy: string | null  // uuid
  performedByName: string | null
  performedAt: string          // ISO 8601 datetime
}

// API 10 — báo cáo đơn vị
interface StoreReportDto {
  period: string            // "week" | "month" | "quarter" | "custom"
  periodStart: string       // ISO 8601 datetime
  periodEnd: string         // ISO 8601 datetime
  totalLeads: number
  byStatus: Record<string, number> // { "New": 5, "Won": 12, ... }
  slaAchievedCount: number
  slaViolatedCount: number
  slaAchievedRate: number | null   // phần trăm 0-100, null nếu totalLeads = 0
  wonCount: number
  winRate: number | null           // phần trăm 0-100
  dailyTrend: DailyLeadTrendDto[]
  generatedAt: string              // ISO 8601 datetime
}

interface DailyLeadTrendDto {
  date: string  // "YYYY-MM-DD"
  count: number
}

// Error response shape (dùng chung cho tất cả lỗi 4xx)
interface ApiError {
  errorCode: string
  errorMessage: string
}
```

---

## API 1 — Danh sách nhân sự (QL-06)

### `GET /api/my-store/members`

Lấy danh sách toàn bộ nhân sự thuộc đơn vị của QL đang đăng nhập.  
Không cần tham số, scope tự động theo token.

**Response `200 OK`:**
```json
[
  {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "fullName": "Nguyễn Văn A",
    "roleName": "SA",
    "isActive": true,
    "currentWorkload": 5,
    "lastAssignedAt": "2026-04-28T10:30:00Z"
  }
]
```

**Lưu ý UX:**
- `currentWorkload` > 0 → hiển thị badge số lượng lead đang xử lý
- `isActive = false` → hiển thị tag "Đã khóa", disable nút reassign
- `lastAssignedAt = null` → hiển thị "Chưa có lead"

---

## API 2 — Tìm kiếm user để thêm vào đơn vị (QL-07 helper)

### `GET /api/my-store/members/search?q={keyword}`

Tìm user có thể thêm vào đơn vị (chỉ trả về role SA, CS, DP). Dùng cho dropdown/autocomplete trước khi thêm.

**Query params:**
| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `q` | string | Không | Tìm theo tên đầy đủ hoặc username. Nếu bỏ trống trả về 30 kết quả đầu. |

**Response `200 OK`:**
```json
[
  {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "fullName": "Trần Thị B",
    "username": "ttb",
    "roleName": "SA",
    "hasStore": false
  },
  {
    "userId": "9ba85f64-5717-4562-b3fc-2c963f66afa6",
    "fullName": "Lê Văn C",
    "username": "lvc",
    "roleName": "DP",
    "hasStore": true
  }
]
```

**Lưu ý UX:**
- `hasStore = true` → user đang thuộc đơn vị **khác**. Có thể hiển thị icon cảnh báo nhưng **vẫn cho phép chọn** — server sẽ trả về `IN_OTHER_STORE` (400) nếu QL cố thêm, lúc đó hiển thị thông báo tương ứng.
- Tối đa 30 kết quả. Nên debounce input ≥ 300ms.

---

## API 3 — Thêm nhân sự (QL-07)

### `POST /api/my-store/members`

Thêm một user vào đơn vị. Scope đơn vị lấy tự động từ token.

**Request Body:**
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

| Field | Type | Bắt buộc | Validation |
|---|---|---|---|
| `userId` | uuid | Có | NotEmpty |

**Response `204 No Content`** — thành công, không có body.

**Error responses:**
| Status | errorCode | Ý nghĩa | Xử lý UI |
|---|---|---|---|
| 404 | `USER_NOT_FOUND` | userId không tồn tại | Toast "Không tìm thấy người dùng" |
| 404 | `NO_STORE` | QL chưa được gán store | Không nên xảy ra nếu auth đúng |
| 400 | `USER_INACTIVE` | User bị khóa | Toast "Người dùng đã bị khóa" |
| 400 | `INVALID_ROLE` | Role không phải SA/CS/DP | Toast "Role không hợp lệ" |
| 400 | `ALREADY_IN_STORE` | User đã là thành viên đơn vị này | Toast "Nhân viên đã có mặt trong đơn vị" |
| 400 | `IN_OTHER_STORE` | User đang thuộc đơn vị khác | Toast "Nhân viên đang thuộc đơn vị khác, cần xóa khỏi đơn vị đó trước" |

**Sau khi thành công:** Refetch `GET /api/my-store/members`.

---

## API 4 — Xóa nhân sự (QL-08)

### `DELETE /api/my-store/members/{userId}`

Xóa nhân sự khỏi đơn vị. Không có request body.

**Path param:**
| Param | Type | Mô tả |
|---|---|---|
| `userId` | uuid | ID của nhân sự cần xóa |

**Response `204 No Content`** — thành công.

**Error responses:**
| Status | errorCode | Ý nghĩa | Xử lý UI |
|---|---|---|---|
| **409** | `ACTIVE_LEADS_WARNING` | Nhân sự còn lead đang xử lý | Hiển thị dialog cảnh báo (xem bên dưới) |
| 404 | `USER_NOT_FOUND` | userId không tồn tại | Toast "Không tìm thấy người dùng" |
| 404 | `USER_NOT_IN_STORE` | User không thuộc đơn vị này | Toast "Nhân viên không thuộc đơn vị" |
| 404 | `NO_STORE` | QL chưa được gán store | Không nên xảy ra |

**Xử lý `409 ACTIVE_LEADS_WARNING`:**
> Khi nhận được 409, hiển thị modal/dialog với nội dung:
> _"Nhân viên này còn lead đang xử lý. Bạn cần reassign toàn bộ lead cho người khác trước khi xóa khỏi đơn vị."_  
> Button: **[Đi đến danh sách lead]** (navigate đến trang lead, filter `assignedUserId = userId`) + **[Hủy]**

---

## API 5 — Workload nhân sự (QL-02)

### `GET /api/my-store/workload`

Bảng workload + chỉ số hiệu suất của từng nhân sự trong đơn vị.

**Response `200 OK`:**
```json
[
  {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "fullName": "Nguyễn Văn A",
    "roleName": "SA",
    "isActive": true,
    "currentWorkload": 8,
    "slaViolatedCount": 2,
    "completedCount": 45
  }
]
```

**Lưu ý UX:**
- `slaViolatedCount > 0` → highlight ô đó màu đỏ/cam
- `currentWorkload = 0` → nhân sự rảnh, ưu tiên suggest khi reassign
- `isActive = false` → grey out row

---

## API 6 — Năng lực tiếp nhận đơn vị (QL-09)

### `GET /api/my-store/capacity`

Thông tin năng lực đơn vị: max_capacity so với số lead đang active.

**Response `200 OK`:**
```json
{
  "storeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "storeCode": "HN-001",
  "storeName": "Chi nhánh Hà Nội 1",
  "address": "123 Phố Huế, Hà Nội",
  "region": "Miền Bắc",
  "maxCapacity": 100,
  "activeLeads": 87,
  "availableSlots": 13,
  "isOverCapacity": false,
  "isNearCapacity": true
}
```

**Error responses:**
| Status | errorCode | Ý nghĩa |
|---|---|---|
| 404 | `STORE_NOT_FOUND` | Store của QL không tồn tại trong DB |

**Lưu ý UX:**
- `isOverCapacity = true` → banner đỏ "Đơn vị đang quá tải"
- `isNearCapacity = true` (và chưa quá tải) → banner vàng "Đơn vị gần đầy (còn `availableSlots` slot)"
- Hiển thị progress bar: `activeLeads / maxCapacity * 100%`

---

## API 7 — Danh sách lead của đơn vị (QL-01)

### `GET /api/store-leads`

Danh sách lead có phân trang và bộ lọc đầy đủ. Chỉ trả về lead thuộc đơn vị của QL.

**Query params:**
| Param | Type | Default | Mô tả |
|---|---|---|---|
| `search` | string | — | Tìm theo tên khách hàng hoặc số điện thoại |
| `status` | string | — | Lọc theo `LeadStatus` (xem enum) |
| `priorityLevel` | string | — | `"HIGH"` \| `"MEDIUM"` \| `"LOW"` |
| `channel` | string | — | Kênh dẫn lead (giá trị tùy theo data) |
| `assignedUserId` | uuid | — | Lọc theo nhân sự được giao |
| `dateFrom` | datetime | — | ISO 8601, filter theo `CreatedAt` |
| `dateTo` | datetime | — | ISO 8601 |
| `page` | int | `1` | Trang hiện tại |
| `pageSize` | int | `20` | Số item mỗi trang |

**Response `200 OK`:**
```json
{
  "items": [
    {
      "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "leadCode": "LEAD-0042",
      "customerName": "Phạm Thị D",
      "customerPhone": "0909123456",
      "needType": "Mua nhà",
      "leadStatus": "Assigned",
      "priorityLevel": "HIGH",
      "slaDeadline": "2026-04-30T17:00:00Z",
      "slaViolated": false,
      "assignedUserId": "9ba85f64-5717-4562-b3fc-2c963f66afa6",
      "assignedUserName": "Nguyễn Văn A"
    }
  ],
  "totalCount": 87,
  "page": 1,
  "pageSize": 20
}
```

**Lưu ý UX:**
- `slaViolated = true` → highlight row màu đỏ
- `slaDeadline` gần hết hạn (< 2 giờ) → icon cảnh báo
- `assignedUserId = null` → hiển thị "Chưa phân công"
- Sort mặc định từ server: priority DESC, slaDeadline ASC (lead quan trọng + sắp hết hạn lên đầu)
- Filter `assignedUserId` hữu ích khi xem lead của 1 nhân sự cụ thể (ví dụ: sau khi nhận `409 ACTIVE_LEADS_WARNING`)

---

## API 8 — Reassign lead (QL-03)

### `PATCH /api/store-leads/{leadId}/reassign`

Chuyển lead từ nhân sự này sang nhân sự khác trong **cùng đơn vị**.

**Path param:**
| Param | Type | Mô tả |
|---|---|---|
| `leadId` | uuid | ID của lead cần reassign |

**Request Body:**
```json
{
  "newUserId": "9ba85f64-5717-4562-b3fc-2c963f66afa6",
  "reason": "Nhân viên cũ nghỉ phép, chuyển cho người có chuyên môn phù hợp"
}
```

| Field | Type | Bắt buộc | Validation |
|---|---|---|---|
| `newUserId` | uuid | Có | NotEmpty — phải là thành viên của cùng đơn vị |
| `reason` | string | Có | NotEmpty, tối đa 500 ký tự |

**Response `204 No Content`** — thành công.

**Sau khi thành công:**
- SLA deadline được **tính lại từ NOW** (business rule BR-03)
- Notification gửi đến nhân sự mới
- ActivityLog ghi action `LEAD_REASSIGNED`

**Error responses:**
| Status | errorCode | Ý nghĩa | Xử lý UI |
|---|---|---|---|
| 404 | `LEAD_NOT_FOUND` | leadId không tồn tại | Toast "Không tìm thấy lead" |
| 404 | `NEW_USER_NOT_FOUND` | newUserId không tồn tại | Toast "Không tìm thấy nhân sự" |
| 400 | `LEAD_NOT_IN_STORE` | Lead không thuộc đơn vị này | Toast "Lead không thuộc đơn vị của bạn" |
| 400 | `NEW_USER_NOT_IN_STORE` | newUserId không thuộc đơn vị | Toast "Nhân sự không thuộc đơn vị của bạn" |
| 400 | `LEAD_TERMINAL_STATUS` | Lead đã ở trạng thái cuối (Won/Lost/Cancelled) | Toast "Lead đã đóng, không thể reassign" |
| 422 | Validation error | Thiếu field hoặc reason quá dài | Hiển thị lỗi validation inline |

**Gợi ý flow UX reassign:**
1. QL click "Reassign" trên một lead
2. Mở modal, hiển thị dropdown nhân sự (lấy từ `GET /api/my-store/members`, filter `isActive = true`)
3. Sắp xếp dropdown theo `currentWorkload` tăng dần (nhân sự ít việc nhất lên đầu — lấy từ `GET /api/my-store/workload`)
4. QL nhập lý do (textarea, required)
5. Submit `PATCH /api/store-leads/{leadId}/reassign`
6. Refetch danh sách lead

---

## API 9 — Lịch sử xử lý lead (QL-05)

### `GET /api/store-leads/history`

Audit trail — toàn bộ hành động trên lead của đơn vị (hoặc lọc theo nhân sự).

**Query params:**
| Param | Type | Default | Mô tả |
|---|---|---|---|
| `userId` | uuid | — | Lọc theo nhân sự thực hiện hành động |
| `dateFrom` | datetime | — | ISO 8601 |
| `dateTo` | datetime | — | ISO 8601 |
| `page` | int | `1` | |
| `pageSize` | int | `20` | |

**Response `200 OK`:**
```json
{
  "items": [
    {
      "logId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "leadId": "9ba85f64-5717-4562-b3fc-2c963f66afa6",
      "leadCode": "LEAD-0042",
      "customerName": "Phạm Thị D",
      "customerPhone": "0909123456",
      "action": "LEAD_REASSIGNED",
      "oldValue": "Nguyễn Văn A",
      "newValue": "Trần Thị B",
      "note": "Nhân viên cũ nghỉ phép",
      "performedBy": "abc85f64-5717-4562-b3fc-2c963f66afa6",
      "performedByName": "QL Trần Minh C",
      "performedAt": "2026-04-28T09:15:00Z"
    }
  ],
  "totalCount": 320,
  "page": 1,
  "pageSize": 20
}
```

**Một số giá trị `action` phổ biến:**
| action | Ý nghĩa |
|---|---|
| `LEAD_REASSIGNED` | Lead được chuyển nhân sự |
| `STATUS_CHANGED` | Trạng thái lead thay đổi |
| `NOTE_ADDED` | Ghi chú nội bộ được thêm |
| `STORE_STAFF_ADDED` | Thêm nhân sự vào đơn vị |
| `STORE_STAFF_REMOVED` | Xóa nhân sự khỏi đơn vị |

**Lưu ý UX:**
- Hiển thị dạng timeline, sắp xếp `performedAt` DESC (mới nhất lên đầu — server đã sort)
- `oldValue → newValue` dùng để hiển thị diff inline

---

## API 10 — Báo cáo hiệu quả đơn vị (QL-04)

### `GET /api/store-leads/report`

Báo cáo tổng hợp: tổng lead, SLA, win rate, trend theo ngày.

**Query params:**
| Param | Type | Default | Mô tả |
|---|---|---|---|
| `period` | string | `"month"` | `"week"` \| `"month"` \| `"quarter"` \| `"custom"` |
| `dateFrom` | datetime | — | Bắt buộc nếu `period = "custom"` |
| `dateTo` | datetime | — | Bắt buộc nếu `period = "custom"` |

**Response `200 OK`:**
```json
{
  "period": "month",
  "periodStart": "2026-04-01T00:00:00Z",
  "periodEnd": "2026-04-30T23:59:59Z",
  "totalLeads": 87,
  "byStatus": {
    "New": 5,
    "Assigned": 12,
    "Contacted": 8,
    "InProgress": 15,
    "Won": 30,
    "Lost": 10,
    "Cancelled": 7
  },
  "slaAchievedCount": 72,
  "slaViolatedCount": 15,
  "slaAchievedRate": 82.76,
  "wonCount": 30,
  "winRate": 34.48,
  "dailyTrend": [
    { "date": "2026-04-01", "count": 4 },
    { "date": "2026-04-02", "count": 6 }
  ],
  "generatedAt": "2026-04-29T14:00:00Z"
}
```

**Lưu ý UX:**
- `slaAchievedRate` và `winRate` có thể là `null` nếu `totalLeads = 0` — tránh chia 0 ở FE
- `byStatus` là object động, key là tên enum `LeadStatus` — iterate để render chart
- `dailyTrend` dùng để vẽ line chart / bar chart theo ngày
- Period mặc định `month` = tháng hiện tại từ ngày 1 đến hôm nay

---

## API 11 — Ghi chú nội bộ trên lead

### `POST /api/store-leads/{leadId}/internal-notes`

QL thêm ghi chú nội bộ vào lead (chỉ TN/QL/QT thấy được, khách hàng và SA không thấy).

**Path param:**
| Param | Type | Mô tả |
|---|---|---|
| `leadId` | uuid | ID của lead |

**Request Body:**
```json
{
  "content": "Khách đang cân nhắc, dự kiến chốt trong tuần tới."
}
```

| Field | Type | Bắt buộc | Validation |
|---|---|---|---|
| `content` | string | Có | NotEmpty |

**Response `204 No Content`** — thành công.

**Error responses:**
| Status | errorCode | Ý nghĩa |
|---|---|---|
| 404 | `LEAD_NOT_FOUND` | leadId không tồn tại |
| 400 | Validation error | `content` trống |

---

## Enum values tham chiếu

### `LeadStatus`
```
New | Assigned | PendingDispatch | PendingAssignment | Contacted | InProgress | Won | Lost | Cancelled
```

| Value | Nghĩa |
|---|---|
| `New` | Lead mới, chưa phân công |
| `Assigned` | Đã phân công cho nhân sự |
| `PendingDispatch` | Chờ dispatch |
| `PendingAssignment` | Chờ phân công lại |
| `Contacted` | Đã liên hệ khách |
| `InProgress` | Đang xử lý |
| `Won` | Chốt thành công |
| `Lost` | Thất bại |
| `Cancelled` | Hủy |

**Terminal statuses** (lead đã đóng, không thể reassign): `Won`, `Lost`, `Cancelled`  
**Active statuses** (tính vào workload và capacity): `Assigned`, `Contacted`, `InProgress`, `PendingAssignment`, `PendingDispatch`

---

## Error codes tổng hợp

| errorCode | HTTP | Endpoint | Xử lý UI |
|---|---|---|---|
| `NO_STORE` | 400/404 | Tất cả | "Tài khoản chưa được gán vào đơn vị" (không nên xảy ra nếu auth đúng) |
| `STORE_NOT_FOUND` | 404 | GET /capacity | "Không tìm thấy thông tin cửa hàng" |
| `USER_NOT_FOUND` | 404 | POST/DELETE /members | "Không tìm thấy người dùng" |
| `USER_INACTIVE` | 400 | POST /members | "Người dùng đã bị khóa, không thể thêm" |
| `INVALID_ROLE` | 400 | POST /members | "Role không hợp lệ (chỉ SA/CS/DP)" |
| `ALREADY_IN_STORE` | 400 | POST /members | "Nhân viên đã có mặt trong đơn vị" |
| `IN_OTHER_STORE` | 400 | POST /members | "Nhân viên đang thuộc đơn vị khác" |
| `USER_NOT_IN_STORE` | 404 | DELETE /members | "Nhân viên không thuộc đơn vị này" |
| `ACTIVE_LEADS_WARNING` | **409** | DELETE /members | Hiển thị dialog cảnh báo, redirect đến danh sách lead |
| `LEAD_NOT_FOUND` | 404 | PATCH/POST leads | "Không tìm thấy lead" |
| `NEW_USER_NOT_FOUND` | 404 | PATCH reassign | "Không tìm thấy nhân sự mới" |
| `LEAD_NOT_IN_STORE` | 400 | PATCH reassign | "Lead không thuộc đơn vị của bạn" |
| `NEW_USER_NOT_IN_STORE` | 400 | PATCH reassign | "Nhân sự không thuộc đơn vị của bạn" |
| `LEAD_TERMINAL_STATUS` | 400 | PATCH reassign | "Lead đã đóng, không thể reassign" |

**Validation errors (422):** Server trả về array `errors` với message từng field — hiển thị inline dưới input tương ứng.

---

## Luồng UX khuyến nghị

### Trang "Nhân sự đơn vị" (QL-06 + QL-07 + QL-08)

```
[GET /api/my-store/members]
    ↓ render table
    
Nút "Thêm nhân sự" → mở modal search
    → [GET /api/my-store/members/search?q=...]  (debounce 300ms)
    → chọn user → [POST /api/my-store/members]
    → 204: refetch members
    → 4xx: hiển thị errorMessage

Nút "Xóa" trên row
    → confirm dialog
    → [DELETE /api/my-store/members/{userId}]
    → 204: refetch members
    → 409 ACTIVE_LEADS_WARNING: modal cảnh báo + link đến lead list filter
```

### Trang "Lead đơn vị" (QL-01 + QL-03)

```
[GET /api/store-leads?page=1&pageSize=20]
    ↓ render table + filter bar
    
Filter bar: search, status dropdown, priorityLevel, assignedUserId, dateRange
    → thay đổi filter → [GET /api/store-leads?...]

Nút "Reassign" trên row
    → mở modal
    → song song: [GET /api/my-store/members] + [GET /api/my-store/workload]
    → merge: tạo dropdown sort theo currentWorkload ASC
    → QL chọn nhân sự + nhập reason
    → [PATCH /api/store-leads/{leadId}/reassign]
    → 204: refetch lead list + đóng modal
```

### Trang "Báo cáo" (QL-04)

```
Tabs: Tuần này | Tháng này | Quý này | Tùy chỉnh
    → [GET /api/store-leads/report?period=week|month|quarter]
    → Custom: date picker → [GET /api/store-leads/report?period=custom&dateFrom=...&dateTo=...]
    
Layout:
    - Row 1: KPI cards (TotalLeads, SlaAchievedRate%, WinRate%)
    - Row 2: Bar chart ByStatus
    - Row 3: Line chart DailyTrend
    - Row 4: Capacity widget [GET /api/my-store/capacity]
```
