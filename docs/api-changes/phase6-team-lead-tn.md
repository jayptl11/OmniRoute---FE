# PHASE 6 — Team Lead (TN-01 → TN-12)

> **Ngày:** 2026-04-29
> **Role:** `TN` — policy `CanManageTeam`
> **Base URLs:** `/api/team-leads` (TN-01–07 lead, TN-09) · `/api/my-team` (TN-07 ticket, TN-08, TN-10–12)
> **Auth:** `Authorization: Bearer <token>` — **bắt buộc trên tất cả endpoint**

---

## Tổng quan endpoint

### `/api/team-leads`

| Method | Path | Task | Mô tả |
|--------|------|------|-------|
| `GET` | `/api/team-leads/overview` | TN-01 | Tổng quan queue + trend 7 ngày |
| `GET` | `/api/team-leads/sla-violations` | TN-02 | Lead vi phạm / sắp vi phạm SLA |
| `GET` | `/api/team-leads` | TN-03 | Danh sách + tìm kiếm lead trong đội |
| `PATCH` | `/api/team-leads/{leadId}/reassign` | TN-04 | Reassign lead sang SA khác trong đội |
| `POST` | `/api/team-leads/{leadId}/escalate` | TN-05 | Escalate lead ra ngoài đội |
| `GET` | `/api/team-leads/escalate-history` | TN-06 | Lịch sử escalate của TN hiện tại |
| `POST` | `/api/team-leads/{leadId}/internal-notes` | TN-07 | Thêm ghi chú nội bộ trên lead |
| `GET` | `/api/team-leads/report` | TN-09 | Báo cáo tổng hợp hiệu suất đội |

> **⚠ Lưu ý thứ tự route:** Các route tĩnh (`/overview`, `/sla-violations`, `/escalate-history`, `/report`) phải được đăng ký **trước** `/{leadId}` (đúng như trong controller hiện tại). Khi FE gọi API, không có vấn đề gì — đây chỉ là lưu ý cho BE dev.

### `/api/my-team`

| Method | Path | Task | Mô tả |
|--------|------|------|-------|
| `POST` | `/api/my-team/tickets/{ticketId}/internal-notes` | TN-07 | Thêm ghi chú nội bộ trên ticket |
| `GET` | `/api/my-team/members/{userId}/performance` | TN-08 | Hiệu suất từng thành viên |
| `GET` | `/api/my-team/members` | TN-10 | Danh sách thành viên trong đội |
| `POST` | `/api/my-team/members` | TN-11 | Thêm thành viên vào đội |
| `DELETE` | `/api/my-team/members/{userId}` | TN-12 | Xóa thành viên khỏi đội |

---

## Enum tham chiếu

### LeadStatus

| Giá trị | Ý nghĩa |
|---------|---------|
| `New` | Mới tạo, chờ phân loại |
| `PendingResponse` | Chờ phản hồi SA |
| `InProgress` | Đang tư vấn |
| `Escalated` | Đã escalate |
| `Won` | Chốt thành công |
| `Lost` | Không chốt được |
| `Invalid` | Lead không hợp lệ |
| `Closed` | Đã đóng |

### PriorityLevel

| Giá trị | Gợi ý màu FE |
|---------|-------------|
| `High` | Đỏ |
| `Medium` | Vàng |
| `Low` | Xanh lá |

### Channel

| Giá trị |
|---------|
| `Web` |
| `Facebook` |
| `Zalo` |
| `Phone` |
| `Walkin` |
| `Other` |

### Period (query param)

| Giá trị | Ý nghĩa |
|---------|---------|
| `today` | Hôm nay |
| `week` | 7 ngày gần nhất |
| `month` | 30 ngày gần nhất (mặc định) |
| `quarter` | 90 ngày gần nhất |

---

## TN-01 — Tổng quan queue và backlog

```
GET /api/team-leads/overview
```

**Response 200**

