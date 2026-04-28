# PHASE 5 — Xử lý ticket CSKH (CS-01 → CS-08)

> **Ngày:** 2026-04-28
> **Role:** `CS` — policy `CanProcessTicket`
> **Base URL:** `/api/tickets`
> **Auth:** `Authorization: Bearer <token>` — **bắt buộc trên tất cả endpoint**

---

## Tổng quan

| Method | Path | Task | Mô tả |
|--------|------|------|-------|
| `GET` | `/api/tickets` | CS-01 + CS-03 | Danh sách ticket được gán cho tôi |
| `GET` | `/api/tickets/performance` | CS-08 | Hiệu suất cá nhân theo kỳ |
| `GET` | `/api/tickets/{id}` | CS-02 | Chi tiết ticket + timeline + lịch sử KH |
| `PATCH` | `/api/tickets/{id}/status` | CS-04 | Cập nhật trạng thái |
| `POST` | `/api/tickets/{id}/notes` | CS-05 | Thêm ghi chú xử lý |
| `POST` | `/api/tickets/{id}/escalate` | CS-06 | Escalate ticket |
| `PATCH` | `/api/tickets/{id}/satisfaction` | CS-07 | Ghi nhận điểm hài lòng |

> **Lưu ý thứ tự route:** `/api/tickets/performance` phải gọi **trước** `/api/tickets/{id}` để tránh ASP.NET Core hiểu `"performance"` là một GUID.

---

## Enum tham chiếu

### TicketStatus

| Giá trị | Ý nghĩa |
|---------|---------|
| `New` | Mới tạo, chưa xử lý |
| `InProgress` | Đang xử lý |
| `WaitingCustomer` | Chờ phản hồi từ khách |
| `Escalated` | Đã escalate |
| `Resolved` | Đã giải quyết |
| `Closed` | Đã đóng |

### Luồng chuyển trạng thái hợp lệ (BR-05)

```
New              → InProgress
InProgress       → WaitingCustomer | Resolved
WaitingCustomer  → InProgress | Resolved
Escalated        → Resolved
Resolved         → Closed
```

> CS-04 **chỉ chấp nhận** `newStatus` ∈ `{InProgress, WaitingCustomer, Resolved, Closed}`.
> Không thể chuyển sang `New` hoặc `Escalated` qua endpoint này — `Escalated` dùng CS-06.

---

## 1. GET `/api/tickets` — Danh sách ticket được gán (CS-01 + CS-03)

Trả về ticket đang gán cho nhân viên CS **hiện tại** (lấy từ JWT).
Sắp xếp: **PriorityLevel** giảm dần → **SlaDeadline** tăng dần (sắp hết hạn lên đầu).

### Query parameters

| Tên | Kiểu | Mặc định | Mô tả |
|-----|------|----------|-------|
| `search` | string | — | Tìm theo SĐT (khớp chính xác) hoặc tên KH (contains, không phân biệt hoa thường) |
| `status` | string | — | Lọc theo `TicketStatus` |
| `priorityLevel` | string | — | `Low` \| `Medium` \| `High` |
| `dateFrom` | datetime ISO 8601 | — | Lọc ticket được gán từ ngày này |
| `dateTo` | datetime ISO 8601 | — | Lọc ticket được gán đến ngày này |
| `page` | int | `1` | Trang hiện tại |
| `pageSize` | int | `20` | Số item mỗi trang |

### Response `200 OK`

```json
{
  "items": [
    {
      "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "ticketCode": "TK20260428001",
      "customerName": "Nguyễn Thị Lan",
      "customerPhone": "0912345678",
      "needType": "CskhSupport",
      "ticketStatus": "New",
      "priorityLevel": "High",
      "slaDeadline": "2026-04-28T16:00:00Z",
      "slaViolated": false,
      "assignedAt": "2026-04-28T08:00:00Z"
    }
  ],
  "totalCount": 12,
  "page": 1,
  "pageSize": 20
}
```

> **Tên field là `ticketStatus`** (không phải `status`).

### Gợi ý UI

