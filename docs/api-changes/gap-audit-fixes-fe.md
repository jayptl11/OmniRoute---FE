# Tài liệu tích hợp Frontend — Bổ sung & sửa lỗi (2026-05-01)

> **Dành cho:** Frontend AI / Developer
> **Base URL:** `/api`
> **Auth:** `Authorization: Bearer <token>` — mọi endpoint đều yêu cầu
> **Phạm vi:** Tài liệu này bổ sung / cập nhật tài liệu đã có ở `phase9-dashboard-bql-qt.md` và các phase trước.

---

## Mục lục

1. [QT-13 — Xuất Audit Log ra file Excel (endpoint mới)](#1-qt-13--xuất-audit-log-ra-file-excel-endpoint-mới)
2. [BQL-06 — Xuất báo cáo dạng PDF (tham số mới)](#2-bql-06--xuất-báo-cáo-dạng-pdf-tham-số-mới)
3. [CS-03 — Tìm kiếm Ticket theo TicketCode (fix logic)](#3-cs-03--tìm-kiếm-ticket-theo-ticketcode-fix-logic)
4. [Lưu ý chung về Priority Score (fix backend-only)](#4-lưu-ý-chung-về-priority-score-fix-backend-only)

---

## 1. QT-13 — Xuất Audit Log ra file Excel (endpoint mới)

> **Role:** Chỉ `QT`
> **Policy:** `CanAdminSystem`

### Endpoint

```
GET /api/audit/logs/export
```

**Khác biệt so với `GET /api/audit/logs`:** Không phân trang — trả về **toàn bộ** kết quả khớp bộ lọc dưới dạng file `.xlsx`.

### Query params

| Param | Type | Bắt buộc | Mô tả |
|---|---|:---:|---|
| `entityType` | string | ❌ | Lọc theo loại: `LEAD`, `TICKET`, `USER`, `RULE`, `SYSTEM` |
| `action` | string | ❌ | Tìm kiếm chứa (contains), không phân biệt hoa thường |
| `performedBy` | uuid | ❌ | Lọc theo uuid của user thực hiện |
| `dateFrom` | datetime | ❌ | ISO 8601 UTC |
| `dateTo` | datetime | ❌ | ISO 8601 UTC |

> Không có `page` / `pageSize` — tất cả bản ghi khớp đều được xuất.

### Response

| Status | Content-Type | Body |
|---|---|---|
| `200 OK` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | File `.xlsx` (binary) |
| `400 Bad Request` | `application/json` | `{ errorCode, errorMessage }` |

**Tên file trả về qua `Content-Disposition`:**

```
AuditLog_export_20260501.xlsx
```

### Cột trong file Excel

| Cột | Mô tả |
|---|---|
| Performed At | `yyyy-MM-dd HH:mm:ss` (UTC) |
| Performed By | Tên đầy đủ, hoặc uuid nếu không có tên, hoặc rỗng nếu là hệ thống |
| Entity Type | `LEAD`, `TICKET`, … |
| Entity ID | uuid dạng string |
| Action | `STATUS_CHANGED`, `ASSIGNED`, … |
| Old Value | JSON string (có thể rỗng) |
| New Value | JSON string (có thể rỗng) |
| Note | Ghi chú thêm (có thể rỗng) |
| Internal | `Yes` / `No` |

### Cách tải file trong FE

```typescript
async function downloadAuditLog(filters: {
  entityType?: string
  action?: string
  performedBy?: string
  dateFrom?: string
  dateTo?: string
}) {
  const params = new URLSearchParams()
  if (filters.entityType) params.set('entityType', filters.entityType)
  if (filters.action)     params.set('action', filters.action)
  if (filters.performedBy) params.set('performedBy', filters.performedBy)
  if (filters.dateFrom)   params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo)     params.set('dateTo', filters.dateTo)

  const res = await fetch(`/api/audit/logs/export?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.errorMessage)
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = getFilenameFromHeaders(res.headers) ?? 'AuditLog.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

function getFilenameFromHeaders(headers: Headers): string | null {
  const cd = headers.get('Content-Disposition')
  if (!cd) return null
  const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
  return match ? match[1].replace(/['"]/g, '') : null
}
```

---

## 2. BQL-06 — Xuất báo cáo dạng PDF (tham số mới)

> **Role:** `BQL`, `QT`, `TN`, `QL`
> **Tài liệu gốc:** `phase9-dashboard-bql-qt.md` — API 8

### Thay đổi

Endpoint `GET /api/dashboard/export` **giờ nhận thêm tham số `format`** để chọn Excel hoặc PDF.

### Endpoint (cập nhật)

```
GET /api/dashboard/export
```

### Query params (đầy đủ)

| Param | Type | Bắt buộc | Default | Mô tả |
|---|---|:---:|---|---|
| `reportType` | string | ❌ | `overview` | `overview` \| `unitComparison` \| `sales` |
| `period` | string | ❌ | `month` | `week` \| `month` \| `quarter` |
| `dateFrom` | datetime | ❌ | — | ISO 8601 UTC — override period start |
| `dateTo` | datetime | ❌ | — | ISO 8601 UTC — override period end |
| `format` | string | ❌ | `excel` | **`excel`** \| **`pdf`** ← tham số mới |

### Response theo format

| `format` | Status | Content-Type | Tên file |
|---|---|---|---|
| `excel` | `200 OK` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `DashboardOverview_month_20260501.xlsx` |
| `pdf` | `200 OK` | `application/pdf` | `DashboardOverview_month_20260501.pdf` |
| giá trị khác | `400` | `application/json` | `{ errorCode: "INVALID_FORMAT", ... }` |

### Ví dụ URL

```
# Excel (hành vi cũ — vẫn hoạt động, không cần thay đổi)
GET /api/dashboard/export?reportType=sales&period=month

# PDF mới
GET /api/dashboard/export?reportType=overview&period=month&format=pdf
GET /api/dashboard/export?reportType=unitComparison&period=quarter&format=pdf
GET /api/dashboard/export?reportType=sales&dateFrom=2026-04-01&dateTo=2026-04-30&format=pdf
```

### Nội dung PDF

PDF được render dạng bảng text thuần (tabular plaintext). Nội dung tương tự file Excel nhưng ở định dạng in ấn:

- **overview:** KPI cards, period
- **unitComparison:** Bảng cột `Store Name | Region | Leads | Win% | SLA% | Avg(h)`
- **sales:** KPI tổng hợp + bảng Won by Channel

> **Lưu ý UX:** Nếu người dùng muốn in báo cáo, suggest format `pdf`. Nếu cần chỉnh sửa/nhập thêm data thì dùng `excel`.

### Cách tải file (TypeScript)

```typescript
async function downloadReport(params: {
  reportType: 'overview' | 'unitComparison' | 'sales'
  period?: string
  dateFrom?: string
  dateTo?: string
  format?: 'excel' | 'pdf'   // ← thêm mới
}) {
  const qs = new URLSearchParams({
    reportType: params.reportType,
    ...(params.period   && { period:   params.period }),
    ...(params.dateFrom && { dateFrom: params.dateFrom }),
    ...(params.dateTo   && { dateTo:   params.dateTo }),
    ...(params.format   && { format:   params.format }),  // ← thêm mới
  })

  const res = await fetch(`/api/dashboard/export?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.errorMessage)
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = getFilenameFromHeaders(res.headers)
    ?? `Report_${params.reportType}.${params.format === 'pdf' ? 'pdf' : 'xlsx'}`
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## 3. CS-03 — Tìm kiếm Ticket theo TicketCode (fix logic)

> **Role:** `CS`, `TN`, `QL`, `QT`
> **Tài liệu gốc:** `phase5-tickets-cs.md`

### Thay đổi

Endpoint `GET /api/tickets` đã được **fix**: tham số `search` giờ khớp thêm với trường `ticketCode`.

### Trước fix

`search` chỉ tìm theo:
- `customerPhone` (exact match)
- `customerName` (contains)

### Sau fix

`search` tìm theo:
- `customerPhone` (exact match)
- **`ticketCode` (exact match)** ← thêm mới
- `customerName` (contains)

### Cách dùng

```
GET /api/tickets?search=TK-20260501-0042
→ Trả về ticket có ticketCode = "TK-20260501-0042"

GET /api/tickets?search=0901234567
→ Trả về ticket có customerPhone = "0901234567"

GET /api/tickets?search=Nguyen Van
→ Trả về ticket có customerName chứa "Nguyen Van"
```

### Lưu ý FE

- Search box có thể dùng chung cho cả 3 kiểu — BE tự nhận biết.
- Placeholder gợi ý nên cập nhật: `"Tìm theo tên, SĐT hoặc mã ticket…"`
- TicketCode có format `TK-YYYYMMDD-NNNN` — FE có thể detect pattern này để hiển thị hint.

---

## 4. Lưu ý chung về Priority Score (fix backend-only)

> **Không ảnh hưởng API** — FE không cần thay đổi gì.

### Tóm tắt

Bug: `priorityScore` của lead bị tăng liên tục sai trong mỗi chu kỳ SLA monitoring (do logic backend cộng dồn sai).

**Fix đã áp dụng:** Backend đã sửa công thức tính điểm ưu tiên để không tích lũy sai nữa.

### Tác động FE

- Giá trị `priorityScore` trả về trong `LeadDto` giờ sẽ **ổn định hơn và đúng hơn** so với trước.
- Thứ tự lead trong danh sách (nếu FE sort theo `priorityScore`) sẽ phản ánh đúng ưu tiên thực tế.
- Không có thay đổi schema, không cần cập nhật TypeScript types.

---

## Error codes liên quan

| Code | HTTP | Mô tả |
|---|---|---|
| `INVALID_REPORT_TYPE` | 400 | `reportType` không phải `overview`, `unitComparison`, hoặc `sales` |
| `INVALID_FORMAT` | 400 | `format` không phải `excel` hoặc `pdf` |
| `EXPORT_FAILED` | 400 | Lỗi khi tạo file export (hiếm gặp) |
