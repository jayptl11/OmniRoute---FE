# PHASE 6 — Tích hợp FE: Team Lead (TN-01 → TN-12)

> **Ngày:** 2026-04-29
> **Role:** `TN` — JWT claim `role = "TN"`
> **Auth header:** `Authorization: Bearer <access_token>` — bắt buộc trên toàn bộ endpoint
> **Content-Type:** `application/json` cho mọi request có body

---

## Danh sách endpoint

### Controller `/api/team-leads` — quản lý lead trong đội

| Method | Path | Task | Ghi chú |
|--------|------|------|---------|
| `GET` | `/api/team-leads/overview` | TN-01 | Dashboard tổng quan |
| `GET` | `/api/team-leads/sla-violations` | TN-02 | Lead vi phạm / sắp vi phạm SLA |
| `GET` | `/api/team-leads` | TN-03 | Danh sách + tìm kiếm lead trong đội |
| `PATCH` | `/api/team-leads/{leadId}/reassign` | TN-04 | Reassign lead sang SA khác |
| `GET` | `/api/team-leads/escalate-targets` | TN-05 helper | Danh sách user nhận escalate — dùng cho dropdown |
| `POST` | `/api/team-leads/{leadId}/escalate` | TN-05 | Gửi escalate |
| `GET` | `/api/team-leads/escalate-history` | TN-06 | Lịch sử escalate đã thực hiện |
| `POST` | `/api/team-leads/{leadId}/internal-notes` | TN-07a | Ghi chú nội bộ trên lead |
| `GET` | `/api/team-leads/report` | TN-09 | Báo cáo đội theo kỳ |

### Controller `/api/my-team` — quản lý thành viên đội

| Method | Path | Task | Ghi chú |
|--------|------|------|---------|
| `GET` | `/api/my-team/members/search` | TN-11 helper | Tìm user để thêm vào đội — dùng cho dropdown |
| `GET` | `/api/my-team/members` | TN-10 | Danh sách thành viên hiện tại |
| `POST` | `/api/my-team/members` | TN-11 | Thêm thành viên |
| `DELETE` | `/api/my-team/members/{userId}` | TN-12 | Xóa thành viên |
| `GET` | `/api/my-team/members/{userId}/performance` | TN-08 | Hiệu suất từng thành viên |
| `POST` | `/api/my-team/tickets/{ticketId}/internal-notes` | TN-07b | Ghi chú nội bộ trên ticket |

---

## Enum tham chiếu

### LeadStatus

| Giá trị | Ý nghĩa | Màu gợi ý |
|---------|---------|-----------|
| `New` | Mới, chưa xử lý | Xám |
| `PendingResponse` | Chờ SA phản hồi | Xanh dương |
| `InProgress` | Đang tư vấn | Xanh lá |
| `Escalated` | Đã escalate | Cam |
| `Won` | Chốt thành công | Xanh đậm |
| `Lost` | Không thành công | Đỏ nhạt |
| `Invalid` | Lead không hợp lệ | Xám đậm |
| `Closed` | Đã đóng | Xám |

### PriorityLevel

| Giá trị | Màu gợi ý |
|---------|-----------|
| `High` | Đỏ |
| `Medium` | Vàng |
| `Low` | Xanh lá |

### Channel

`Web` · `Facebook` · `Zalo` · `Phone` · `Walkin` · `Other`

### Period (query param cho TN-08, TN-09)

| Giá trị | Khoảng thời gian |
|---------|-----------------|
| `today` | Hôm nay |
| `week` | 7 ngày gần nhất |
| `month` | 30 ngày gần nhất *(mặc định)* |
| `quarter` | 90 ngày gần nhất |

---

## Format lỗi chung

Tất cả lỗi trả về JSON:

```json
{ "errorCode": "ERROR_CODE", "errorMessage": "Mô tả lỗi" }
```

| HTTP | Ý nghĩa |
|------|---------|
| `400` | Lỗi nghiệp vụ — xem `errorCode` |
| `401` | Chưa đăng nhập / token hết hạn |
| `403` | Không có quyền (không phải role TN) |
| `404` | Không tìm thấy resource |
| `409` | Conflict (còn lead đang xử lý) |

---

## TN-01 — Tổng quan đội

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
| `trendLast7Days` | `array` | Lead tạo mới mỗi ngày trong 7 ngày qua |

**Errors:** `NO_TEAM` 400

---

## TN-02 — SLA Alert

