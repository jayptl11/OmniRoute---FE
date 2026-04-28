# Phase 3 Part 2 — SA API Changes (SA-06, SA-07, SA-08, SA-09)

**Date:** 2026-04-28  
**Author:** OmniRoute Team  
**Scope:** `SaleLeadsController` — 4 new endpoints for SA (Sales Agent) role

---

## Overview

This document describes the 4 new endpoints added to `POST/PATCH /api/sale-leads` for completing Phase 3 of the SA workflow.

| Feature | Method | Endpoint |
|---------|--------|----------|
| SA-08: Report Invalid Lead | `PATCH` | `/api/sale-leads/{id}/report-invalid` |
| SA-06: Create Follow-Up Task | `POST` | `/api/sale-leads/{id}/follow-ups` |
| SA-07: Get Follow-Up Tasks | `GET` | `/api/sale-leads/follow-ups` |
| SA-09: Get Personal Performance | `GET` | `/api/sale-leads/performance` |

**Auth:** All endpoints require `Authorization: Bearer <token>` with policy `CanProcessLead` (role: `SA`).

---

## SA-08 — Report Invalid Lead

**Purpose:** SA báo lead không hợp lệ. Lead chuyển sang `Cancelled`, Trưởng nhóm nhận notification để review.

```
PATCH /api/sale-leads/{id}/report-invalid
```

### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `leadId` | `guid` | ✅ | Phải trùng với `{id}` trong URL |
| `reason` | `string` | ✅ | Một trong: `Spam`, `WrongPhone`, `Unreachable`, `Other` |

```json
{
  "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "reason": "WrongPhone"
}
```

### Response `200 OK`

```json
{
  "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leadCode": "LEAD-0042",
  "cancelledAt": "2026-04-28T09:15:00Z"
}
```

### Error Responses

| HTTP | ErrorCode | Mô tả |
|------|-----------|-------|
| 400 | `INVALID_REASON` | Lý do không hợp lệ |
| 400 | `INVALID_STATUS_TRANSITION` | Lead không thể chuyển sang Cancelled từ trạng thái hiện tại |
| 400 | `ID_MISMATCH` | `leadId` trong body ≠ `{id}` trong URL |
| 404 | `NOT_FOUND` | Lead không tồn tại hoặc không được gán cho SA hiện tại |

---

## SA-06 — Create Follow-Up Task

**Purpose:** SA đặt nhắc nhở follow-up cho một lead. `DueAt` phải ở trong tương lai (UTC).

```
POST /api/sale-leads/{id}/follow-ups
```

### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `leadId` | `guid` | ✅ | Phải trùng với `{id}` trong URL |
| `dueAt` | `datetime (UTC)` | ✅ | Thời điểm nhắc nhở — phải > `DateTime.UtcNow` |
| `note` | `string` | ✅ | Nội dung nhắc nhở, tối đa 500 ký tự |

```json
{
  "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "dueAt": "2026-04-30T08:00:00Z",
  "note": "Gọi lại sau 2 ngày"
}
```

### Response `201 Created`

```json
{
  "taskId": "a1b2c3d4-1234-5678-abcd-ef0123456789",
  "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "dueAt": "2026-04-30T08:00:00Z",
  "createdAt": "2026-04-28T09:15:00Z"
}
```

### Error Responses

| HTTP | ErrorCode | Mô tả |
|------|-----------|-------|
| 400 | `VALIDATION_ERROR` | `dueAt` không ở tương lai hoặc `note` trống/quá dài |
| 400 | `ID_MISMATCH` | `leadId` trong body ≠ `{id}` trong URL |
| 404 | `NOT_FOUND` | Lead không tồn tại hoặc không được gán cho SA hiện tại |

---

## SA-07 — Get Follow-Up Tasks

**Purpose:** Lấy danh sách nhắc nhở follow-up chưa hoàn thành của SA hiện tại. Có thể lọc theo nhóm thời gian. Sắp xếp theo `DueAt ASC`.

```
GET /api/sale-leads/follow-ups?filter=today
```

### Query Parameters

| Param | Type | Required | Values |
|-------|------|----------|--------|
| `filter` | `string` | ❌ | `today` \| `upcoming` \| `overdue` \| *(bỏ trống = tất cả)* |

**Ý nghĩa filter:**
- `today` — `DueAt` trong khoảng `[00:00, 24:00)` UTC hôm nay
- `upcoming` — `DueAt ≥ now` (chưa đến hạn)
- `overdue` — `DueAt < now` (đã quá hạn, chưa hoàn thành)
- *(null)* — tất cả task chưa hoàn thành

### Response `200 OK`

```json
[
  {
    "taskId": "a1b2c3d4-1234-5678-abcd-ef0123456789",
    "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "leadCode": "LEAD-0042",
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0901234567",
    "dueAt": "2026-04-28T08:00:00Z",
    "note": "Gọi lại sau 2 ngày",
    "isOverdue": false,
    "isToday": true
  }
]
```

### Notes
- Chỉ trả về task của SA đang đăng nhập
- Chỉ trả về task `IsCompleted = false`

---

## SA-09 — Get Personal Performance

**Purpose:** Hiệu suất cá nhân của SA trong một kỳ thời gian.

```
GET /api/sale-leads/performance?period=month
```

### Query Parameters

| Param | Type | Required | Default | Values |
|-------|------|----------|---------|--------|
| `period` | `string` | ❌ | `month` | `week` \| `month` \| `quarter` |

**Kỳ thời gian:**
- `week` — 7 ngày gần nhất
- `month` — 30 ngày gần nhất
- `quarter` — 90 ngày gần nhất

### Response `200 OK`

```json
{
  "period": "month",
  "periodStart": "2026-03-28T09:15:00Z",
  "periodEnd": "2026-04-28T09:15:00Z",
  "totalAssigned": 120,
  "totalProcessed": 98,
  "wonCount": 45,
  "winRate": 45.9,
  "avgResponseTimeMinutes": 12.5,
  "slaViolatedCount": 7,
  "generatedAt": "2026-04-28T09:15:00Z"
}
```

**Giải thích trường:**

| Field | Mô tả |
|-------|-------|
| `totalAssigned` | Tổng số lead được gán trong kỳ |
| `totalProcessed` | Lead đã có hành động (Contacted / InProgress / Won / Lost / Cancelled) |
| `wonCount` | Số lead thắng (Won) |
| `winRate` | `wonCount / totalProcessed * 100`; `null` nếu `totalProcessed = 0` |
| `avgResponseTimeMinutes` | Thời gian trung bình từ `AssignedAt` → trạng thái `Contacted`; `null` nếu không có dữ liệu |
| `slaViolatedCount` | Số lead vi phạm SLA trong kỳ |

### Error Responses

| HTTP | ErrorCode | Mô tả |
|------|-----------|-------|
| 400 | `INVALID_PERIOD` | `period` không phải `week`, `month`, hoặc `quarter` |