| Điều kiện | Hiển thị |
|-----------|---------|
| `slaViolated = true` | Badge đỏ "Vi phạm SLA" |
| `slaDeadline` còn dưới 30 phút | Badge cam "Sắp hết hạn" |
| `priorityLevel = "High"` | Highlight hàng đỏ/cam |
| `ticketStatus = "New"` | Badge xám — nhắc nhân viên bấm bắt đầu xử lý |
| `ticketStatus = "WaitingCustomer"` | Badge xanh dương |

---

## 2. GET `/api/tickets/performance` — Hiệu suất cá nhân (CS-08)

Hiệu suất của nhân viên CS **hiện tại** trong khoảng thời gian chọn.

### Query parameters

| Tên | Kiểu | Mặc định | Mô tả |
|-----|------|----------|-------|
| `period` | string | `month` | `week` (7 ngày) \| `month` (30 ngày) \| `quarter` (90 ngày) |

### Response `200 OK`

```json
{
  "period": "month",
  "periodStart": "2026-03-28T08:00:00Z",
  "periodEnd": "2026-04-28T08:00:00Z",
  "totalAssigned": 45,
  "totalProcessed": 38,
  "resolvedCount": 35,
  "onTimeRate": 88.6,
  "avgHandlingTimeMinutes": 47.3,
  "avgSatisfactionScore": 4.2,
  "slaViolatedCount": 4,
  "generatedAt": "2026-04-28T08:00:00Z"
}
```

| Field | Ý nghĩa |
|-------|---------|
| `totalProcessed` | Ticket đang ở bất kỳ status nào trừ `New` |
| `resolvedCount` | Ticket có status `Resolved` hoặc `Closed` |
| `onTimeRate` | Phần trăm 0–100, `null` nếu chưa có ticket nào processed |
| `avgHandlingTimeMinutes` | Tính từ `assignedAt` → `closedAt`, `null` nếu chưa có ticket Closed/Resolved |
| `avgSatisfactionScore` | Điểm trung bình 1–5, `null` nếu chưa có |

### Response `400 Bad Request`

```json
{
  "errorCode": "INVALID_PERIOD",
  "errorMessage": "Period phải là: week, month hoặc quarter."
}
```

---

## 3. GET `/api/tickets/{id}` — Chi tiết ticket (CS-02)

Trả về ticket kèm toàn bộ activity timeline và lịch sử tất cả ticket của cùng SĐT KH.
Chỉ trả kết quả nếu ticket đang gán cho nhân viên CS **hiện tại**.

### Path parameter

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `id` | guid | Ticket ID |

### Response `200 OK`

```json
{
  "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "ticketCode": "TK20260428001",
  "customerName": "Nguyễn Thị Lan",
  "customerPhone": "0912345678",
  "customerAddress": "45 Nguyễn Trãi, Quận 5, TP.HCM",
  "customerEmail": "lan.nguyen@email.com",
  "channel": "Hotline",
  "needDescription": "Máy không bật được sau khi nâng cấp iOS",
  "needType": "CskhSupport",
  "priorityScore": 85,
  "priorityLevel": "High",
  "assignedUserId": "guid",
  "assignedUserName": "Trần Văn CS",
  "assignedStoreId": "guid",
  "assignedAt": "2026-04-28T08:00:00Z",
  "slaDeadline": "2026-04-28T16:00:00Z",
  "slaViolated": false,
  "ticketStatus": "InProgress",
  "isEscalated": false,
  "escalatedReason": null,
  "satisfactionScore": null,
  "satisfactionNote": null,
  "createdBy": "guid",
  "createdAt": "2026-04-28T07:50:00Z",
  "updatedAt": "2026-04-28T08:00:00Z",
  "closedAt": null,
  "activityLogs": [
    {
      "id": "guid",
      "action": "STATUS_CHANGED",
      "note": "Bắt đầu xử lý",
      "newValue": "InProgress",
      "performedAt": "2026-04-28T08:05:00Z",
      "performedByName": "Trần Văn CS"
    }
  ],
  "customerTicketHistory": [
    {
      "ticketId": "guid",
      "ticketCode": "TK20260401005",
      "needType": "CskhSupport",
      "ticketStatus": "Closed",
      "createdAt": "2026-04-01T10:00:00Z",
      "closedAt": "2026-04-02T09:00:00Z"
    }
  ]
}
```