```json
{
  "pendingResponse": 12,
  "inProgress": 8,
  "slaViolated": 3,
  "slaNearDeadline": 5,
  "trendLast7Days": [
    { "date": "2026-04-23", "count": 4 },
    { "date": "2026-04-24", "count": 7 },
    { "date": "2026-04-25", "count": 5 },
    { "date": "2026-04-26", "count": 9 },
    { "date": "2026-04-27", "count": 6 },
    { "date": "2026-04-28", "count": 11 },
    { "date": "2026-04-29", "count": 3 }
  ]
}
```

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `pendingResponse` | `int` | Số lead đang chờ SA phản hồi |
| `inProgress` | `int` | Số lead đang xử lý |
| `slaViolated` | `int` | Số lead đã vi phạm SLA |
| `slaNearDeadline` | `int` | Số lead còn < 2 tiếng đến SLA deadline |
| `trendLast7Days` | `array` | Số lead phát sinh mỗi ngày trong 7 ngày qua |

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |

---

## TN-02 — Lead vi phạm / sắp vi phạm SLA

```
GET /api/team-leads/sla-violations?page=1&pageSize=20
```

**Query params**

| Param | Mặc định | Mô tả |
|-------|----------|-------|
| `page` | `1` | Trang hiện tại |
| `pageSize` | `20` | Số phần tử mỗi trang |

**Response 200** — `PagedResult<SlaViolationDto>`

```json
{
  "items": [
    {
      "leadId": "uuid",
      "leadCode": "LD-00123",
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0901234567",
      "needType": "ConsultationRequest",
      "leadStatus": "InProgress",
      "priorityLevel": "High",
      "slaDeadline": "2026-04-29T10:00:00Z",
      "slaViolated": true,
      "assignedUserId": "uuid",
      "assignedUserName": "Trần Thị B",
      "hoursUntilDeadline": -2.5
    }
  ],
  "totalCount": 8,
  "page": 1,
  "pageSize": 20
}
```

**Gợi ý màu FE:**
- `slaViolated = true` → màu đỏ
- `hoursUntilDeadline` ≤ 2 (và chưa vi phạm) → màu cam

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |

---

## TN-03 — Danh sách + tìm kiếm lead trong đội

```
GET /api/team-leads?search=&status=&priorityLevel=&channel=&assignedUserId=&dateFrom=&dateTo=&page=1&pageSize=20
```

**Query params**

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `search` | `string?` | Tìm theo tên hoặc SĐT khách hàng |
| `status` | `string?` | Lọc theo `LeadStatus` (xem enum) |
| `priorityLevel` | `string?` | Lọc theo `PriorityLevel` |
| `channel` | `string?` | Lọc theo `Channel` |
| `assignedUserId` | `uuid?` | Lọc theo SA được gán |
| `dateFrom` | `datetime?` | Từ ngày tạo |
| `dateTo` | `datetime?` | Đến ngày tạo |
| `page` | `int` | Mặc định `1` |
| `pageSize` | `int` | Mặc định `20` |

**Response 200** — `PagedResult<TeamLeadListItemDto>`

```json
{
  "items": [
    {
      "leadId": "uuid",
      "leadCode": "LD-00124",
      "customerName": "Lê Văn C",
      "customerPhone": "0912345678",
      "needType": "PurchaseRequest",
      "leadStatus": "PendingResponse",
      "priorityLevel": "Medium",
      "slaDeadline": "2026-04-29T14:00:00Z",
      "slaViolated": false,
      "assignedUserId": "uuid",
      "assignedUserName": "Phạm Thị D"
    }
  ],
  "totalCount": 34,
  "page": 1,
  "pageSize": 20
}
```

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |

---

## TN-04 — Reassign lead

```
PATCH /api/team-leads/{leadId}/reassign
```

**Request body**

```json
{
  "newUserId": "uuid",
  "reason": "SA cũ nghỉ phép, chuyển sang SA khác cùng đội"
}
```

| Field | Kiểu | Bắt buộc | Giới hạn |
|-------|------|----------|---------|
| `newUserId` | `uuid` | ✅ | SA mới trong cùng đội |
| `reason` | `string` | ✅ | Tối đa 500 ký tự |

**Response 204** — No content

