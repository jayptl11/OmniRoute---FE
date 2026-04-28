# API Integration — PHASE 2: Tạo & Tiếp Nhận Lead (TV-01 → TV-07)

**Ngày:** 2026-04-28  
**Role áp dụng:** TV (Tư vấn / Tiếp nhận)  
**Base URL:** `/api/leads`  
**Auth:** Bearer JWT — tất cả endpoint yêu cầu role `TV`

---

## Tổng quan endpoints

| Method | Endpoint | Feature | Mô tả |
|---|---|---|---|
| `POST` | `/api/leads` | TV-01 | Tạo lead mới |
| `GET` | `/api/leads/check-duplicate?phone=` | TV-02 | Kiểm tra duplicate realtime |
| `GET` | `/api/leads/{id}` | TV-06 + TV-03 | Chi tiết lead + kết quả phân loại |
| `GET` | `/api/leads` | TV-05 + TV-07 | Danh sách lead + tìm kiếm |
| `PUT` | `/api/leads/{id}` | TV-04 | Cập nhật thông tin lead |

---

## TV-02 — Kiểm tra duplicate realtime

### `GET /api/leads/check-duplicate?phone={phone}`

Gọi khi user blur khỏi field SĐT trong form tạo lead. Debounce 500ms phía FE.

**Query params:**

| Param | Bắt buộc | Mô tả |
|---|---|---|
| `phone` | ✅ | Số điện thoại cần kiểm tra |

**Response 200:**

```json
{
  "hasDuplicate": false,
  "existingLeadId": null,
  "existingLeadCode": null,
  "existingLeadStatus": null,
  "existingLeadCreatedAt": null
}
```

```json
{
  "hasDuplicate": true,
  "existingLeadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "existingLeadCode": "LD-20260428-0001",
  "existingLeadStatus": "Assigned",
  "existingLeadCreatedAt": "2026-04-28T08:30:00Z"
}
```

**FE handling:** Nếu `hasDuplicate = true` → hiển thị banner cảnh báo bên dưới field SĐT với thông tin lead cũ. User vẫn có thể tiếp tục tạo lead mới bằng cách set `forceCreate: true` trong TV-01.

---

## TV-01 — Tạo lead mới

### `POST /api/leads`

**Request body:**

```json
{
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "channel": "Hotline",
  "needDescription": "Khách muốn tư vấn gói cước trả sau cho doanh nghiệp",
  "customerAddress": "123 Lê Lợi, Q1, TP.HCM",
  "customerEmail": "nguyenvana@email.com",
  "productInterest": ["Gói cước doanh nghiệp", "Sim data"],
  "forceCreate": false
}
```

**Trường bắt buộc:** `customerName`, `customerPhone`, `channel`, `needDescription`

**`channel` enum values:** `Hotline` | `Walkin` | `Webform` | `Chat` | `Email` | `Zalo` | `Referral`

**`customerPhone` format:** 10 chữ số, bắt đầu bằng `0` (regex: `^0\d{9}$`)

**`needDescription`:** tối thiểu 10 ký tự

**`forceCreate`:** `false` (default) — nếu trùng SĐT, API trả 200 với `isDuplicate=true`. Set `true` để tạo mới dù trùng SĐT.

**Response 201 — Tạo thành công:**

```json
{
  "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leadCode": "LD-20260428-0001",
  "isDuplicate": false,
  "existingLeadId": null,
  "existingLeadCode": null,
  "existingLeadStatus": null
}
```

**Response 200 — Trùng SĐT (isDuplicate=true):**

```json
{
  "leadId": "00000000-0000-0000-0000-000000000000",
  "leadCode": "",
  "isDuplicate": true,
  "existingLeadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "existingLeadCode": "LD-20260428-0001",
  "existingLeadStatus": "Assigned"
}
```

**FE flow khi nhận 200 + isDuplicate=true:**
1. Hiển thị popup xác nhận với thông tin lead cũ
2. User chọn "Xem lead cũ" → navigate đến `GET /api/leads/{existingLeadId}`
3. User chọn "Tạo lead mới" → gọi lại API với `forceCreate: true`

**Response 400 — Validation error:**

```json
{
  "errorCode": "VALIDATION_ERROR",
  "errorMessage": "...",
  "errors": {
    "customerPhone": ["Số điện thoại phải có 10 chữ số và bắt đầu bằng 0."]
  }
}
```