```
GET /api/team-leads/sla-violations?page=1&pageSize=20
```

**Response 200** — `PagedResult<SlaViolationDto>`

```json
{
  "items": [
    {
      "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "leadCode": "LD-00123",
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0901234567",
      "needType": "ConsultationRequest",
      "leadStatus": "InProgress",
      "priorityLevel": "High",
      "slaDeadline": "2026-04-29T10:00:00Z",
      "slaViolated": true,
      "assignedUserId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "assignedUserName": "Trần Thị B",
      "hoursUntilDeadline": -2.5
    }
  ],
  "totalCount": 8,
  "page": 1,
  "pageSize": 20
}
```

**Màu sắc FE:**
- `slaViolated = true` → đỏ
- `hoursUntilDeadline ≤ 2` và chưa vi phạm → cam
- `hoursUntilDeadline` âm = đã quá hạn bao nhiêu tiếng

**Errors:** `NO_TEAM` 400

---

## TN-03 — Danh sách lead trong đội

```
GET /api/team-leads?search=&status=&priorityLevel=&channel=&assignedUserId=&dateFrom=&dateTo=&page=1&pageSize=20
```

**Query params**

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `search` | `string?` | Tìm theo tên hoặc SĐT khách hàng |
| `status` | `string?` | Lọc `LeadStatus` |
| `priorityLevel` | `string?` | Lọc `PriorityLevel` |
| `channel` | `string?` | Lọc `Channel` |
| `assignedUserId` | `uuid?` | Lọc theo SA được gán |
| `dateFrom` | `datetime?` | Từ ngày tạo (ISO 8601) |
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

**Errors:** `NO_TEAM` 400

---

## TN-04 — Reassign lead

```
PATCH /api/team-leads/{leadId}/reassign
```

**Request body**

```json
{
  "newUserId": "uuid",
  "reason": "SA cũ nghỉ phép"
}
```

| Field | Bắt buộc | Giới hạn |
|-------|----------|---------|
| `newUserId` | ✅ | SA đang active trong đội |
| `reason` | ✅ | Tối đa 500 ký tự |

**Response:** `204 No Content`

**Lưu ý nghiệp vụ:**
- Lead không được ở trạng thái terminal (`Won`, `Lost`, `Invalid`, `Closed`)
- SLA deadline được tính lại từ thời điểm reassign
- Workload SA cũ giảm 1, SA mới tăng 1
- SA mới nhận notification `NEW_LEAD`

**Dropdown `newUserId`:** Dùng TN-10 `GET /api/my-team/members`, lọc `isActive = true`

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa có đội |
| `LEAD_NOT_FOUND` | 404 | Lead không tồn tại |
| `LEAD_NOT_ASSIGNED` | 400 | Lead chưa gán cho SA nào |
| `LEAD_NOT_IN_TEAM` | 400 | Lead không thuộc đội TN |
| `LEAD_TERMINAL` | 400 | Lead đã đóng/chốt/hủy |
| `NEW_USER_NOT_FOUND` | 404 | SA mới không tồn tại hoặc không trong đội |
| `SAME_USER` | 400 | SA mới trùng SA cũ |

---

## TN-05 helper — Danh sách user nhận escalate

> Gọi trước khi mở EscalateDialog để populate dropdown.

```
GET /api/team-leads/escalate-targets
```

**Response 200** — `List<EscalateTargetDto>`

```json
[
  { "userId": "uuid", "fullName": "Nguyễn Quản Lý", "roleName": "QL" },
  { "userId": "uuid", "fullName": "Trần Trưởng Nhóm", "roleName": "TN" },
  { "userId": "uuid", "fullName": "Lê Quản Trị", "roleName": "QT" }
]
```

- Đã lọc sẵn: active, role `TN/QL/QT`, loại trừ TN đang đăng nhập
- Sắp xếp: QT → QL → TN, rồi theo tên

**Errors:** `NO_TEAM` 400

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

| Field | Bắt buộc | Giới hạn |
|-------|----------|---------|
| `escalateTo` | ✅ | UUID từ kết quả `escalate-targets` |
| `reason` | ✅ | Tối đa 500 ký tự |

**Response:** `204 No Content`

