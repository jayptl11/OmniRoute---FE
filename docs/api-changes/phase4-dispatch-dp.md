# PHASE 4 — Điều phối thủ công STORE_SUPPORT (DP-01 → DP-07)

> **Ngày:** 2026-04-28  
> **Phạm vi:** DP-01, DP-02, DP-03, DP-04, DP-05, DP-06, DP-07  
> **Role:** `DP` (policy `CanDispatchToStore`)  
> **Base URL:** `/api/dispatch`  
> **Auth:** Bearer JWT — tất cả endpoint đều yêu cầu role `DP`

---

## Tổng quan các endpoint

| Method | URL | DP task | Mô tả |
|--------|-----|---------|-------|
| `GET` | `/api/dispatch/queue` | DP-01 + DP-07 | Queue lead chờ điều phối + tìm kiếm/lọc |
| `GET` | `/api/dispatch/queue/{id}` | DP-02 | Chi tiết lead cần phân công |
| `GET` | `/api/dispatch/stores/capacity` | DP-03 | Tình trạng tải từng cửa hàng |
| `POST` | `/api/dispatch/queue/{id}/assign` | DP-04 + DP-05 | Gán lead về cửa hàng (kèm ghi chú) |
| `GET` | `/api/dispatch/history` | DP-06 | Lịch sử phân công đã thực hiện |

---

## 1. GET `/api/dispatch/queue` — Queue lead chờ điều phối (DP-01 + DP-07)

Trả về danh sách lead có `status = PendingDispatch`.  
Sắp xếp mặc định: **PriorityLevel giảm dần** (High → Medium → Low), sau đó **CreatedAt tăng dần** (chờ lâu nhất lên trên).

### Query parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| `search` | `string` | Không | Tìm theo SĐT (exact) hoặc tên (contains) |
| `priorityLevel` | `string` | Không | `Low` \| `Medium` \| `High` |
| `addressContains` | `string` | Không | Lọc theo khu vực địa chỉ khách (contains) |
| `waitedMoreThanMinutes` | `int` | Không | Chỉ lấy lead đã chờ > X phút |
| `page` | `int` | Không | Mặc định `1` |
| `pageSize` | `int` | Không | Mặc định `20` |

### Response 200

```json
{
  "items": [
    {
      "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "leadCode": "LEAD-20260428-0042",
      "customerName": "Nguyễn Thị Lan",
      "customerPhone": "0912345678",
      "customerAddress": "45 Nguyễn Trãi, Quận 5, TP.HCM",
      "needDescription": "Cần hỗ trợ trực tiếp tại cửa hàng để xem sản phẩm",
      "needType": "StoreVisit",
      "priorityLevel": "High",
      "waitedMinutes": 47,
      "createdAt": "2026-04-28T07:15:00Z"
    }
  ],
  "totalCount": 8,
  "page": 1,
  "pageSize": 20
}
```

### Ghi chú UI

- `waitedMinutes >= 60` → hiển thị badge đỏ "Chờ lâu"
- `priorityLevel = "High"` → highlight màu đỏ cam
- `priorityLevel = "Medium"` → highlight màu vàng

---

## 2. GET `/api/dispatch/queue/{id}` — Chi tiết lead cần phân công (DP-02)

Trả về đầy đủ thông tin lead + activity timeline.  
Chỉ trả về nếu lead đang ở `status = PendingDispatch`.

### Path parameter

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `id` | `guid` | Lead ID |

### Response 200

```json
{
  "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leadCode": "LEAD-20260428-0042",
  "customerName": "Nguyễn Thị Lan",
  "customerPhone": "0912345678",
  "customerAddress": "45 Nguyễn Trãi, Quận 5, TP.HCM",
  "customerEmail": "lan.nguyen@email.com",
  "channel": "Walkin",
  "needDescription": "Cần hỗ trợ trực tiếp tại cửa hàng để xem sản phẩm",
  "productInterest": ["iPhone 16 Pro", "AirPods Pro"],
  "needType": "StoreVisit",
  "priorityScore": 72,
  "priorityLevel": "High",
  "assignedGroup": "StoreSupport",
  "waitedMinutes": 47,
  "createdAt": "2026-04-28T07:15:00Z",
  "updatedAt": "2026-04-28T07:15:30Z",
  "activityLogs": [
    {
      "id": "guid",
      "action": "LEAD_CREATED",
      "note": null,
      "newValue": null,
      "performedAt": "2026-04-28T07:15:00Z",
      "performedByName": "Trần Văn Bình"
    },
    {
      "id": "guid",
      "action": "STATUS_CHANGED",
      "note": "Engine tự động chuyển sang chờ điều phối",
      "newValue": "PendingDispatch",
      "performedAt": "2026-04-28T07:15:30Z",
      "performedByName": null
    }
  ]
}
```