**Lưu ý business rule:**
- Lead phải đang được gán (có `assignedUserId`) và thuộc đội TN.
- `newUserId` phải là SA đang hoạt động trong cùng đội.
- Không thể reassign khi lead đã ở trạng thái terminal (`Won`, `Lost`, `Invalid`, `Closed`).
- SLA deadline được tính lại từ thời điểm reassign theo cấu hình SLA của nhóm + priority.
- Workload của SA cũ giảm 1, SA mới tăng 1.

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |
| `LEAD_NOT_FOUND` | 404 | Lead không tồn tại |
| `LEAD_NOT_ASSIGNED` | 400 | Lead chưa được gán cho SA nào |
| `LEAD_NOT_IN_TEAM` | 400 | Lead không thuộc đội TN hiện tại |
| `LEAD_TERMINAL` | 400 | Lead đã ở trạng thái kết thúc |
| `NEW_USER_NOT_FOUND` | 404 | SA mới không tồn tại hoặc không ở trong đội |
| `SAME_USER` | 400 | SA mới trùng với SA cũ |

---

## TN-05 — Escalate lead

```
POST /api/team-leads/{leadId}/escalate
```

**Request body**

```json
{
  "escalateTo": "uuid",
  "reason": "Yêu cầu đặc biệt cần QL xử lý"
}
```

| Field | Kiểu | Bắt buộc | Giới hạn |
|-------|------|----------|---------|
| `escalateTo` | `uuid` | ✅ | Phải là user có role `TN`, `QL`, hoặc `QT` |
| `reason` | `string` | ✅ | Tối đa 500 ký tự |

**Response 204** — No content

**Lưu ý business rule:**
- Lead phải thuộc đội TN (assigned user trong đội, hoặc lead chưa gán và createdBy trong đội).
- Lead không được ở trạng thái terminal.
- Escalate **không thay đổi trạng thái lead** — chỉ ghi log và gửi notification đến người nhận.
- Người nhận (`escalateTo`) phải có role `TN`, `QL`, hoặc `QT` (không thể escalate đến SA/CS).

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |
| `LEAD_NOT_FOUND` | 404 | Lead không tồn tại |
| `LEAD_NOT_ASSIGNED` | 400 | Lead chưa được gán và không liên quan đội TN |
| `LEAD_NOT_IN_TEAM` | 400 | Lead không thuộc đội TN hiện tại |
| `LEAD_TERMINAL` | 400 | Lead đã ở trạng thái kết thúc |
| `TARGET_NOT_FOUND` | 404 | User đích không tồn tại |
| `INVALID_TARGET_ROLE` | 400 | User đích không có quyền nhận escalate |

---

## TN-06 — Lịch sử escalate

```
GET /api/team-leads/escalate-history?page=1&pageSize=20
```

**Query params**

| Param | Mặc định | Mô tả |
|-------|----------|-------|
| `page` | `1` | |
| `pageSize` | `20` | |

**Response 200** — `PagedResult<EscalateHistoryItemDto>`

```json
{
  "items": [
    {
      "logId": "uuid",
      "leadId": "uuid",
      "leadCode": "LD-00125",
      "customerName": "Hoàng Văn E",
      "customerPhone": "0923456789",
      "escalateTo": "uuid",
      "escalateToName": "Nguyễn Quản Lý",
      "reason": "Khách hàng VIP, cần QL xử lý trực tiếp",
      "performedAt": "2026-04-29T09:30:00Z"
    }
  ],
  "totalCount": 5,
  "page": 1,
  "pageSize": 20
}
```

> Chỉ trả về lịch sử escalate **của TN đang đăng nhập**. Sắp xếp mới nhất lên trước.

---

## TN-07 — Thêm ghi chú nội bộ

> Ghi chú nội bộ **chỉ hiển thị** cho người dùng có role `TN`, `QL`, `QT`. SA và CS **không thấy** ghi chú này trong timeline.

### TN-07a — Ghi chú nội bộ trên Lead

```
POST /api/team-leads/{leadId}/internal-notes
```

**Request body**

```json
{
  "content": "Khách đã xác nhận quan tâm nhưng cần thêm thời gian suy nghĩ. Follow-up sau 3 ngày."
}
```

