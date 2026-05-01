# Tài liệu tích hợp Frontend — Phase 9: Dashboard & Báo cáo lãnh đạo

> **Dành cho:** Frontend AI / Developer tích hợp giao diện cho vai trò **BQL, QT, TN, QL**
> **Base URL:** `/api`
> **Auth:** Tất cả endpoints đều yêu cầu `Authorization: Bearer <token>`
> **Ngày cập nhật:** 2026-05-01

---

## Mục lục

- [Phân quyền theo role](#phân-quyền-theo-role)
- [Types TypeScript](#types-typescript)
  - [Shared](#shared)
  - [QT — Audit & System Stats](#qt--audit--system-stats)
  - [BQL — Dashboard](#bql--dashboard)
- [API QT — Audit & Thống kê hệ thống](#api-qt--audit--thống-kê-hệ-thống)
  - [API 1 — Xem log hệ thống (QT-13)](#api-1--xem-log-hệ-thống-qt-13)
  - [API 2 — Thống kê hoạt động hệ thống (QT-14)](#api-2--thống-kê-hoạt-động-hệ-thống-qt-14)
- [API BQL — Dashboard lãnh đạo](#api-bql--dashboard-lãnh-đạo)
  - [API 3 — Dashboard tổng hợp (BQL-01)](#api-3--dashboard-tổng-hợp-bql-01)
  - [API 4 — Drill-down (BQL-02)](#api-4--drill-down-bql-02)
  - [API 5 — KPI phân luồng (BQL-03)](#api-5--kpi-phân-luồng-bql-03)
  - [API 6 — So sánh hiệu suất đơn vị (BQL-04)](#api-6--so-sánh-hiệu-suất-đơn-vị-bql-04)
  - [API 7 — Báo cáo bán hàng (BQL-05)](#api-7--báo-cáo-bán-hàng-bql-05)
  - [API 8 — Xuất báo cáo Excel (BQL-06)](#api-8--xuất-báo-cáo-excel-bql-06)
- [Enum values tham chiếu](#enum-values-tham-chiếu)
- [Error codes](#error-codes)
- [Luồng UX khuyến nghị](#luồng-ux-khuyến-nghị)

---

## Phân quyền theo role

| Endpoint | QT | BQL | TN | QL |
|---|:---:|:---:|:---:|:---:|
| `GET /api/audit/logs` | ✅ | ❌ | ❌ | ❌ |
| `GET /api/audit/system-stats` | ✅ | ❌ | ❌ | ❌ |
| `GET /api/dashboard/overview` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/dashboard/drill-down` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/dashboard/routing-kpi` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/dashboard/unit-comparison` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/dashboard/sales-report` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/dashboard/export` | ✅ | ✅ | ✅ | ✅ |

> **Lưu ý:** Nếu role không đủ quyền, server trả về `403 Forbidden`. FE nên ẩn menu/button dựa trên role từ JWT trước để tránh gọi API thừa.

---

## Types TypeScript

### Shared

```typescript
// Wrapper phân trang — dùng cho API 1
interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

// Period param — áp dụng cho tất cả API dashboard
type Period = 'week' | 'month' | 'quarter'
```

---

### QT — Audit & System Stats

```typescript
// API 1 — một dòng audit log
interface AuditLogDto {
  id: string              // uuid
  entityType: string      // 'LEAD' | 'TICKET' | 'USER' | 'RULE' | 'SYSTEM'
  entityId: string        // uuid của entity liên quan
  action: string          // ví dụ: 'STATUS_CHANGED', 'ASSIGNED', 'ESCALATED', 'CREATED'
  oldValue: string | null // JSON string trạng thái cũ
  newValue: string | null // JSON string trạng thái mới
  note: string | null     // ghi chú thêm (nếu có)
  performedBy: string | null     // uuid của user thực hiện (null = hệ thống)
  performedByName: string | null // tên hiển thị đầy đủ
  isInternal: boolean     // true = log nội bộ (TN ghi chú nội bộ, không hiện cho KH)
  performedAt: string     // ISO 8601 UTC
}

// API 2 — thống kê hệ thống theo kỳ
interface SystemStatsDto {
  period: string          // 'week' | 'month' | 'quarter'
  periodStart: string     // ISO 8601 UTC
  periodEnd: string       // ISO 8601 UTC
  totalLeadsProcessed: number
  autoRoutingSuccessRate: number  // 0–100 (%)
  defaultGroupHits: number        // số lead bị rơi vào DEFAULT_GROUP
  totalErrors: number             // số lỗi hệ thống (hiện tại luôn = 0)
  dailyTrend: DailyLeadStatsDto[]
  leadsByGroup: Record<string, number>  // { "Sale": 1800, "Cskh": 900, "StoreSupport": 228 }
  generatedAt: string     // ISO 8601 UTC
}

interface DailyLeadStatsDto {
  date: string            // 'YYYY-MM-DD'
  totalLeads: number
  autoRouted: number
  defaultGroupHits: number
}
```

---

### BQL — Dashboard

```typescript
// API 3 — dashboard tổng hợp
interface DashboardOverviewDto {
  period: string
  periodStart: string   // ISO 8601 UTC
  periodEnd: string     // ISO 8601 UTC
  kpiCards: KpiCardsDto
  leadsByChannel: Record<string, number>   // { "Hotline": 340, "Walkin": 210, ... }
  leadsByNeedType: Record<string, number>  // { "SaleNew": 500, "CskhSupport": 200, ... }
  dailyTrend: DailyTrendItemDto[]         // tối đa 30 ngày gần nhất
  top5Stores: TopStoreItemDto[]
  generatedAt: string
}

interface KpiCardsDto {
  totalLeadsToday: number
  totalLeadsThisWeek: number
  totalLeadsThisMonth: number
  slaAchievedRate: number | null    // 0–100 (%), null nếu không có data
  winRate: number | null            // 0–100 (%), tính trên Sale leads
  slaViolatedCount: number          // số lead đang vi phạm SLA (active)
}

interface DailyTrendItemDto {
  date: string     // 'YYYY-MM-DD'
  totalLeads: number
}

interface TopStoreItemDto {
  storeId: string  // uuid
  storeName: string
  leadCount: number
}

// API 4 — drill-down
interface DrillDownDto {
  level: string          // 'unit' | 'channel'
  entityId: string | null   // storeId hoặc channel name của item đang xem (null = top-level)
  entityName: string | null // tên cửa hàng hoặc kênh (null = top-level)
  periodStart: string
  periodEnd: string
  totalLeads: number
  byStatus: Record<string, number>     // { "Assigned": 120, "Won": 85, "Lost": 30, ... }
  children: DrillDownChildDto[]        // danh sách các item con (stores hoặc channels)
}

interface DrillDownChildDto {
  label: string    // tên cửa hàng hoặc kênh
  count: number
}

// API 5 — KPI phân luồng
interface RoutingKpiDto {
  period: string
  periodStart: string
  periodEnd: string
  ruleMatchRate: number           // 0–100 (%), % lead được route đúng rule
  avgTimeToAssignMinutes: number | null  // phút trung bình từ tạo lead → được gán
  slaAchievedRate: number | null  // 0–100 (%)
  escalationRate: number | null   // 0–100 (%), % lead bị escalate
  comparison: RoutingKpiComparisonDto | null  // so sánh kỳ trước (null nếu không có data kỳ trước)
  slaByStore: StoreSlAItemDto[]   // breakdown SLA theo từng cửa hàng
  generatedAt: string
}

interface RoutingKpiComparisonDto {
  prevRuleMatchRate: number | null
  prevAvgTimeToAssignMinutes: number | null
  prevSlaAchievedRate: number | null
  prevEscalationRate: number | null
  prevPeriodStart: string  // ISO 8601 UTC
  prevPeriodEnd: string    // ISO 8601 UTC
}

interface StoreSlAItemDto {
  storeId: string
  storeName: string
  slaAchievedRate: number  // 0–100 (%)
  totalLeads: number
}

// API 6 — so sánh đơn vị
interface UnitComparisonDto {
  period: string
  periodStart: string
  periodEnd: string
  items: UnitComparisonItemDto[]
  generatedAt: string
}

interface UnitComparisonItemDto {
  storeId: string
  storeName: string
  region: string | null
  leadCount: number
  winRate: number | null             // 0–100 (%), null nếu không có lead nào
  slaAchievedRate: number | null     // 0–100 (%)
  avgProcessingTimeHours: number | null  // giờ trung bình xử lý lead
}

// API 7 — báo cáo bán hàng
interface SalesReportDto {
  period: string
  periodStart: string
  periodEnd: string
  totalLeads: number       // tổng lead Sale trong kỳ
  contactedCount: number   // số lead đã được liên lạc (≠ Assigned/PendingAssignment)
  wonCount: number         // số lead đã Won
  contactRate: number | null   // contactedCount / totalLeads * 100
  winRate: number | null       // wonCount / totalLeads * 100
  wonByChannel: Record<string, number>   // kênh nào chốt nhiều nhất
  wonByNeedType: Record<string, number>  // nhu cầu nào chốt nhiều nhất
  dailyTrend: DailySalesTrendItemDto[]
  generatedAt: string
}

interface DailySalesTrendItemDto {
  date: string       // 'YYYY-MM-DD'
  totalLeads: number
  wonCount: number
}
```

---

## API QT — Audit & Thống kê hệ thống

> Chỉ role **QT** mới được gọi các API này.

### API 1 — Xem log hệ thống (QT-13)

#### `GET /api/audit/logs`

Danh sách audit log toàn hệ thống. Phân trang + bộ lọc.

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|:---:|---|
| `entityType` | string | ❌ | Lọc theo loại: `LEAD`, `TICKET`, `USER`, `RULE`, `SYSTEM` |
| `action` | string | ❌ | Tìm kiếm chứa (contains), không phân biệt hoa thường |
| `performedBy` | uuid | ❌ | Lọc theo user thực hiện |
| `dateFrom` | datetime | ❌ | ISO 8601 UTC |
| `dateTo` | datetime | ❌ | ISO 8601 UTC |
| `page` | int | ❌ | Default `1` |
| `pageSize` | int | ❌ | Default `20`, nên dùng tối đa `100` |

**Response `200`:** `PagedResult<AuditLogDto>`

```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "entityType": "LEAD",
      "entityId": "11111111-0000-0000-0000-000000000001",
      "action": "STATUS_CHANGED",
      "oldValue": "{\"status\":\"Assigned\"}",
      "newValue": "{\"status\":\"Contacted\"}",
      "note": null,
      "performedBy": "aaaaaaaa-0000-0000-0000-000000000001",
      "performedByName": "Nguyen Van A",
      "isInternal": false,
      "performedAt": "2026-05-01T08:30:00Z"
    }
  ],
  "totalCount": 4820,
  "page": 1,
  "pageSize": 20
}
```

**Lưu ý FE:**
- `oldValue` / `newValue` là JSON string — parse thêm nếu muốn hiển thị diff đẹp.
- `performedBy = null` → hành động được thực hiện bởi hệ thống (engine, background job).
- `isInternal = true` → log chỉ dành cho admin, không phải hành động của KH.
- Dùng `entityId` + `entityType` để tạo link điều hướng sang trang chi tiết tương ứng.

---

### API 2 — Thống kê hoạt động hệ thống (QT-14)

#### `GET /api/audit/system-stats`

Tổng quan hiệu quả engine phân luồng theo kỳ.

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|:---:|---|
| `period` | string | ❌ | `week` \| `month` \| `quarter`, default `month` |
| `dateFrom` | datetime | ❌ | Override period start |
| `dateTo` | datetime | ❌ | Override period end |

**Response `200`:** `SystemStatsDto`

```json
{
  "period": "month",
  "periodStart": "2026-04-01T00:00:00Z",
  "periodEnd": "2026-05-01T10:00:00Z",
  "totalLeadsProcessed": 3200,
  "autoRoutingSuccessRate": 91.5,
  "defaultGroupHits": 272,
  "totalErrors": 0,
  "dailyTrend": [
    { "date": "2026-04-01", "totalLeads": 105, "autoRouted": 97, "defaultGroupHits": 8 },
    { "date": "2026-04-02", "totalLeads": 98,  "autoRouted": 95, "defaultGroupHits": 3 }
  ],
  "leadsByGroup": {
    "Sale": 1800,
    "Cskh": 900,
    "StoreSupport": 228
  },
  "generatedAt": "2026-05-01T10:05:00Z"
}
```

**Lưu ý FE:**
- `autoRoutingSuccessRate` = % lead được route thành công (không phải `defaultGroupHits`).
- `defaultGroupHits` = số lead bị phân vào nhóm mặc định (không khớp rule nào) — chỉ số đáng lo nếu tăng.
- `leadsByGroup` keys: `"Sale"`, `"Cskh"`, `"StoreSupport"` — tương ứng enum `AssignedGroup`.
- Hiển thị dưới dạng line chart cho `dailyTrend`, pie chart cho `leadsByGroup`.

---

## API BQL — Dashboard lãnh đạo

> Role **BQL, QT, TN, QL** đều có quyền gọi các API này.

### API 3 — Dashboard tổng hợp (BQL-01)

#### `GET /api/dashboard/overview`

Dashboard chính toàn hệ thống: KPI cards, breakdown kênh/nhu cầu, trend 30 ngày, top-5 cửa hàng.

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|:---:|---|
| `period` | string | ❌ | `week` \| `month` \| `quarter`, default `month` |
| `dateFrom` | datetime | ❌ | Override period start |
| `dateTo` | datetime | ❌ | Override period end |

**Response `200`:** `DashboardOverviewDto`

```json
{
  "period": "month",
  "periodStart": "2026-04-01T00:00:00Z",
  "periodEnd": "2026-05-01T10:00:00Z",
  "kpiCards": {
    "totalLeadsToday": 47,
    "totalLeadsThisWeek": 312,
    "totalLeadsThisMonth": 3200,
    "slaAchievedRate": 88.5,
    "winRate": 62.3,
    "slaViolatedCount": 14
  },
  "leadsByChannel": {
    "Hotline": 980,
    "Walkin": 750,
    "Webform": 620,
    "Chat": 440,
    "Zalo": 280,
    "Email": 90,
    "Referral": 40
  },
  "leadsByNeedType": {
    "SaleNew": 1100,
    "SaleUpgrade": 420,
    "SaleRenew": 280,
    "CskhSupport": 610,
    "CskhComplaint": 290,
    "CskhWarranty": 140,
    "StoreVisit": 230,
    "Other": 130
  },
  "dailyTrend": [
    { "date": "2026-04-01", "totalLeads": 95 },
    { "date": "2026-04-02", "totalLeads": 112 }
  ],
  "top5Stores": [
    { "storeId": "aaaaaaaa-...", "storeName": "CN Quận 1", "leadCount": 420 },
    { "storeId": "bbbbbbbb-...", "storeName": "CN Quận 7", "leadCount": 380 }
  ],
  "generatedAt": "2026-05-01T10:05:00Z"
}
```

**Lưu ý FE:**
- `kpiCards.totalLeadsToday/Week/Month` là **tuyệt đối từ thời điểm hiện tại**, không phụ thuộc `period` param.
- `slaAchievedRate` và `winRate` là `null` nếu không có data trong kỳ — FE nên hiển thị `"N/A"`.
- `dailyTrend` tối đa 30 ngày gần nhất trong kỳ. Nếu chọn `period=week` sẽ có ≤7 điểm.
- Dùng bar chart / donut cho `leadsByChannel`, `leadsByNeedType`.

---

### API 4 — Drill-down (BQL-02)

#### `GET /api/dashboard/drill-down`

Xem chi tiết breakdown theo đơn vị hoặc kênh. Hỗ trợ 2 cấp: top-level (không truyền `id`) và chi tiết một entity (truyền `id`).

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|:---:|---|
| `level` | string | ✅ | `unit` hoặc `channel` |
| `id` | string | ❌ | StoreId (Guid) khi `level=unit`; tên kênh khi `level=channel`. Không truyền = top-level |
| `dateFrom` | datetime | ❌ | Default: tháng hiện tại |
| `dateTo` | datetime | ❌ | Default: now |

**Ví dụ request:**
```
GET /api/dashboard/drill-down?level=unit
GET /api/dashboard/drill-down?level=unit&id=aaaaaaaa-0000-0000-0000-000000000001
GET /api/dashboard/drill-down?level=channel
GET /api/dashboard/drill-down?level=channel&id=Hotline
```

**Response `200`:** `DrillDownDto`

```json
{
  "level": "unit",
  "entityId": null,
  "entityName": null,
  "periodStart": "2026-04-01T00:00:00Z",
  "periodEnd": "2026-05-01T10:00:00Z",
  "totalLeads": 3200,
  "byStatus": {
    "Assigned": 120,
    "Contacted": 280,
    "Won": 1990,
    "Lost": 510,
    "Cancelled": 150,
    "PendingAssignment": 80,
    "PendingDispatch": 70
  },
  "children": [
    { "label": "CN Quận 1", "count": 420 },
    { "label": "CN Quận 7", "count": 380 }
  ]
}
```

**Lưu ý FE:**
- Khi `entityId = null` → đang xem top-level → `children` là danh sách stores hoặc channels.
- Khi `entityId != null` → đang xem 1 entity cụ thể → `children` thường rỗng, `byStatus` là breakdown quan trọng.
- Đây là dữ liệu aggregate, **không có thông tin cá nhân khách hàng**.
- Gợi ý UX: click vào 1 item trong `children` → gọi lại API với `id` = label đó (hoặc storeId).

---

### API 5 — KPI phân luồng (BQL-03)

#### `GET /api/dashboard/routing-kpi`

Theo dõi hiệu quả engine phân luồng. Kèm so sánh với kỳ trước cùng độ dài.

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|:---:|---|
| `period` | string | ❌ | `week` \| `month` \| `quarter`, default `month` |
| `dateFrom` | datetime | ❌ | Override |
| `dateTo` | datetime | ❌ | Override |

**Response `200`:** `RoutingKpiDto`

```json
{
  "period": "month",
  "periodStart": "2026-04-01T00:00:00Z",
  "periodEnd": "2026-05-01T10:00:00Z",
  "ruleMatchRate": 91.5,
  "avgTimeToAssignMinutes": 4.2,
  "slaAchievedRate": 88.5,
  "escalationRate": 3.1,
  "comparison": {
    "prevRuleMatchRate": 89.0,
    "prevAvgTimeToAssignMinutes": 5.1,
    "prevSlaAchievedRate": 85.2,
    "prevEscalationRate": 4.5,
    "prevPeriodStart": "2026-03-01T00:00:00Z",
    "prevPeriodEnd": "2026-04-01T00:00:00Z"
  },
  "slaByStore": [
    { "storeId": "aaaaaaaa-...", "storeName": "CN Quận 1", "slaAchievedRate": 92.3, "totalLeads": 420 },
    { "storeId": "bbbbbbbb-...", "storeName": "CN Quận 7", "slaAchievedRate": 85.1, "totalLeads": 380 }
  ],
  "generatedAt": "2026-05-01T10:05:00Z"
}
```

**Lưu ý FE:**
- `comparison = null` nếu không có data kỳ trước (ví dụ: hệ thống mới go-live).
- Hiển thị mũi tên ↑↓ dựa trên delta: `ruleMatchRate - prevRuleMatchRate` (cao hơn = tốt hơn cho tất cả trừ `escalationRate`).
- `slaByStore` để hiển thị bảng xếp hạng SLA theo cửa hàng — sort phía FE được vì backend trả tất cả.
- `escalationRate` cao là dấu hiệu xấu (nhiều ca vượt thẩm quyền).

---

### API 6 — So sánh hiệu suất đơn vị (BQL-04)

#### `GET /api/dashboard/unit-comparison`

Bảng so sánh tất cả cửa hàng active trong hệ thống.

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|:---:|---|
| `period` | string | ❌ | `week` \| `month` \| `quarter`, default `month` |
| `sortBy` | string | ❌ | `leadCount` (default) \| `winRate` \| `slaAchievedRate` \| `avgProcessingTime` |
| `dateFrom` | datetime | ❌ | Override |
| `dateTo` | datetime | ❌ | Override |

**Response `200`:** `UnitComparisonDto`

```json
{
  "period": "month",
  "periodStart": "2026-04-01T00:00:00Z",
  "periodEnd": "2026-05-01T10:00:00Z",
  "items": [
    {
      "storeId": "aaaaaaaa-0000-0000-0000-000000000001",
      "storeName": "CN Quận 1",
      "region": "Hồ Chí Minh",
      "leadCount": 420,
      "winRate": 68.5,
      "slaAchievedRate": 92.3,
      "avgProcessingTimeHours": 2.1
    },
    {
      "storeId": "bbbbbbbb-0000-0000-0000-000000000002",
      "storeName": "CN Quận 7",
      "region": "Hồ Chí Minh",
      "leadCount": 380,
      "winRate": null,
      "slaAchievedRate": 85.1,
      "avgProcessingTimeHours": 3.4
    }
  ],
  "generatedAt": "2026-05-01T10:05:00Z"
}
```

**Lưu ý FE:**
- `winRate = null` → cửa hàng không có Sale lead nào trong kỳ (hoặc chưa có lead nào close).
- `avgProcessingTimeHours = null` → không có lead nào được assign trong kỳ.
- Backend đã sort theo `sortBy` — FE không cần sort lại, nhưng có thể thêm toggle sort phía FE nếu muốn trải nghiệm tốt hơn.
- `region` có thể `null` nếu cửa hàng chưa được gán vùng.
- Gợi ý hiển thị: data table với các cột tương ứng + bar chart mini per row (sparkline).

---

### API 7 — Báo cáo bán hàng (BQL-05)

#### `GET /api/dashboard/sales-report`

Phễu bán hàng Sale: tổng lead → đã liên lạc → đã chốt. Kèm breakdown kênh/nhu cầu và trend theo ngày.

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|:---:|---|
| `period` | string | ❌ | `week` \| `month` \| `quarter`, default `month` |
| `dateFrom` | datetime | ❌ | Override |
| `dateTo` | datetime | ❌ | Override |

**Response `200`:** `SalesReportDto`

```json
{
  "period": "month",
  "periodStart": "2026-04-01T00:00:00Z",
  "periodEnd": "2026-05-01T10:00:00Z",
  "totalLeads": 1800,
  "contactedCount": 1530,
  "wonCount": 1123,
  "contactRate": 85.0,
  "winRate": 62.4,
  "wonByChannel": {
    "Hotline": 480,
    "Walkin": 320,
    "Webform": 210,
    "Chat": 113
  },
  "wonByNeedType": {
    "SaleNew": 680,
    "SaleUpgrade": 290,
    "SaleRenew": 153
  },
  "dailyTrend": [
    { "date": "2026-04-01", "totalLeads": 58, "wonCount": 36 },
    { "date": "2026-04-02", "totalLeads": 62, "wonCount": 40 }
  ],
  "generatedAt": "2026-05-01T10:05:00Z"
}
```

**Lưu ý FE:**
- Chỉ tính **Sale group leads** (`AssignedGroup = Sale`). CSKH và StoreSupport không tính vào đây.
- `contactRate` = `contactedCount / totalLeads * 100` — null nếu `totalLeads = 0`.
- `winRate` = `wonCount / totalLeads * 100` — null nếu `totalLeads = 0`.
- Gợi ý hiển thị: funnel chart (`totalLeads → contactedCount → wonCount`) + bar chart cho `wonByChannel`.

---

### API 8 — Xuất báo cáo Excel (BQL-06)

#### `GET /api/dashboard/export`

Tải file Excel (`.xlsx`) cho 3 loại báo cáo.

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|---|---|:---:|---|
| `reportType` | string | ✅ | `overview` \| `unitComparison` \| `sales` |
| `period` | string | ❌ | `week` \| `month` \| `quarter`, default `month` |
| `dateFrom` | datetime | ❌ | Override period start |
| `dateTo` | datetime | ❌ | Override period end |

**Response `200`:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="DashboardOverview_month_20260501.xlsx"`
- Body: binary file bytes

**Ví dụ request:**
```
GET /api/dashboard/export?reportType=overview&period=month
GET /api/dashboard/export?reportType=unitComparison&period=quarter
GET /api/dashboard/export?reportType=sales&dateFrom=2026-04-01&dateTo=2026-04-30
```

**Nội dung file Excel theo reportType:**

| `reportType` | Sheet / Nội dung |
|---|---|
| `overview` | KPI Cards table + Leads by Channel table + Top 5 Stores table |
| `unitComparison` | Bảng so sánh tất cả cửa hàng: leadCount, winRate, slaRate, avgTime |
| `sales` | Tóm tắt funnel + Won by Channel + Daily Trend |

**Cách trigger download trong FE:**
```typescript
async function downloadReport(reportType: string, period: string) {
  const res = await fetch(
    `/api/dashboard/export?reportType=${reportType}&period=${period}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error('Export failed')

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = getFilenameFromHeader(res) ?? `report_${reportType}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

function getFilenameFromHeader(res: Response): string | null {
  const cd = res.headers.get('Content-Disposition')
  const match = cd?.match(/filename="?([^"]+)"?/)
  return match?.[1] ?? null
}
```

---

## Enum values tham chiếu

### `entityType` (Audit logs)
| Value | Ý nghĩa |
|---|---|
| `LEAD` | Log liên quan đến một Lead |
| `TICKET` | Log liên quan đến một Ticket |
| `USER` | Log thay đổi tài khoản người dùng |
| `RULE` | Log thay đổi rule phân luồng |
| `SYSTEM` | Log hệ thống (engine, background job) |

### `action` phổ biến (Audit logs)
| Value | Ý nghĩa |
|---|---|
| `CREATED` | Tạo mới |
| `STATUS_CHANGED` | Thay đổi trạng thái |
| `ASSIGNED` | Gán cho nhân viên / cửa hàng |
| `REASSIGNED` | Gán lại |
| `ESCALATED` | Escalate |
| `NOTE_ADDED` | Thêm ghi chú |
| `FOLLOW_UP_SET` | Đặt nhắc nhở follow-up |
| `RULE_MATCHED` | Rule phân luồng khớp |
| `DEFAULT_GROUP_HIT` | Không khớp rule nào, rơi vào nhóm mặc định |

### `Channel` (leadsByChannel keys)
`Hotline` | `Walkin` | `Webform` | `Chat` | `Email` | `Zalo` | `Referral`

### `NeedType` (leadsByNeedType keys)
`SaleNew` | `SaleUpgrade` | `SaleRenew` | `CskhSupport` | `CskhComplaint` | `CskhWarranty` | `StoreVisit` | `Other`

### `AssignedGroup` (leadsByGroup keys — system-stats)
`Sale` | `Cskh` | `StoreSupport`

### `LeadStatus` (byStatus keys — drill-down)
`PendingDispatch` | `PendingAssignment` | `Assigned` | `Contacted` | `Won` | `Lost` | `Cancelled`

---

## Error codes

| HTTP | ErrorCode | Mô tả |
|---|---|---|
| `400` | `INVALID_PERIOD` | `period` không phải `week`, `month`, `quarter` |
| `400` | `INVALID_REPORT_TYPE` | `reportType` không hợp lệ (phải là `overview`, `unitComparison`, `sales`) |
| `400` | `INVALID_DATE_RANGE` | `dateFrom` > `dateTo` |
| `401` | — | Token hết hạn hoặc không hợp lệ |
| `403` | — | Role không đủ quyền (QT-only endpoints gọi bởi role khác) |

---

## Luồng UX khuyến nghị

### Trang Dashboard BQL (màn hình chính)

```
1. Load page
   └─ Gọi song song:
       ├─ GET /api/dashboard/overview?period=month        (KPI cards, charts)
       └─ GET /api/dashboard/routing-kpi?period=month     (KPI phân luồng)

2. User chọn period (week/month/quarter)
   └─ Gọi lại cả 2 API trên với period mới

3. User click "Xem chi tiết đơn vị"
   └─ GET /api/dashboard/unit-comparison?period=month&sortBy=leadCount

4. User click vào 1 cửa hàng trong bảng
   └─ GET /api/dashboard/drill-down?level=unit&id={storeId}

5. User click "Xuất Excel"
   └─ Hiện dropdown chọn loại báo cáo
   └─ GET /api/dashboard/export?reportType=...&period=...
```

### Trang Audit Log QT (màn hình admin)

```
1. Load page
   └─ GET /api/audit/logs?page=1&pageSize=20  (không filter)

2. User nhập filter (entityType, action, performedBy, dateRange)
   └─ Debounce 400ms → reset page=1 → gọi lại GET /api/audit/logs với params mới

3. User click "Thống kê hệ thống"
   └─ GET /api/audit/system-stats?period=month
   └─ Hiển thị card: autoRoutingSuccessRate, defaultGroupHits, dailyTrend chart
```

### Lưu ý chung

- Tất cả giá trị `null` cho rate/percentage → hiển thị **"N/A"** (không phải `0%`), vì `0%` là dữ liệu thật còn `null` là không đủ dữ liệu.
- Tất cả datetime response đều là **UTC** — FE cần convert về múi giờ local khi hiển thị (GMT+7 cho Việt Nam).
- Các API dashboard không có cache phía server — nếu FE cần giảm tải, implement SWR/React Query với `staleTime` 2–5 phút.
- `generatedAt` là timestamp server generate response — dùng để hiển thị "Cập nhật lúc HH:MM" trên dashboard.
