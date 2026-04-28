# PHASE 3 — Xử lý Lead Sale (SA-01 → SA-05)

> **Ngày:** 2026-04-28  
> **Phạm vi:** SA-01, SA-02, SA-03, SA-04, SA-05  
> **Role:** `SA` (policy `CanProcessLead`)  
> **Base URL:** `/api/sale-leads`  
> **Auth:** Bearer JWT — tất cả endpoint đều yêu cầu role `SA`

---

## Tổng quan các endpoint

| Method | URL | SA task | Mô tả |
|--------|-----|---------|-------|
| `GET` | `/api/sale-leads` | SA-01 + SA-03 | Danh sách lead được gán + tìm kiếm/lọc |
| `GET` | `/api/sale-leads/{id}` | SA-02 | Chi tiết lead + activity timeline |
| `PATCH` | `/api/sale-leads/{id}/status` | SA-04 | Cập nhật trạng thái xử lý |
| `POST` | `/api/sale-leads/{id}/notes` | SA-05 | Ghi chú nội dung tư vấn |

---

## 1. GET `/api/sale-leads` — Danh sách lead được gán (SA-01 + SA-03)

Trả về danh sách lead đang được gán cho nhân viên SA đang đăng nhập.  
Sắp xếp mặc định: **PriorityLevel giảm dần** (High → Medium → Low), sau đó **SlaDeadline tăng dần** (sắp vi phạm trước).

### Query parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| `search` | `string` | Không | Tìm theo SĐT (exact) hoặc tên (contains) |
| `status` | `string` | Không | Lọc theo trạng thái (xem enum) |
| `priorityLevel` | `string` | Không | `Low` \| `Medium` \| `High` |
| `channel` | `string` | Không | Kênh tiếp nhận (xem enum) |
| `dateFrom` | `ISO8601` | Không | Ngày được gán từ (AssignedAt ≥) |
| `dateTo` | `ISO8601` | Không | Ngày được gán đến (AssignedAt ≤) |
| `page` | `int` | Không | Mặc định `1` |
| `pageSize` | `int` | Không | Mặc định `20` |

### Response 200

```json
{
  "items": [
    {
      "leadId": "guid",
      "leadCode": "LEAD-20260428-0001",
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0901234567",
      "needType": "SALES",
      "leadStatus": "Assigned",
      "priorityLevel": "High",
      "slaDeadline": "2026-04-29T10:00:00Z",
      "slaViolated": false,
      "assignedAt": "2026-04-28T08:00:00Z"
    }
  ],
  "totalCount": 42,
  "page": 1,
  "pageSize": 20
}
```

### Enum `leadStatus` hiển thị cho SA

| Giá trị | Hiển thị gợi ý |
|---------|----------------|
| `Assigned` | Chờ tiếp nhận |
| `Contacted` | Đã liên hệ |
| `InProgress` | Đang tư vấn |
| `Won` | Chốt thành công |
| `Lost` | Không chốt được |
| `Cancelled` | Đã hủy |

---

## 2. GET `/api/sale-leads/{id}` — Chi tiết lead (SA-02)

Trả về đầy đủ thông tin lead + toàn bộ activity timeline (log trạng thái + ghi chú tư vấn).  
Chỉ trả về lead đang được gán cho nhân viên SA hiện tại.

### Response 200

```json
{
  "leadId": "guid",
  "leadCode": "LEAD-20260428-0001",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "customerAddress": "123 Lê Lợi, Q1, TP.HCM",
  "customerEmail": "a@email.com",
  "channel": "Phone",
  "needDescription": "Muốn mua điện thoại cao cấp",
  "productInterest": ["iPhone 16", "Samsung S25"],
  "needType": "SALES",
  "priorityScore": 85,
  "priorityLevel": "High",
  "assignedGroup": "SALE",
  "routingType": "AutoAssign",
  "assignedUserId": "guid",
  "assignedUserName": "Trần Thị B",
  "assignedStoreId": null,
  "assignedAt": "2026-04-28T08:00:00Z",
  "slaDeadline": "2026-04-29T10:00:00Z",
  "slaViolated": false,
  "leadStatus": "Assigned",
  "createdBy": "guid",
  "createdAt": "2026-04-28T07:45:00Z",
  "updatedAt": "2026-04-28T08:00:00Z",
  "closedAt": null,
  "activityLogs": [
    {
      "id": "guid",
      "action": "LEAD_CREATED",
      "note": null,
      "newValue": null,
      "performedAt": "2026-04-28T07:45:00Z",
      "performedByName": "Lê Văn C"
    },
    {
      "id": "guid",
      "action": "STATUS_CHANGED",
      "note": "Khách hàng quan tâm, hẹn gọi lại lúc 10h",
      "newValue": "Contacted",
      "performedAt": "2026-04-28T09:00:00Z",
      "performedByName": "Trần Thị B"
    },
    {
      "id": "guid",
      "action": "CONSULTATION_NOTE",
      "note": "Khách đã xem demo sản phẩm, cân nhắc thêm",
      "newValue": null,
      "performedAt": "2026-04-28T10:30:00Z",
      "performedByName": "Trần Thị B"
    }
  ]
}
```