### Enum `action` trong `activityLogs`

| Giá trị | Khi nào | `note` | `newValue` |
|---------|---------|--------|------------|
| `STATUS_CHANGED` | CS-04 | Nội dung note truyền vào | Status mới |
| `PROCESSING_NOTE` | CS-05 | Nội dung ghi chú | `null` |
| `ESCALATED` | CS-06 | Lý do escalate | UserId người nhận |
| `SATISFACTION_RECORDED` | CS-07 | Note ghi chú | Số điểm |

### Response `404 Not Found`

```json
{
  "errorCode": "NOT_FOUND",
  "errorMessage": "Ticket không tồn tại hoặc chưa được gán cho bạn."
}
```

---

## 4. PATCH `/api/tickets/{id}/status` — Cập nhật trạng thái (CS-04)

### Path parameter

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `id` | guid | Ticket ID — phải khớp với `ticketId` trong body |

### Request body

```json
{
  "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "newStatus": "InProgress",
  "note": "Đã liên hệ khách hàng, đang kiểm tra thiết bị",
  "cancelReason": null
}
```

| Field | Kiểu | Bắt buộc | Ràng buộc |
|-------|------|----------|-----------|
| `ticketId` | guid | **Có** | Phải khớp `{id}` trong URL |
| `newStatus` | string | **Có** | Một trong: `InProgress`, `WaitingCustomer`, `Resolved`, `Closed` |
| `note` | string | **Có khi** `newStatus` = `InProgress` hoặc `Resolved` | — |
| `cancelReason` | string | Không | Lý do khi `newStatus = Closed` |

### Response `200 OK`

```json
{
  "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "ticketCode": "TK20260428001",
  "newStatus": "InProgress",
  "updatedAt": "2026-04-28T08:05:00Z"
}
```

### Responses lỗi

**400 — ID không khớp:**
```json
{ "errorCode": "ID_MISMATCH", "errorMessage": "ID trong URL và body không khớp." }
```

**400 — `newStatus` không hợp lệ hoặc `note` thiếu (FluentValidation):**
```json
{
  "errors": {
    "NewStatus": ["NewStatus phải là một trong: InProgress, WaitingCustomer, Resolved, Closed."],
    "Note": ["Note là bắt buộc khi chuyển trạng thái sang InProgress hoặc Resolved."]
  }
}
```

**400 — Chuyển trạng thái không đúng luồng:**
```json
{ "errorCode": "INVALID_TRANSITION", "errorMessage": "Không thể chuyển từ trạng thái 'New' sang 'Resolved'." }
```

**404:**
```json
{ "errorCode": "NOT_FOUND", "errorMessage": "Ticket không tồn tại hoặc chưa được gán cho bạn." }
```

---

## 5. POST `/api/tickets/{id}/notes` — Thêm ghi chú (CS-05)

Không giới hạn số lần ghi. Mỗi lần tạo một activity log `PROCESSING_NOTE`.

### Path parameter

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `id` | guid | Ticket ID — phải khớp với `ticketId` trong body |

### Request body

```json
{
  "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "content": "Đã hướng dẫn khách thực hiện hard reset. Hẹn gọi lại sau 30 phút."
}
```

| Field | Kiểu | Bắt buộc | Ràng buộc |
|-------|------|----------|-----------|
| `ticketId` | guid | **Có** | Phải khớp `{id}` trong URL |
| `content` | string | **Có** | Tối đa **4000** ký tự |

> **Tên field là `content`** (không phải `note`).

### Response `201 Created`

Header: `Location: /api/tickets/{ticketId}`

```json
{
  "noteId": "guid",
  "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "createdAt": "2026-04-28T09:15:00Z"
}
```

### Responses lỗi

```json
{ "errorCode": "ID_MISMATCH", "errorMessage": "ID trong URL và body không khớp." }
```
```json
{ "errorCode": "NOT_FOUND", "errorMessage": "Ticket không tồn tại hoặc chưa được gán cho bạn." }
```

---

## 6. POST `/api/tickets/{id}/escalate` — Escalate ticket (CS-06)