| Field | Kiểu | Bắt buộc | Giới hạn |
|-------|------|----------|---------|
| `content` | `string` | ✅ | Tối đa 2000 ký tự |

**Response 204** — No content

**Lưu ý:** Lead phải thuộc phạm vi đội TN (assigned user trong đội, hoặc nếu chưa gán thì createdBy trong đội).

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |
| `LEAD_NOT_FOUND` | 404 | Lead không tồn tại |
| `LEAD_NOT_IN_SCOPE` | 400 | Lead không thuộc phạm vi đội TN |

### TN-07b — Ghi chú nội bộ trên Ticket

```
POST /api/my-team/tickets/{ticketId}/internal-notes
```

**Request body** (giống TN-07a)

```json
{
  "content": "CS đang chờ phản hồi từ bộ phận kỹ thuật trước khi giải quyết."
}
```

**Response 204** — No content

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |
| `TICKET_NOT_FOUND` | 404 | Ticket không tồn tại |
| `TICKET_NOT_IN_SCOPE` | 400 | Ticket không thuộc phạm vi đội TN |

---

## TN-08 — Hiệu suất thành viên

```
GET /api/my-team/members/{userId}/performance?period=month
```

**Query params**

| Param | Mặc định | Mô tả |
|-------|----------|-------|
| `period` | `month` | `today` / `week` / `month` / `quarter` |

**Response 200** — `MemberPerformanceDto`

```json
{
  "userId": "uuid",
  "fullName": "Trần Thị B",
  "period": "month",
  "periodStart": "2026-03-30T00:00:00Z",
  "periodEnd": "2026-04-29T00:00:00Z",
  "totalAssigned": 42,
  "totalProcessed": 38,
  "wonCount": 14,
  "winRate": 36.84,
  "avgResponseTimeMinutes": 23.5,
  "slaViolatedCount": 3,
  "generatedAt": "2026-04-29T10:00:00Z"
}
```

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `totalAssigned` | `int` | Tổng lead được gán trong kỳ |
| `totalProcessed` | `int` | Số lead đã chuyển sang trạng thái không phải `New`/`PendingResponse` |
| `wonCount` | `int` | Số lead chốt thành công (`Won`) |
| `winRate` | `double?` | Tỷ lệ chốt = wonCount / totalProcessed × 100 (null nếu totalProcessed = 0) |
| `avgResponseTimeMinutes` | `double?` | Thời gian phản hồi trung bình (phút) kể từ `AssignedAt` đến lần đầu SA phản hồi |
| `slaViolatedCount` | `int` | Số lead vi phạm SLA trong kỳ |

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |
| `MEMBER_NOT_FOUND` | 404 | User không tồn tại hoặc không trong đội |

---

## TN-09 — Báo cáo đội

```
GET /api/team-leads/report?period=month&dateFrom=&dateTo=
```

**Query params**

| Param | Mặc định | Mô tả |
|-------|----------|-------|
| `period` | `month` | `today` / `week` / `month` / `quarter`. Bỏ qua nếu `dateFrom` + `dateTo` được truyền |
| `dateFrom` | — | Từ ngày (nếu dùng custom range) |
| `dateTo` | — | Đến ngày (nếu dùng custom range) |

> Khi FE muốn custom range: truyền `dateFrom` và `dateTo`, giá trị `period` sẽ bị bỏ qua.

**Response 200** — `TeamReportDto`

```json
{
  "period": "month",
  "periodStart": "2026-03-30T00:00:00Z",
  "periodEnd": "2026-04-29T00:00:00Z",
  "totalLeads": 127,
  "byStatus": {
    "New": 5,
    "PendingResponse": 12,
    "InProgress": 20,
    "Escalated": 3,
    "Won": 48,
    "Lost": 30,
    "Invalid": 6,
    "Closed": 3
  },
  "slaAchievedCount": 102,
  "slaViolatedCount": 25,
  "slaAchievedRate": 80.31,
  "wonCount": 48,
  "winRate": 37.80,
  "dailyTrend": [
    { "date": "2026-04-23", "count": 9 },
    { "date": "2026-04-24", "count": 11 }
  ],
  "generatedAt": "2026-04-29T10:00:00Z"
}
```

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `byStatus` | `object` | Map từ LeadStatus → số lượng lead trong kỳ |
| `slaAchievedRate` | `double?` | % lead đạt SLA (null nếu totalLeads = 0) |
| `winRate` | `double?` | % lead chốt thành công (null nếu totalLeads = 0) |
| `dailyTrend` | `array` | Số lead phát sinh mỗi ngày trong kỳ |

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |
| `INVALID_PERIOD` | 400 | Giá trị `period` không hợp lệ |