**Lưu ý nghiệp vụ:**
- Escalate **KHÔNG thay đổi `leadStatus`** — chỉ ghi log + gửi notification cho người nhận
- Lead không được ở trạng thái terminal

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | |
| `LEAD_NOT_FOUND` | 404 | |
| `LEAD_NOT_ASSIGNED` | 400 | Lead chưa gán và không liên quan đội TN |
| `LEAD_NOT_IN_TEAM` | 400 | |
| `LEAD_TERMINAL` | 400 | |
| `TARGET_NOT_FOUND` | 404 | User đích không tồn tại |
| `INVALID_TARGET_ROLE` | 400 | User đích không phải TN/QL/QT |

---

## TN-06 — Lịch sử escalate

```
GET /api/team-leads/escalate-history?page=1&pageSize=20
```

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
      "reason": "Khách VIP, cần QL xử lý",
      "performedAt": "2026-04-29T09:30:00Z"
    }
  ],
  "totalCount": 5,
  "page": 1,
  "pageSize": 20
}
```

- Chỉ trả về lịch sử của TN đang đăng nhập, sắp xếp mới nhất lên trước

---

## TN-07a — Ghi chú nội bộ trên lead

```
POST /api/team-leads/{leadId}/internal-notes
```

**Request body**

```json
{ "content": "Khách cần thêm 3 ngày suy nghĩ. Follow-up thứ 5." }
```

| Field | Bắt buộc | Giới hạn |
|-------|----------|---------|
| `content` | ✅ | Tối đa 2000 ký tự |

**Response:** `204 No Content`

**Quan trọng:** Ghi chú nội bộ **không hiển thị** cho SA trong timeline lead (SA-02). Chỉ TN/QL/QT thấy.

**Errors**

| Code | HTTP |
|------|------|
| `NO_TEAM` | 400 |
| `LEAD_NOT_FOUND` | 404 |
| `LEAD_NOT_IN_SCOPE` | 400 |

---

## TN-07b — Ghi chú nội bộ trên ticket

```
POST /api/my-team/tickets/{ticketId}/internal-notes
```

**Request body** (giống TN-07a)

```json
{ "content": "CS đang chờ phản hồi từ kỹ thuật." }
```

**Response:** `204 No Content`

**Quan trọng:** Ghi chú nội bộ **không hiển thị** cho CS trong timeline ticket (CS-02).

**Errors**

| Code | HTTP |
|------|------|
| `NO_TEAM` | 400 |
| `TICKET_NOT_FOUND` | 404 |
| `TICKET_NOT_IN_SCOPE` | 400 |

---

## TN-08 — Hiệu suất thành viên

```
GET /api/my-team/members/{userId}/performance?period=month
```

**Query params:** `period` — xem enum Period ở đầu tài liệu

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

| Field | Mô tả |
|-------|-------|
| `totalAssigned` | Tổng lead được gán trong kỳ |
| `totalProcessed` | Lead đã qua xử lý (không còn ở `New`/`PendingResponse`) |
| `wonCount` | Lead chốt thành công |
| `winRate` | `wonCount / totalProcessed × 100` — `null` nếu `totalProcessed = 0` |
| `avgResponseTimeMinutes` | Thời gian phản hồi trung bình tính từ `assignedAt` |
| `slaViolatedCount` | Lead vi phạm SLA trong kỳ |

**Errors**

| Code | HTTP |
|------|------|
| `NO_TEAM` | 400 |
| `MEMBER_NOT_FOUND` | 404 |

---

## TN-09 — Báo cáo đội

```
GET /api/team-leads/report?period=month
GET /api/team-leads/report?dateFrom=2026-04-01&dateTo=2026-04-29
```

**Query params**

| Param | Mặc định | Mô tả |
|-------|----------|-------|
| `period` | `month` | Bỏ qua nếu truyền cả `dateFrom` + `dateTo` |
| `dateFrom` | — | Custom range — dùng kèm `dateTo` |
| `dateTo` | — | Custom range — dùng kèm `dateFrom` |

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
    { "date": "2026-04-28", "count": 11 },
    { "date": "2026-04-29", "count": 3 }
  ],
  "generatedAt": "2026-04-29T10:00:00Z"
}
```

| Field | Mô tả |
|-------|-------|
| `byStatus` | Map `LeadStatus → số lead` — key luôn có đủ 8 trạng thái |
| `slaAchievedRate` | % lead đạt SLA — `null` nếu `totalLeads = 0` |
| `winRate` | % lead chốt thành công — `null` nếu `totalLeads = 0` |
| `dailyTrend` | Lead mới mỗi ngày trong kỳ |