---

## TV-03 + TV-06 — Chi tiết lead (bao gồm kết quả phân loại tự động)

### `GET /api/leads/{id}`

Trả về đầy đủ thông tin lead. Panel "Kết quả phân loại" (TV-03) lấy từ các field: `needType`, `priorityScore`, `priorityLevel`, `assignedGroup`.

**Path params:** `id` — UUID của lead

**Response 200:**

```json
{
  "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leadCode": "LD-20260428-0001",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "customerAddress": "123 Lê Lợi, Q1, TP.HCM",
  "customerEmail": "nguyenvana@email.com",
  "channel": "Hotline",
  "needDescription": "Khách muốn tư vấn gói cước trả sau cho doanh nghiệp",
  "productInterest": ["Gói cước doanh nghiệp", "Sim data"],

  // Kết quả phân loại tự động (SYS-01 → SYS-03)
  // null nếu engine chưa chạy xong (status = "New")
  "needType": "SaleNew",
  "priorityScore": 55,
  "priorityLevel": "Medium",
  "assignedGroup": "Sale",
  "routingType": "Auto",

  // Gán nhân viên
  "assignedUserId": "abc...",
  "assignedUserName": "Trần Thị B",
  "assignedStoreId": null,
  "assignedAt": "2026-04-28T08:30:05Z",

  // SLA
  "slaDeadline": "2026-04-28T12:30:05Z",
  "slaViolated": false,

  "leadStatus": "Assigned",
  "createdBy": "...",
  "createdAt": "2026-04-28T08:30:00Z",
  "updatedAt": "2026-04-28T08:30:05Z",
  "closedAt": null
}
```

**Enum values:**

- `needType`: `SaleNew` | `SaleUpgrade` | `SaleRenew` | `CskhSupport` | `CskhComplaint` | `CskhWarranty` | `StoreVisit` | `Other`
- `priorityLevel`: `Low` | `Medium` | `High`
- `assignedGroup`: `Sale` | `Cskh` | `StoreSupport`
- `routingType`: `Auto` | `Manual`
- `leadStatus`: `New` | `Assigned` | `PendingDispatch` | `PendingAssignment` | `Contacted` | `InProgress` | `Won` | `Lost` | `Cancelled`

**FE — Panel "Kết quả phân loại" (TV-03):**

| Trường | Hiển thị khi |
|---|---|
| Loại nhu cầu | `needType != null` |
| Mức ưu tiên | `priorityLevel != null` (kèm badge màu: High=đỏ, Medium=cam, Low=xanh) |
| Nhóm xử lý | `assignedGroup != null` |
| Nhân viên được gán | `assignedUserName != null`, ngược lại hiển thị "Đang chờ điều phối" |
| Toàn bộ panel | Nếu `leadStatus = "New"` → hiển thị "Đang phân loại..." spinner |

**Response 404 — Không tìm thấy hoặc không có quyền:**

```json
{
  "errorCode": "NOT_FOUND",
  "errorMessage": "Lead không tồn tại hoặc bạn không có quyền xem."
}
```

---

## TV-05 + TV-07 — Danh sách lead + tìm kiếm

### `GET /api/leads`

**Query params:**

| Param | Type | Mô tả |
|---|---|---|
| `search` | string? | TV-07: SĐT (exact match) hoặc tên KH (contains, case-insensitive) |
| `status` | string? | Lọc theo trạng thái (giá trị enum LeadStatus) |
| `channel` | string? | Lọc theo kênh (giá trị enum Channel) |
| `dateFrom` | DateTime? | Lọc từ ngày tạo (ISO 8601) |
| `dateTo` | DateTime? | Lọc đến ngày tạo (ISO 8601) |
| `page` | int | Trang, mặc định `1` |
| `pageSize` | int | Số record/trang, mặc định `20` |

**Ví dụ:**
- `GET /api/leads` — toàn bộ lead của tôi, trang 1
- `GET /api/leads?search=0901234567` — tìm theo SĐT
- `GET /api/leads?search=Nguyen` — tìm theo tên
- `GET /api/leads?status=Assigned&channel=Hotline` — lọc kết hợp
- `GET /api/leads?dateFrom=2026-04-01&dateTo=2026-04-30&page=2&pageSize=20`