---

## TN-10 — Danh sách thành viên

```
GET /api/my-team/members
```

**Response 200** — `List<TeamMemberDto>`

```json
[
  {
    "userId": "uuid",
    "fullName": "Trần Thị B",
    "roleName": "SA",
    "isActive": true,
    "currentWorkload": 5,
    "lastAssignedAt": "2026-04-29T08:30:00Z"
  }
]
```

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `currentWorkload` | `int` | Số lead đang xử lý hiện tại |
| `lastAssignedAt` | `datetime?` | Lần gần nhất được gán lead mới |

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |

---

## TN-11 — Thêm thành viên

```
POST /api/my-team/members
```

**Request body**

```json
{
  "userId": "uuid"
}
```

**Response 204** — No content

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |
| `USER_NOT_FOUND` | 404 | User không tồn tại |
| `USER_ALREADY_IN_TEAM` | 400 | User đã thuộc đội này |
| `USER_IN_OTHER_TEAM` | 400 | User đã thuộc đội khác |

---

## TN-12 — Xóa thành viên

```
DELETE /api/my-team/members/{userId}
```

**Response 204** — No content

**Response 409 — Còn lead chưa hoàn tất**

```json
{
  "errorCode": "ACTIVE_LEADS_WARNING",
  "errorMessage": "Thành viên còn lead đang xử lý. Hãy reassign trước khi xóa."
}
```

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |
| `USER_NOT_FOUND` | 404 | User không tồn tại |
| `USER_NOT_IN_TEAM` | 404 | User không thuộc đội TN |
| `ACTIVE_LEADS_WARNING` | 409 | Còn lead đang xử lý — FE nên hiện cảnh báo + yêu cầu reassign trước |

---

## Hướng dẫn tích hợp FE

### Gợi ý UX cho TN-04 (Reassign)
- Hiển thị dropdown danh sách SA trong đội (gọi TN-10 để lấy danh sách, lọc `isActive = true`).
- Sau khi reassign thành công (204), refresh danh sách lead TN-03.

### Gợi ý UX cho TN-05 (Escalate)
- Cần API tra cứu danh sách user có role TN/QL/QT để hiện dropdown `escalateTo`. Đây là dữ liệu master — tham khảo endpoint `/api/users` với filter role.
- Escalate **không đổi badge trạng thái lead** trên màn hình TN-03, chỉ tạo bản ghi log.

### Gợi ý UX cho TN-07 (Internal Note)
- Hiện ghi chú nội bộ trong timeline với badge màu khác biệt (ví dụ: nền vàng nhạt, icon khóa).
- Timeline API (SA-02, CS-02) đã lọc `isInternal = true` — SA và CS sẽ **không nhìn thấy** những ghi chú này.

### Gợi ý UX cho TN-12 (Xóa thành viên)
- Khi nhận `409 ACTIVE_LEADS_WARNING`: hiện modal cảnh báo với nút "Reassign leads" (chuyển đến màn hình TN-04) và nút "Hủy".
- Không tự động force-remove khi còn lead đang xử lý.

### Error format chung

Tất cả lỗi trả về JSON:
```json
{
  "errorCode": "ERROR_CODE",
  "errorMessage": "Mô tả lỗi tiếng Việt"
}
```

HTTP mapping:
- `400` — lỗi nghiệp vụ (validation, trạng thái không hợp lệ)
- `404` — không tìm thấy resource
- `409` — conflict (còn lead đang xử lý)
- `401` — chưa đăng nhập
- `403` — không có quyền (role không phải TN)