### Enum `action` trong activityLogs

| Giá trị | Ý nghĩa |
|---------|---------|
| `LEAD_CREATED` | Lead được tạo bởi TV |
| `STATUS_CHANGED` | Engine hoặc user chuyển trạng thái |
| `DISPATCHED_TO_STORE` | DP gán lead về cửa hàng |

### Response 404

```json
{
  "errorCode": "NOT_FOUND",
  "errorMessage": "Lead không tồn tại hoặc không ở trạng thái chờ điều phối."
}
```

---

## 3. GET `/api/dispatch/stores/capacity` — Tình trạng tải cửa hàng (DP-03)

Trả về danh sách tất cả cửa hàng kèm số lead đang active và số slot còn trống.  
Active leads = lead có status trong `[Assigned, Contacted, InProgress]` và `assignedStoreId` trỏ về cửa hàng đó.

### Response 200

```json
[
  {
    "id": "guid",
    "storeCode": "CH001",
    "storeName": "Cửa hàng Nguyễn Trãi",
    "address": "45 Nguyễn Trãi, Quận 5, TP.HCM",
    "region": "TP.HCM - Quận 5",
    "managerId": "guid",
    "maxCapacity": 20,
    "activeLeads": 18,
    "availableSlots": 2,
    "isOverCapacity": false,
    "isNearCapacity": true,
    "isActive": true
  },
  {
    "id": "guid",
    "storeCode": "CH002",
    "storeName": "Cửa hàng Lê Lợi",
    "address": "10 Lê Lợi, Quận 1, TP.HCM",
    "region": "TP.HCM - Quận 1",
    "managerId": "guid",
    "maxCapacity": 15,
    "activeLeads": 16,
    "availableSlots": 0,
    "isOverCapacity": true,
    "isNearCapacity": false,
    "isActive": true
  }
]
```

### Ghi chú UI cho DP-03

| Condition | Hiển thị gợi ý |
|-----------|---------------|
| `isOverCapacity = true` | Badge đỏ "Đầy tải" — vẫn có thể gán nhưng hiện cảnh báo (BR-07) |
| `isNearCapacity = true` | Badge cam "Gần đầy" (< 20% slot còn trống) |
| `availableSlots > 0 && !isNearCapacity` | Badge xanh "Còn chỗ" |
| `isActive = false` | Ẩn khỏi danh sách chọn trong DP-04 |

> **BR-07:** Nếu cửa hàng đầy tải (`isOverCapacity = true`), hệ thống **không chặn** gán — chỉ hiển thị cảnh báo. FE nên show confirm dialog: _"Cửa hàng đang đầy tải. Bạn vẫn muốn gán?"_

---

## 4. POST `/api/dispatch/queue/{id}/assign` — Gán lead về cửa hàng (DP-04 + DP-05)

Gán lead đang ở `PendingDispatch` về một cửa hàng cụ thể.  
Ghi chú lý do chọn cửa hàng (`note`) là tùy chọn — tích hợp trực tiếp vào request này (DP-05).  
Hệ thống tự tính `slaDeadline` theo config `StoreSupport × priority của lead`.  
Store manager (QL) nhận notification `STORE_LEAD_ASSIGNED` sau khi gán thành công.

### Path parameter

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `id` | `guid` | Lead ID cần gán |

### Request body

