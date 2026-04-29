# Tài liệu tích hợp Frontend — Quản lý cửa hàng (QT-10)

> **Dành cho:** Frontend AI / Developer tích hợp giao diện QT (Admin)  
> **Base URL:** `/api`  
> **Auth:** `Authorization: Bearer <token>` — role `QT`  
> **Ngày cập nhật:** 2026-04-29

---

## Mục lục

- [Types TypeScript](#types-typescript)
- [API 1 — Tìm kiếm QL để gán làm quản lý](#api-1--tìm-kiếm-ql-để-gán-làm-quản-lý)
- [API 2 — Danh sách cửa hàng](#api-2--danh-sách-cửa-hàng)
- [API 3 — Chi tiết cửa hàng](#api-3--chi-tiết-cửa-hàng)
- [API 4 — Tạo cửa hàng mới](#api-4--tạo-cửa-hàng-mới)
- [API 5 — Cập nhật cửa hàng](#api-5--cập-nhật-cửa-hàng)
- [API 6 — Kích hoạt / vô hiệu hóa cửa hàng](#api-6--kích-hoạt--vô-hiệu-hóa-cửa-hàng)
- [Error codes tổng hợp](#error-codes-tổng-hợp)
- [Luồng UX khuyến nghị](#luồng-ux-khuyến-nghị)

---

## Types TypeScript

```typescript
interface StoreDto {
  id: string              // uuid
  storeCode: string       // ví dụ: "HN-001"
  storeName: string
  address: string | null
  region: string | null
  managerId: string | null       // uuid — QL hiện tại
  managerName: string | null     // tên đầy đủ QL (null nếu chưa có)
  managerUsername: string | null // username QL (null nếu chưa có)
  maxCapacity: number
  isActive: boolean
  createdAt: string // ISO 8601
}

interface StoreManagerDto {
  userId: string
  fullName: string
  username: string
  hasStore: boolean       // đang quản lý cửa hàng khác
  currentStore: string | null // tên cửa hàng hiện tại (nếu hasStore = true)
}

interface ApiError {
  errorCode: string
  errorMessage: string
}
```

---

## API 1 — Tìm kiếm QL để gán làm quản lý

### `GET /api/stores/managers/search?q={keyword}`

Dùng cho **dropdown/autocomplete** khi tạo hoặc sửa cửa hàng. Chỉ trả về user có role `QL` đang active.

**Query params:**
| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `q` | string | Không | Tìm theo tên đầy đủ hoặc username. Bỏ trống → trả về 30 QL đầu. |

**Response `200 OK`:**
```json
[
  {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "fullName": "Nguyễn Thị Lan",
    "username": "ntlan",
    "hasStore": false,
    "currentStore": null
  },
  {
    "userId": "9ba85f64-5717-4562-b3fc-2c963f66afa6",
    "fullName": "Trần Văn Minh",
    "username": "tvminh",
    "hasStore": true,
    "currentStore": "Chi nhánh Hà Nội 2"
  }
]
```

**Lưu ý UX:**
- `hasStore = false` → hiển thị bình thường, ưu tiên show
- `hasStore = true` → hiển thị icon cảnh báo + tên cửa hàng hiện tại, vẫn cho phép chọn — server sẽ tự xử lý chuyển store (clear `StoreId` cũ, set `StoreId` mới)
- Debounce input ≥ 300ms, tối đa 30 kết quả

---

## API 2 — Danh sách cửa hàng

### `GET /api/stores`

Lấy danh sách tất cả cửa hàng, hỗ trợ lọc. Tất cả params là tùy chọn, bỏ trống → trả về toàn bộ.

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `search` | string | Tìm theo **tên cửa hàng** hoặc **mã cửa hàng** (case-insensitive, contains) |
| `region` | string | Lọc theo khu vực (contains) |
| `isActive` | boolean | `true` / `false`. Bỏ trống → cả hai |

**Response `200 OK`:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "storeCode": "HN-001",
    "storeName": "Chi nhánh Hà Nội 1",
    "address": "123 Phố Huế, Hà Nội",
    "region": "Miền Bắc",
    "managerId": "abc85f64-5717-4562-b3fc-2c963f66afa6",
    "managerName": "Nguyễn Thị Lan",
    "managerUsername": "ntlan",
    "maxCapacity": 100,
    "isActive": true,
    "createdAt": "2026-01-15T08:00:00Z"
  }
]
```

**Lưu ý UX:**
- `managerName = null` → hiển thị badge "Chưa có quản lý" (màu vàng cảnh báo)
- `isActive = false` → grey out row, hiển thị tag "Vô hiệu"
- Kết quả đã sort theo `storeName` ASC từ server

---

## API 3 — Chi tiết cửa hàng

### `GET /api/stores/{id}`

**Path param:** `id` — uuid của cửa hàng

**Response `200 OK`:** Shape giống `StoreDto` ở trên.

**Error responses:**
| Status | errorCode | Xử lý UI |
|---|---|---|
| 404 | `NOT_FOUND` | Toast "Không tìm thấy cửa hàng" |

---

## API 4 — Tạo cửa hàng mới

### `POST /api/stores`

**Request Body:**
```json
{
  "storeCode": "HN-003",
  "storeName": "Chi nhánh Hà Nội 3",
  "maxCapacity": 80,
  "address": "45 Trần Hưng Đạo, Hà Nội",
  "region": "Miền Bắc",
  "managerUsername": "ntlan"
}
```

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `storeCode` | string | Có | Mã cửa hàng, phải unique |
| `storeName` | string | Có | Tên hiển thị |
| `maxCapacity` | number (int) | Có | Sức chứa tối đa (số lead) |
| `address` | string | Không | Địa chỉ |
| `region` | string | Không | Khu vực (ví dụ: "Miền Bắc") |
| `managerUsername` | string | **Không** | Username của QL được gán. Bỏ trống → tạo store không có quản lý |

**Response `201 Created`:** Trả về `StoreDto` đầy đủ (kể cả `managerName`, `managerUsername`).

**Sau khi gán manager:** Server tự động set `user.StoreId = store.Id` — QL đó trở thành quản lý đơn vị ngay lập tức.

**Error responses:**
| Status | errorCode | Ý nghĩa | Xử lý UI |
|---|---|---|---|
| 409 | `CODE_TAKEN` | Mã cửa hàng đã tồn tại | Hiển thị lỗi inline ở field `storeCode` |
| 400 | `MANAGER_NOT_FOUND` | Username không tồn tại | Hiển thị lỗi inline ở field manager |
| 400 | `INVALID_MANAGER_ROLE` | User không có role QL | "Chỉ có thể gán QL làm quản lý cửa hàng" |
| 400 | `MANAGER_INACTIVE` | QL đã bị khóa | "Tài khoản QL đã bị khóa, không thể gán" |

---

## API 5 — Cập nhật cửa hàng

### `PUT /api/stores/{id}`

**Path param:** `id` — uuid của cửa hàng

**Request Body:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "storeName": "Chi nhánh Hà Nội 1 (mới)",
  "maxCapacity": 120,
  "address": "456 Phố Huế, Hà Nội",
  "region": "Miền Bắc",
  "managerUsername": "tvminh"
}
```

> **Lưu ý quan trọng:** `id` trong body phải khớp với `id` trong path, nếu không server trả về 400 `ID_MISMATCH`.

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | uuid | Có | Phải bằng `{id}` trên path |
| `storeName` | string | Có | |
| `maxCapacity` | number (int) | Có | |
| `address` | string | Không | |
| `region` | string | Không | |
| `managerUsername` | string | Không | Gán QL mới. **Truyền `null` hoặc bỏ field → xóa quản lý hiện tại** |

**Response `204 No Content`** — thành công, không có body.

**Hành vi khi đổi manager:**
- QL cũ: `StoreId` tự động được clear về `null`
- QL mới: `StoreId` tự động được set = `store.Id`

**Error responses:**
| Status | errorCode | Ý nghĩa | Xử lý UI |
|---|---|---|---|
| 400 | `ID_MISMATCH` | `id` body ≠ `id` path | Lỗi FE, kiểm tra lại code |
| 404 | `NOT_FOUND` | Store không tồn tại | Toast "Không tìm thấy cửa hàng" |
| 400 | `MANAGER_NOT_FOUND` | Username không tồn tại | Lỗi inline ở field manager |
| 400 | `INVALID_MANAGER_ROLE` | User không có role QL | "Chỉ có thể gán QL làm quản lý" |
| 400 | `MANAGER_INACTIVE` | QL đã bị khóa | "Tài khoản QL đã bị khóa" |

---

## API 6 — Kích hoạt / vô hiệu hóa cửa hàng

### `PATCH /api/stores/{id}/status`

**Path param:** `id` — uuid của cửa hàng

**Request Body:**
```json
{
  "isActive": false
}
```

**Response `204 No Content`** — thành công.

**Error responses:**
| Status | errorCode | Xử lý UI |
|---|---|---|
| 404 | `NOT_FOUND` | Toast "Không tìm thấy cửa hàng" |

---

## Error codes tổng hợp

| errorCode | HTTP | Endpoint | Xử lý UI |
|---|---|---|---|
| `CODE_TAKEN` | 409 | POST | Lỗi inline field `storeCode`: "Mã cửa hàng đã tồn tại" |
| `NOT_FOUND` | 404 | GET/{id}, PUT, PATCH | Toast "Không tìm thấy cửa hàng" |
| `ID_MISMATCH` | 400 | PUT | Lỗi FE — kiểm tra lại logic submit |
| `MANAGER_NOT_FOUND` | 400 | POST, PUT | Lỗi inline field manager: "Không tìm thấy người dùng" |
| `INVALID_MANAGER_ROLE` | 400 | POST, PUT | Lỗi inline: "Chỉ QL mới có thể làm quản lý cửa hàng" |
| `MANAGER_INACTIVE` | 400 | POST, PUT | Lỗi inline: "Tài khoản bị khóa, không thể gán làm quản lý" |

---

## Luồng UX khuyến nghị

### Trang danh sách cửa hàng

```
[GET /api/stores]
    ↓ render table

Thanh filter:
    - Input "Tìm kiếm" → GET /api/stores?search=<tên hoặc mã>
    - Dropdown "Khu vực" → GET /api/stores?region=<khu vực>
    - Toggle "Trạng thái" (Tất cả / Active / Inactive) → isActive=true|false

Mỗi row hiển thị:
    - storeCode, storeName, region, address
    - managerName (hoặc badge vàng "Chưa có quản lý" nếu null)
    - maxCapacity
    - Chip trạng thái: Active (xanh) / Inactive (xám)
    - Actions: [Sửa] [Kích hoạt/Vô hiệu]
```

### Modal tạo / sửa cửa hàng

```
Form fields:
    - Mã cửa hàng (storeCode) — disabled khi edit
    - Tên cửa hàng (storeName)
    - Sức chứa (maxCapacity) — number input
    - Địa chỉ (address) — optional
    - Khu vực (region) — optional, có thể dùng Select với danh sách cố định

Field "Quản lý (QL)":
    - Autocomplete input, placeholder "Tìm theo tên hoặc username..."
    - Khi user gõ → debounce 300ms → GET /api/stores/managers/search?q=<text>
    - Dropdown kết quả hiển thị: FullName + username
      + Nếu hasStore = true: icon cảnh báo + "(đang quản lý: <currentStore>)"
    - Khi xóa giá trị → gửi managerUsername = null → server tự clear QL cũ

Submit:
    - Tạo mới: POST /api/stores → 201 → refetch list → đóng modal
    - Sửa:     PUT /api/stores/{id} → 204 → refetch list → đóng modal
    - Lỗi 4xx: hiển thị errorMessage inline dưới field tương ứng
```

### Xác nhận vô hiệu hóa cửa hàng

```
Click "Vô hiệu hóa" → confirm dialog
    → PATCH /api/stores/{id}/status { "isActive": false }
    → 204: cập nhật trạng thái row trong list (không cần refetch toàn bộ)
```