**Response 200:**

```json
{
  "items": [
    {
      "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "leadCode": "LD-20260428-0001",
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0901234567",
      "channel": "Hotline",
      "needType": "SaleNew",
      "leadStatus": "Assigned",
      "priorityLevel": "Medium",
      "createdAt": "2026-04-28T08:30:00Z"
    }
  ],
  "totalCount": 42,
  "page": 1,
  "pageSize": 20
}
```

**FE lưu ý:**
- `totalCount` dùng để tính số trang: `Math.ceil(totalCount / pageSize)`
- `needType` và `priorityLevel` có thể `null` nếu engine chưa phân loại xong
- Dữ liệu chỉ chứa lead do chính user đang đăng nhập tạo (data scope TV)

---

## TV-04 — Cập nhật thông tin lead

### `PUT /api/leads/{id}`

**Trường được phép sửa:** `customerAddress`, `customerEmail`, `productInterest`, `needDescription`

**Trường KHÔNG được phép sửa:** `customerPhone`, `channel`, kết quả phân loại (`needType`, `priorityLevel`, `assignedGroup`)

**Điều kiện:** Lead phải do chính user tạo, và chưa ở trạng thái kết thúc (`Won` / `Lost` / `Cancelled`).

**Request body:**

```json
{
  "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "customerAddress": "456 Nguyễn Huệ, Q1, TP.HCM",
  "customerEmail": "newemail@gmail.com",
  "productInterest": ["Gói cước doanh nghiệp"],
  "needDescription": "Khách muốn tư vấn thêm về gói cước trả sau cho 50 nhân viên"
}
```

Tất cả field đều optional — chỉ gửi field cần thay đổi. Field `leadId` **bắt buộc** trong body và phải khớp với `{id}` trên URL.

**Response 200:**

```json
{
  "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leadCode": "LD-20260428-0001",
  "updatedAt": "2026-04-28T09:15:00Z"
}
```

**Response 400 — Lead đã đóng:**

```json
{
  "errorCode": "LEAD_CLOSED",
  "errorMessage": "Không thể chỉnh sửa lead đã đóng (Won/Lost/Cancelled)."
}
```

**Response 400 — ID mismatch:**

```json
{
  "errorCode": "ID_MISMATCH",
  "errorMessage": "ID trong URL và body không khớp."
}
```

**Response 404 — Không tìm thấy hoặc không có quyền:**

```json
{
  "errorCode": "NOT_FOUND",
  "errorMessage": "Lead không tồn tại hoặc bạn không có quyền chỉnh sửa."
}
```

---

## Error Codes tổng hợp

| ErrorCode | HTTP Status | Ý nghĩa |
|---|---|---|
| `NOT_FOUND` | 404 | Lead không tồn tại hoặc không thuộc quyền của user hiện tại |
| `LEAD_CLOSED` | 400 | Lead ở trạng thái kết thúc, không thể sửa |
| `ID_MISMATCH` | 400 | `leadId` trong body khác với `{id}` trên URL |
| `INVALID_PHONE` | 400 | `phone` param trống khi gọi check-duplicate |
| `VALIDATION_ERROR` | 400 | Dữ liệu đầu vào không hợp lệ (validation pipeline) |

---

## Data Scope & Security

- **Tất cả endpoints trả về dữ liệu của user đang đăng nhập** — không thể xem/sửa lead của TV khác.
- Scope được enforce ở query handler thông qua filter `CreatedBy = currentUserId`, không phụ thuộc vào param từ FE.
- Nếu FE gửi UUID của lead thuộc người khác → trả về `404 NOT_FOUND` (không leak thông tin tồn tại hay không).

---

## Ghi chú triển khai

- Engine phân luồng (SYS-01 → SYS-03) chạy **inline** sau khi tạo lead — kết quả phân loại có thể đọc ngay sau khi `POST /api/leads` trả về 201.
- Nếu engine chưa xong (hiếm gặp): `GET /api/leads/{id}` trả về `leadStatus = "New"` và các field phân loại là `null`. FE nên poll lại sau 2-3 giây.
- `productInterest` được serialize dưới dạng JSON array trong DB. API nhận và trả về dạng `string[]`.
- Tất cả timestamp theo **UTC (ISO 8601)**. FE tự convert sang timezone local khi hiển thị.