Chuyển ticket sang `Escalated`. Người nhận sẽ nhận notification trong app.

### Path parameter

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `id` | guid | Ticket ID — phải khớp với `ticketId` trong body |

### Request body

```json
{
  "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "escalateTo": "user-guid-of-supervisor",
  "reason": "Vấn đề liên quan đến chính sách bảo hành đặc biệt, vượt thẩm quyền xử lý."
}
```

| Field | Kiểu | Bắt buộc | Ràng buộc |
|-------|------|----------|-----------|
| `ticketId` | guid | **Có** | Phải khớp `{id}` trong URL |
| `escalateTo` | guid | **Có** | User ID người nhận, phải đang `IsActive = true` |
| `reason` | string | **Có** | Tối đa **1000** ký tự |

> **Tên field là `escalateTo`** (không phải `escalatedTo`).

### Response `200 OK`

```json
{
  "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "ticketCode": "TK20260428001",
  "escalatedTo": "user-guid-of-supervisor",
  "escalatedAt": "2026-04-28T09:30:00Z"
}
```

### Responses lỗi

```json
{ "errorCode": "ID_MISMATCH", "errorMessage": "ID trong URL và body không khớp." }
```
```json
{ "errorCode": "INVALID_TARGET", "errorMessage": "Người nhận escalate không tồn tại hoặc đã bị khóa." }
```
```json
{ "errorCode": "INVALID_TRANSITION", "errorMessage": "Không thể escalate ticket đang ở trạng thái 'Escalated'." }
```
```json
{ "errorCode": "NOT_FOUND", "errorMessage": "Ticket không tồn tại hoặc chưa được gán cho bạn." }
```

---

## 7. PATCH `/api/tickets/{id}/satisfaction` — Ghi nhận điểm hài lòng (CS-07)

Chỉ cho phép khi ticket ở trạng thái `Resolved` hoặc `Closed`.

### Path parameter

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `id` | guid | Ticket ID — phải khớp với `ticketId` trong body |

### Request body

```json
{
  "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "score": 4,
  "note": "Khách hài lòng với cách xử lý"
}
```

| Field | Kiểu | Bắt buộc | Ràng buộc |
|-------|------|----------|-----------|
| `ticketId` | guid | **Có** | Phải khớp `{id}` trong URL |
| `score` | int | **Có** | **1** (rất không hài lòng) đến **5** (rất hài lòng) |
| `note` | string | Không | Tối đa **1000** ký tự |

### Response `200 OK`

```json
{
  "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "ticketCode": "TK20260428001",
  "satisfactionScore": 4,
  "updatedAt": "2026-04-28T10:00:00Z"
}
```

### Responses lỗi

```json
{ "errorCode": "ID_MISMATCH", "errorMessage": "ID trong URL và body không khớp." }
```
```json
{
  "errorCode": "INVALID_STATUS",
  "errorMessage": "Chỉ có thể ghi nhận mức độ hài lòng khi ticket ở trạng thái Resolved hoặc Closed."
}
```
```json
{ "errorCode": "NOT_FOUND", "errorMessage": "Ticket không tồn tại hoặc chưa được gán cho bạn." }
```

---

## Bảng tổng hợp lỗi

| errorCode | HTTP | Endpoint | Nguyên nhân |
|-----------|------|----------|-------------|
| `NOT_FOUND` | 404 | Tất cả | Ticket không tồn tại hoặc không thuộc về CS hiện tại |
| `ID_MISMATCH` | 400 | CS-04, CS-05, CS-06, CS-07 | `ticketId` trong body khác `{id}` trong URL |
| `INVALID_STATUS` | 400 | CS-04, CS-07 | `newStatus` không hợp lệ / ticket chưa Resolved hoặc Closed |
| `INVALID_TRANSITION` | 400 | CS-04, CS-06 | Chuyển trạng thái không theo luồng BR-05 |
| `INVALID_TARGET` | 400 | CS-06 | `escalateTo` user không tồn tại hoặc bị khóa |
| `INVALID_PERIOD` | 400 | CS-08 | `period` không phải `week` / `month` / `quarter` |