### Enum `action` trong activityLogs

| Giá trị | Ý nghĩa |
|---------|---------|
| `LEAD_CREATED` | Lead được tạo |
| `LEAD_ASSIGNED` | Engine gán cho SA |
| `STATUS_CHANGED` | SA chuyển trạng thái |
| `CONSULTATION_NOTE` | SA ghi chú tư vấn |
| `LEAD_UPDATED` | TV sửa thông tin lead |

### Response 404

```json
{ "errorCode": "NOT_FOUND", "errorMessage": "Lead không tồn tại hoặc chưa được gán cho bạn." }
```

---

## 3. PATCH `/api/sale-leads/{id}/status` — Cập nhật trạng thái (SA-04)

Chuyển trạng thái theo luồng một chiều (BR-05). Mỗi lần gọi tạo 1 activity log `STATUS_CHANGED`.

### Luồng trạng thái hợp lệ

```
Assigned ──→ Contacted ──→ InProgress ──→ Won
    │              │              │──────→ Lost
    └──────────────┴──────────────┴──────→ Cancelled
```

### Request body

```json
{
  "leadId": "guid",
  "newStatus": "Contacted",
  "note": "Đã liên hệ khách, hẹn tư vấn 14h",
  "lostReason": null,
  "cancelReason": null,
  "wonDetails": null
}
```

### Quy tắc validation

| `newStatus` | Trường bắt buộc |
|-------------|----------------|
| `Contacted` | `note` |
| `InProgress` | `note` |
| `Won` | `wonDetails` (khuyến khích, không bắt buộc) |
| `Lost` | `lostReason` |
| `Cancelled` | `cancelReason` |

### Response 200

```json
{
  "leadId": "guid",
  "leadCode": "LEAD-20260428-0001",
  "newStatus": "Contacted",
  "updatedAt": "2026-04-28T09:00:00Z"
}
```

### Response 400 — Lỗi có thể xảy ra

| `errorCode` | Nguyên nhân |
|-------------|-------------|
| `VALIDATION_ERROR` | Thiếu field bắt buộc (note/lostReason/cancelReason) |
| `INVALID_STATUS` | `newStatus` không hợp lệ |
| `INVALID_TRANSITION` | Chuyển trạng thái không theo luồng (BR-05) |
| `ID_MISMATCH` | `id` URL ≠ `leadId` trong body |

### Response 404

```json
{ "errorCode": "NOT_FOUND", "errorMessage": "Lead không tồn tại hoặc chưa được gán cho bạn." }
```

---

## 4. POST `/api/sale-leads/{id}/notes` — Ghi chú tư vấn (SA-05)

Thêm ghi chú tư vấn vào timeline của lead. Không giới hạn số lượng ghi chú.  
Ghi chú xuất hiện trong `activityLogs` với `action = "CONSULTATION_NOTE"`.

### Request body

```json
{
  "leadId": "guid",
  "content": "Khách đã xem demo sản phẩm, cân nhắc thêm về giá. Hẹn follow-up ngày mai."
}
```

| Tên | Ràng buộc |
|-----|-----------|
| `content` | Bắt buộc, tối đa 2000 ký tự |

### Response 201

```json
{
  "noteId": "guid",
  "leadId": "guid",
  "createdAt": "2026-04-28T10:30:00Z"
}
```

### Response 400

| `errorCode` | Nguyên nhân |
|-------------|-------------|
| `VALIDATION_ERROR` | `content` rỗng hoặc vượt 2000 ký tự |
| `ID_MISMATCH` | `id` URL ≠ `leadId` trong body |

### Response 404

```json
{ "errorCode": "NOT_FOUND", "errorMessage": "Lead không tồn tại hoặc chưa được gán cho bạn." }
```

---

## Phạm vi dữ liệu

- **Tất cả endpoint** chỉ trả về / thao tác trên lead có `AssignedUserId == currentUserId`.
- SA không thể xem lead của đồng nghiệp, không thể thao tác lead chưa được gán cho mình.

## Luồng tích hợp điển hình

```
1. [Trang chủ SA] GET /api/sale-leads
   → Hiển thị danh sách, badge SLA vi phạm, sort High priority trước

2. [Click vào lead] GET /api/sale-leads/{id}
   → Hiển thị panel chi tiết + timeline tư vấn bên phải

3. [SA liên hệ KH] PATCH /api/sale-leads/{id}/status
   body: { newStatus: "Contacted", note: "..." }

4. [Trong lúc tư vấn] POST /api/sale-leads/{id}/notes
   body: { content: "..." }
   → Ghi chú xuất hiện ngay trong timeline

5. [Chốt deal] PATCH /api/sale-leads/{id}/status
   body: { newStatus: "Won", wonDetails: "..." }
```