**Errors:** `NO_TEAM` 400 · `INVALID_PERIOD` 400

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

| Field | Mô tả |
|-------|-------|
| `currentWorkload` | Số lead đang xử lý hiện tại |
| `lastAssignedAt` | Lần gần nhất nhận lead mới — dùng để chọn SA ít tải nhất khi reassign |

**Errors:** `NO_TEAM` 400

---

## TN-11 helper — Tìm user để thêm vào đội

> Gọi khi mở dialog "Thêm thành viên". Đã lọc sẵn đúng role theo loại đội.

```
GET /api/my-team/members/search?q=nguyen
```

| Param | Mô tả |
|-------|-------|
| `q` | Tìm theo họ tên hoặc username. Để trống → trả về 30 user đầu |

**Response 200** — `List<AddableUserDto>`

```json
[
  {
    "userId": "uuid",
    "fullName": "Nguyễn Văn SA",
    "username": "sale01",
    "roleName": "SA",
    "hasTeam": false
  },
  {
    "userId": "uuid",
    "fullName": "Nguyễn Thị SA2",
    "username": "sale02",
    "roleName": "SA",
    "hasTeam": true
  }
]
```

| Field | Mô tả |
|-------|-------|
| `hasTeam` | `false` = chưa có đội → có thể thêm ngay. `true` = đang ở đội khác → thêm sẽ lỗi `IN_OTHER_TEAM` |

**Lọc role tự động theo loại đội:**

| Loại đội (`TeamType`) | Role được trả về |
|-----------------------|-----------------|
| `Sale` | `SA` |
| `Cskh` | `CS` |
| `StoreSupport` | `DP` |

**Errors:** `NO_TEAM` 400

---

## TN-11 — Thêm thành viên

```
POST /api/my-team/members
Content-Type: application/json

{ "userId": "uuid" }
```

**Response:** `204 No Content`

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa có đội |
| `USER_NOT_FOUND` | 404 | User không tồn tại |
| `USER_INACTIVE` | 400 | User đã bị khóa |
| `INVALID_ROLE` | 400 | Role không phù hợp loại đội (không xảy ra nếu dùng search endpoint) |
| `ALREADY_IN_TEAM` | 400 | Đã là thành viên đội này |
| `IN_OTHER_TEAM` | 400 | Đang thuộc đội khác |

---

## TN-12 — Xóa thành viên

```
DELETE /api/my-team/members/{userId}
```

**Response:** `204 No Content`

**Response 409** — còn lead đang xử lý

```json
{
  "errorCode": "ACTIVE_LEADS_WARNING",
  "errorMessage": "Thành viên còn lead đang xử lý. Hãy reassign trước khi xóa."
}
```

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | |
| `USER_NOT_FOUND` | 404 | |
| `USER_NOT_IN_TEAM` | 404 | User không thuộc đội TN |
| `ACTIVE_LEADS_WARNING` | 409 | Còn lead đang xử lý |

**UX khi nhận 409:** Hiện modal cảnh báo + nút "Reassign leads" (chuyển sang TN-04) + nút "Hủy". Không tự động force-remove.

---

## Luồng UX tham khảo

### Màn hình Danh sách lead (TN-03)
1. Load lần đầu: `GET /api/team-leads?page=1&pageSize=20`
2. Tìm kiếm: gọi lại với `search=...`, debounce 300ms
3. Lọc theo status/priority: thêm query param tương ứng
4. Click "Reassign": mở dialog → lấy danh sách SA từ TN-10 (`isActive=true`) → chọn → PATCH reassign
5. Click "Escalate": mở dialog → lấy danh sách từ TN-05 helper → chọn → POST escalate

### Màn hình Quản lý đội (TN-10/11/12)
1. Load danh sách: `GET /api/my-team/members`
2. Click "+ Thêm": gọi `GET /api/my-team/members/search` → hiện dropdown → debounce search khi gõ → chọn → POST
3. Click xóa: `DELETE` → nếu 409 hiện warning với gợi ý reassign

### Màn hình Hiệu suất (TN-08)
1. Chọn thành viên từ danh sách TN-10
2. Gọi `GET /api/my-team/members/{userId}/performance?period=month`
3. Đổi period: gọi lại với period mới

### Ghi chú nội bộ (TN-07)
- Hiện trong timeline với badge riêng (ví dụ nền vàng nhạt + icon khóa)
- SA và CS **không thấy** — đã lọc ở backend