```json
{
  "storeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "note": "Cửa hàng gần nhất với địa chỉ khách, còn 2 slot trống"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `storeId` | `guid` | **Có** | ID cửa hàng được chọn |
| `note` | `string` | Không | Lý do chọn cửa hàng (max 500 ký tự) |

### Response 200

```json
{
  "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leadCode": "LEAD-20260428-0042",
  "assignedStoreId": "guid",
  "storeName": "Cửa hàng Nguyễn Trãi",
  "assignedAt": "2026-04-28T08:02:15Z",
  "slaDeadline": "2026-04-28T12:02:15Z"
}
```

### Response 404

```json
{
  "errorCode": "NOT_FOUND",
  "errorMessage": "Lead không tồn tại hoặc không ở trạng thái chờ điều phối."
}
```

```json
{
  "errorCode": "STORE_NOT_FOUND",
  "errorMessage": "Cửa hàng không tồn tại hoặc đang không hoạt động."
}
```

### Response 400

```json
{
  "errorCode": "VALIDATION_ERROR",
  "errorMessage": "StoreId là bắt buộc."
}
```

### Trạng thái sau khi gán thành công

- Lead chuyển từ `PendingDispatch` → `Assigned`
- `assignedStoreId` được set
- `assignedAt` = thời điểm gán
- `slaDeadline` được tính tự động
- ActivityLog được tạo với `action = "DISPATCHED_TO_STORE"`, `newValue = tên cửa hàng`, `note = lý do`
- Store manager nhận push notification

---

## 5. GET `/api/dispatch/history` — Lịch sử phân công (DP-06)

Trả về danh sách lead đã được DP hiện tại phân công, sắp xếp giảm dần theo thời gian phân công.

### Response 200

```json
[
  {
    "leadId": "guid",
    "leadCode": "LEAD-20260428-0042",
    "customerName": "Nguyễn Thị Lan",
    "customerPhone": "0912345678",
    "storeId": "guid",
    "storeName": "Cửa hàng Nguyễn Trãi",
    "dispatchNote": "Cửa hàng gần nhất với địa chỉ khách, còn 2 slot trống",
    "dispatchedAt": "2026-04-28T08:02:15Z",
    "leadStatus": "Assigned"
  }
]
```

### Enum `leadStatus` sau khi đã dispatch

| Giá trị | Ý nghĩa |
|---------|---------|
| `Assigned` | Đã gán cho cửa hàng, đang chờ xử lý |
| `Contacted` | Cửa hàng đã liên hệ khách |
| `InProgress` | Đang xử lý tại cửa hàng |
| `Won` | Chốt thành công |
| `Lost` | Không chốt được |
| `Cancelled` | Đã hủy |

---

## Luồng nghiệp vụ tổng thể (DP flow)

```
[Hệ thống routing engine]
        │ Lead có AssignedGroup = StoreSupport
        │ → Lead.Status = PendingDispatch
        │ → Notification gửi đến tất cả DP users
        ▼
[DP mở GET /api/dispatch/queue]
        │ Xem danh sách lead chờ điều phối
        │ (lọc theo priority, khu vực, thời gian chờ)
        ▼
[DP mở GET /api/dispatch/stores/capacity]
        │ Xem cửa hàng nào còn chỗ, ở khu vực phù hợp
        ▼
[DP mở GET /api/dispatch/queue/{id}]
        │ Xem chi tiết nhu cầu, địa chỉ, note từ TV
        ▼
[DP gọi POST /api/dispatch/queue/{id}/assign]
        │ Chọn storeId phù hợp + ghi note lý do
        ▼
[Response 200 — Gán thành công]
        │ Lead.Status = Assigned
        │ ActivityLog: DISPATCHED_TO_STORE
        │ Notification → Store Manager (QL)
        ▼
[Lead xuất hiện trong GET /api/dispatch/history]
```

---

## Enum tham chiếu

### `priorityLevel`

| Giá trị | Điểm ưu tiên |
|---------|--------------|
| `High` | score ≥ 70 |
| `Medium` | 40 ≤ score < 70 |
| `Low` | score < 40 |

### `channel`

| Giá trị | Kênh |
|---------|------|
| `Walkin` | Khách đến trực tiếp |
| `Hotline` | Gọi điện |
| `Chat` | Chat online |
| `Referral` | Giới thiệu |
| `Webform` | Web form |
| `Email` | Email |
| `Zalo` | Zalo OA |
