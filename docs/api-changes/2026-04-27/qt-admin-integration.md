# Admin (QT) API — Frontend Integration Guide

**Base URL:** `/api`  
**Date:** 2026-04-27  
**Version:** 1.0  
**Authorization:** All endpoints require a valid JWT with role `QT`.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Common Patterns](#2-common-patterns)
3. [Enum Reference](#3-enum-reference)
4. [Error Code Reference](#4-error-code-reference)
5. [Endpoints](#5-endpoints)
   - [QT-01/02/03/04/05 — Users](#51-users--apiusers)
   - [QT-06/07/08 — Routing Rules](#52-routing-rules--apirouting-rules)
   - [QT-09 — Master Data](#53-master-data--apimaster-data)
   - [QT-10 — Stores](#54-stores--apistores)
   - [QT-10 — Teams](#55-teams--apiteams)
   - [QT-11 — SLA Config](#56-sla-config--apisla-config)
6. [Feature Coverage](#6-feature-coverage)

---

## 1. Overview

Tất cả endpoint trong guide này yêu cầu header:
```
Authorization: Bearer <accessToken>
```
Với `accessToken` của tài khoản có role `QT` (Quản trị hệ thống).

---

## 2. Common Patterns

### Success — Danh sách
```json
[{ ... }, { ... }]
```

### Success — Phân trang
```json
{
  "items": [{ ... }],
  "totalCount": 50,
  "page": 1,
  "pageSize": 20
}
```

### Success — Tạo mới (201)
Trả về object mới tạo hoặc `Guid` của entity mới.

### Success — Cập nhật / Toggle (204)
Body rỗng.

### Error
```json
{
  "errorCode": "NOT_FOUND",
  "errorMessage": "..."
}
```

### Validation Error (400 — FluentValidation)
```json
{
  "errors": {
    "FieldName": ["ERROR_CODE"]
  }
}
```

---

## 3. Enum Reference

### `AssignedGroup`
| Value (số) | String | Mô tả |
|---|---|---|
| `0` | `"Sale"` | Nhóm kinh doanh |
| `1` | `"Cskh"` | Nhóm chăm sóc khách hàng |
| `2` | `"StoreSupport"` | Nhóm hỗ trợ cửa hàng |

> Khi gửi lên API, truyền **số nguyên** (`0`, `1`, `2`).  
> Khi nhận về, server trả về **string** (`"Sale"`, `"Cskh"`, `"StoreSupport"`).

### `Channel`
| Value (số) | String |
|---|---|
| `0` | `"Hotline"` |
| `1` | `"Walkin"` |
| `2` | `"Webform"` |
| `3` | `"Chat"` |
| `4` | `"Email"` |
| `5` | `"Zalo"` |
| `6` | `"Referral"` |

### `NeedType`
| Value (số) | String | Mô tả |
|---|---|---|
| `0` | `"SaleNew"` | Mua hàng / tư vấn sản phẩm mới |
| `1` | `"SaleUpgrade"` | Nâng cấp / mở rộng |
| `2` | `"SaleRenew"` | Gia hạn dịch vụ |
| `3` | `"CskhSupport"` | Hỗ trợ kỹ thuật |
| `4` | `"CskhComplaint"` | Khiếu nại |
| `5` | `"CskhWarranty"` | Bảo hành / đổi trả |
| `6` | `"StoreVisit"` | Cần hỗ trợ tại cửa hàng |
| `7` | `"Other"` | Khác |

### `MasterDataCategory`
| Value (số) | String | Dùng cho |
|---|---|---|
| `0` | `"Product"` | Danh mục sản phẩm / dịch vụ |
| `1` | `"LostReason"` | Lý do LOST |
| `2` | `"CancelReason"` | Lý do CANCELLED |

### `PriorityLevel` (chỉ dùng khi đọc SLA)
`"Low"` | `"Medium"` | `"High"`

---

## 4. Error Code Reference

| Error Code | HTTP | Endpoint | Mô tả |
|---|---|---|---|
| `EMAIL_TAKEN` | 409 | POST /users | Email đã tồn tại |
| `USERNAME_TAKEN` | 409 | POST /users | Username đã tồn tại |
| `USER_NOT_FOUND` | 404 | PUT/PATCH/POST /users/{id}/* | User không tồn tại |
| `ID_MISMATCH` | 400 | PUT /users/{id} | Route id và body UserId không khớp |
| `WEAK_PASSWORD` | 400 | POST /users/{id}/set-temporary-password | Mật khẩu không đủ mạnh |
| `DUPLICATE_PRIORITY_ORDER` | 400 | POST/PUT /routing-rules | PriorityOrder đã được rule khác dùng |
| `NOT_FOUND` | 404 | PUT/PATCH /routing-rules/{id} | Rule không tồn tại |
| `NOT_FOUND` | 404 | PUT/PATCH /sla-config/{id} | SLA config không tồn tại |
| `INVALID_WARNING_HOURS` | 400 | PUT /sla-config/{id} | WarningBeforeHours >= MaxHours |
| `NOT_FOUND` | 404 | PUT/PATCH /stores/{id} | Store không tồn tại |
| `STORE_CODE_TAKEN` | 409 | POST /stores | Mã cửa hàng đã tồn tại |
| `NOT_FOUND` | 404 | PUT/PATCH /teams/{id} | Team không tồn tại |
| `CODE_TAKEN` | 409 | POST /master-data | Code đã tồn tại trong category |
| `NOT_FOUND` | 404 | PUT/PATCH /master-data/{id} | Item không tồn tại |
| `IN_USE` | 400 | PATCH /master-data/{id}/status | Không thể ẩn item đang được sử dụng |

---

## 5. Endpoints

---

### 5.1 Users — `/api/users`

#### QT-01 — Danh sách tài khoản

```http
GET /api/users
```

**Query Parameters**

| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `roleName` | string | Không | Lọc theo tên role (TV, SA, CS, DP, TN, QL, QT, BQL) |
| `storeId` | guid | Không | Lọc theo cửa hàng |
| `isActive` | bool | Không | Lọc theo trạng thái hoạt động |
| `page` | int | Không | Trang hiện tại (mặc định: 1) |
| `pageSize` | int | Không | Số bản ghi mỗi trang (mặc định: 20) |

**Response `200 OK`**
```json
{
  "items": [
    {
      "userId": "3fa85f64-...",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roleName": "SA",
      "roleId": "b1c2d3e4-...",
      "storeId": "a1b2c3d4-...",
      "isActive": true,
      "lastLogin": "2026-04-24T10:30:00Z",
      "createdAt": "2026-04-01T08:00:00Z"
    }
  ],
  "totalCount": 50,
  "page": 1,
  "pageSize": 20
}
```

---

#### QT-02 — Tạo tài khoản người dùng mới

```http
POST /api/users
Content-Type: application/json
```

**Request Body**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roleId": "b1c2d3e4-...",
  "storeId": "a1b2c3d4-...",
  "phone": "0912345678"
}
```

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| `username` | ✅ | Unique, 3–50 ký tự |
| `email` | ✅ | Unique, định dạng email hợp lệ |
| `firstName` | ✅ | |
| `lastName` | ✅ | |
| `roleId` | ✅ | Guid của role. Xem danh sách role qua `/api/master-data/enums/Role` hoặc hardcode theo hệ thống |
| `storeId` | Không | Gán vào cửa hàng ngay lúc tạo |
| `phone` | Không | |

**Response `201 Created`**
```json
{
  "userId": "3fa85f64-...",
  "username": "johndoe",
  "email": "john@example.com",
  "tempPassword": "Temp@1234"
}
```

> `tempPassword` là mật khẩu tạm thời hệ thống tự sinh — hiển thị cho QT một lần rồi thông báo cho user. User sẽ bị bắt đổi mật khẩu khi đăng nhập lần đầu.

**Responses**

| Status | ErrorCode | Khi nào |
|---|---|---|
| `201` | — | Tạo thành công |
| `400` | Validation errors | Thiếu/sai field |
| `409` | `EMAIL_TAKEN` | Email đã tồn tại |
| `409` | `USERNAME_TAKEN` | Username đã tồn tại |

---

#### QT-03 — Chỉnh sửa thông tin tài khoản

```http
PUT /api/users/{id}
Content-Type: application/json
```

**Request Body**
```json
{
  "userId": "3fa85f64-...",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "roleId": "b1c2d3e4-...",
  "storeId": "a1b2c3d4-..."
}
```

> `userId` trong body **phải khớp** với `{id}` trên route, nếu không sẽ nhận `ID_MISMATCH`.

**Không thể chỉnh:** `username`, `createdAt`.

**Response `204 NoContent`**

**Responses**

| Status | ErrorCode | Khi nào |
|---|---|---|
| `204` | — | Cập nhật thành công |
| `400` | `ID_MISMATCH` | Route id ≠ body userId |
| `400` | Validation | Sai field |
| `404` | `USER_NOT_FOUND` | User không tồn tại |

---

#### QT-04 — Khóa / Mở khóa tài khoản

```http
PATCH /api/users/{id}/status
Content-Type: application/json
```

**Request Body**
```json
{ "isActive": false }
```

**Response `200 OK`**
```json
{
  "userId": "3fa85f64-...",
  "isActive": false,
  "activeLeadCount": 3
}
```

> `activeLeadCount` > 0 → hiển thị cảnh báo: *"Tài khoản này đang có {n} lead chưa xử lý. Vui lòng reassign trước khi khóa."*  
> API không chặn — FE quyết định có cho phép thực hiện hay không.

**Responses**

| Status | ErrorCode | Khi nào |
|---|---|---|
| `200` | — | Toggle thành công |
| `404` | `USER_NOT_FOUND` | User không tồn tại |

---

#### QT-05 — Reset mật khẩu

**Option A: Gửi link reset qua email**

```http
POST /api/users/{id}/send-reset-link
```

Body rỗng. Hệ thống tự gửi email tới địa chỉ của user.

**Response `204 NoContent`**

---

**Option B: Đặt mật khẩu tạm thời trực tiếp**

```http
POST /api/users/{id}/set-temporary-password
Content-Type: application/json
```

**Request Body**
```json
{ "temporaryPassword": "Temp@1234" }
```

> Mật khẩu tạm thời phải đủ mạnh: ≥ 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số.  
> User sẽ bị bắt đổi mật khẩu ngay lần đăng nhập tiếp theo.

**Response `204 NoContent`**

**Responses (cả 2 option)**

| Status | ErrorCode | Khi nào |
|---|---|---|
| `204` | — | Thành công |
| `400` | `WEAK_PASSWORD` | Mật khẩu không đủ mạnh (chỉ Option B) |
| `404` | `USER_NOT_FOUND` | User không tồn tại |

---

### 5.2 Routing Rules — `/api/routing-rules`

#### QT-07 — Danh sách rule

```http
GET /api/routing-rules
```

**Response `200 OK`**
```json
[
  {
    "id": "3fa85f64-...",
    "ruleName": "Khiếu nại → CSKH",
    "description": "Chuyển khiếu nại về nhóm CSKH",
    "priorityOrder": 1,
    "conditionChannels": ["Hotline", "Chat"],
    "conditionKeywords": ["khiếu nại", "phàn nàn"],
    "actionGroup": "Cskh",
    "actionTeamId": null,
    "actionTeamName": null,
    "isActive": true,
    "createdAt": "2026-04-01T08:00:00Z",
    "updatedAt": "2026-04-27T10:00:00Z"
  }
]
```

> - `conditionChannels: null` → áp dụng cho **tất cả** kênh.  
> - `conditionKeywords: null` → không lọc theo từ khóa.  
> - `actionTeamId: null` → round-robin tự động trong nhóm.  
> Danh sách bao gồm cả rule đang tắt (`isActive: false`).

---

#### QT-06 — Tạo rule mới

```http
POST /api/routing-rules
Content-Type: application/json
```

**Request Body**
```json
{
  "ruleName": "Khiếu nại → CSKH",
  "description": "Chuyển khiếu nại về nhóm CSKH",
  "priorityOrder": 1,
  "conditionChannels": ["Hotline", "Chat"],
  "conditionKeywords": ["khiếu nại", "phàn nàn"],
  "actionGroup": 1,
  "actionTeamId": null
}
```

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| `ruleName` | ✅ | Tối đa 200 ký tự |
| `priorityOrder` | ✅ | > 0, **phải unique** trong toàn bộ hệ thống |
| `actionGroup` | ✅ | `0=Sale`, `1=Cskh`, `2=StoreSupport` |
| `description` | Không | |
| `conditionChannels` | Không | Mảng string theo enum `Channel`. `null` = tất cả kênh |
| `conditionKeywords` | Không | Mảng từ khóa. `null` = không lọc từ khóa |
| `actionTeamId` | Không | Guid của team. `null` = round-robin |

**Response `201 Created`**
```
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
```
(Guid của rule mới)

**Responses**

| Status | ErrorCode | Khi nào |
|---|---|---|
| `201` | — | Tạo thành công |
| `400` | `DUPLICATE_PRIORITY_ORDER` | `priorityOrder` đã tồn tại |
| `400` | Validation | Thiếu/sai field |

---

#### QT-06 — Cập nhật rule

```http
PUT /api/routing-rules/{id}
Content-Type: application/json
```

**Request Body** (giống Create, không có `id`)
```json
{
  "ruleName": "Khiếu nại → CSKH (updated)",
  "description": null,
  "priorityOrder": 1,
  "conditionChannels": null,
  "conditionKeywords": ["khiếu nại"],
  "actionGroup": 1,
  "actionTeamId": "a1b2c3d4-..."
}
```

**Response `204 NoContent`**

**Responses**

| Status | ErrorCode | Khi nào |
|---|---|---|
| `204` | — | Cập nhật thành công |
| `400` | `DUPLICATE_PRIORITY_ORDER` | `priorityOrder` đã dùng bởi rule khác |
| `400` | Validation | Thiếu/sai field |
| `404` | `NOT_FOUND` | Rule không tồn tại |

---

#### QT-08 — Bật / Tắt rule

```http
PATCH /api/routing-rules/{id}/status
Content-Type: application/json
```

**Request Body**
```json
{ "isActive": false }
```

**Response `204 NoContent`**

> ⚠️ Tắt một rule có thể thay đổi luồng phân loại lead. Hiển thị cảnh báo xác nhận trước khi gọi API.

---

#### QT-06 — Test rule

Kiểm tra rule nào sẽ được áp dụng với một đầu vào mẫu — **không tạo lead thật**.

```http
POST /api/routing-rules/test
Content-Type: application/json
```

**Request Body**
```json
{
  "needDescription": "Tôi muốn khiếu nại về sản phẩm",
  "channel": "Hotline"
}
```

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| `needDescription` | Không | Nội dung mô tả nhu cầu thử nghiệm |
| `channel` | Không | String theo enum `Channel` |

**Response `200 OK` — Có match**
```json
{
  "matched": true,
  "matchedRuleId": "3fa85f64-...",
  "matchedRuleName": "Khiếu nại → CSKH",
  "matchedPriorityOrder": 1,
  "resultGroup": "Cskh"
}
```

**Response `200 OK` — Không có match**
```json
{
  "matched": false,
  "matchedRuleId": null,
  "matchedRuleName": null,
  "matchedPriorityOrder": null,
  "resultGroup": "Sale"
}
```

> `resultGroup: "Sale"` khi không match = DEFAULT_GROUP của hệ thống.

---

### 5.3 Master Data — `/api/master-data`

Quản lý các danh mục động: sản phẩm, lý do LOST, lý do CANCELLED.

#### QT-09 — Danh sách mục danh mục

```http
GET /api/master-data?category={MasterDataCategory}&isActive={bool}
```

**Query Parameters**

| Param | Type | Bắt buộc | Ghi chú |
|---|---|---|---|
| `category` | int/string | Không | `0=Product`, `1=LostReason`, `2=CancelReason` |
| `isActive` | bool | Không | Lọc theo trạng thái hiển thị |

**Response `200 OK`**
```json
[
  {
    "id": "3fa85f64-...",
    "category": "LostReason",
    "code": "NO_NEED",
    "displayName": "Không có nhu cầu",
    "description": null,
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2026-04-01T08:00:00Z"
  }
]
```

---

#### QT-09 — Danh sách giá trị enum hệ thống

Trả về danh sách các enum value để FE render dropdown (read-only, không CRUD).

```http
GET /api/master-data/enums/{enumType}
```

| `enumType` | Trả về |
|---|---|
| `Channel` | Danh sách kênh tiếp nhận |
| `NeedType` | Danh sách loại nhu cầu |
| `LeadStatus` | Danh sách trạng thái lead |

**Response `200 OK`**
```json
[
  { "value": "Hotline", "displayName": "Hotline" },
  { "value": "Walkin", "displayName": "Walkin" }
]
```

---

#### QT-09 — Tạo mục danh mục mới

```http
POST /api/master-data
Content-Type: application/json
```

**Request Body**
```json
{
  "category": 1,
  "code": "NO_BUDGET",
  "displayName": "Không có ngân sách",
  "description": null,
  "sortOrder": 8
}
```

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| `category` | ✅ | `0=Product`, `1=LostReason`, `2=CancelReason` |
| `code` | ✅ | Mã định danh, unique trong cùng category |
| `displayName` | ✅ | Tên hiển thị |
| `sortOrder` | ✅ | Số thứ tự sắp xếp |
| `description` | Không | |

**Response `201 Created`**
```json
{
  "id": "3fa85f64-...",
  "category": "LostReason",
  "code": "NO_BUDGET",
  "displayName": "Không có ngân sách",
  "description": null,
  "sortOrder": 8,
  "isActive": true,
  "createdAt": "2026-04-27T10:00:00Z"
}
```

**Responses**

| Status | ErrorCode | Khi nào |
|---|---|---|
| `201` | — | Tạo thành công |
| `409` | `CODE_TAKEN` | Code đã tồn tại trong category |
| `400` | Validation | Thiếu/sai field |

---

#### QT-09 — Cập nhật mục danh mục

```http
PUT /api/master-data/{id}
Content-Type: application/json
```

**Request Body**
```json
{
  "displayName": "Không có ngân sách phù hợp",
  "description": "Giá quá cao so với budget",
  "sortOrder": 8
}
```

> Không thể thay đổi `code` và `category` sau khi tạo.

**Response `204 NoContent`**

---

#### QT-09 — Ẩn / Hiện mục danh mục

```http
PATCH /api/master-data/{id}/status
Content-Type: application/json
```

**Request Body**
```json
{ "isActive": false }
```

**Response `204 NoContent`**

> ⚠️ Nếu item đang được sử dụng (có lead/ticket reference), hệ thống trả `400 IN_USE`. Không thể xóa cứng theo spec — chỉ ẩn.

---

### 5.4 Stores — `/api/stores`

#### QT-10 — Danh sách cửa hàng

```http
GET /api/stores?region={string}&isActive={bool}
```

**Response `200 OK`**
```json
[
  {
    "id": "3fa85f64-...",
    "storeCode": "HN-01",
    "storeName": "Cửa hàng Hà Nội - Hoàn Kiếm",
    "address": "123 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội",
    "region": "Hà Nội",
    "managerId": "a1b2c3d4-...",
    "maxCapacity": 50,
    "isActive": true,
    "createdAt": "2026-04-01T08:00:00Z"
  }
]
```

---

#### QT-10 — Chi tiết cửa hàng

```http
GET /api/stores/{id}
```

**Response `200 OK`** — Cùng shape với item trong danh sách.

---

#### QT-10 — Tạo cửa hàng

```http
POST /api/stores
Content-Type: application/json
```

**Request Body**
```json
{
  "storeCode": "HN-02",
  "storeName": "Cửa hàng Hà Nội - Đống Đa",
  "maxCapacity": 30,
  "address": "456 Tây Sơn, Đống Đa, Hà Nội",
  "region": "Hà Nội",
  "managerId": "a1b2c3d4-..."
}
```

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| `storeCode` | ✅ | Unique |
| `storeName` | ✅ | |
| `maxCapacity` | ✅ | > 0 |
| `address` | Không | |
| `region` | Không | |
| `managerId` | Không | Guid của User có role QL |

**Response `201 Created`** — Trả về `StoreDto` của cửa hàng vừa tạo.

**Responses**

| Status | ErrorCode | Khi nào |
|---|---|---|
| `201` | — | Tạo thành công |
| `409` | `STORE_CODE_TAKEN` | Mã cửa hàng đã tồn tại |
| `400` | Validation | Thiếu/sai field |

---

#### QT-10 — Cập nhật cửa hàng

```http
PUT /api/stores/{id}
Content-Type: application/json
```

**Request Body**
```json
{
  "id": "3fa85f64-...",
  "storeName": "Cửa hàng Hà Nội - Đống Đa (updated)",
  "maxCapacity": 40,
  "address": "456 Tây Sơn, Đống Đa, Hà Nội",
  "region": "Hà Nội",
  "managerId": null
}
```

> `storeCode` không thể thay đổi sau khi tạo.

**Response `204 NoContent`**

---

#### QT-10 — Kích hoạt / Vô hiệu hóa cửa hàng

```http
PATCH /api/stores/{id}/status
Content-Type: application/json
```

**Request Body**
```json
{ "isActive": false }
```

**Response `204 NoContent`**

---

### 5.5 Teams — `/api/teams`

#### QT-10 — Danh sách nhóm

```http
GET /api/teams?teamType={AssignedGroup}&storeId={guid}&isActive={bool}
```

**Response `200 OK`**
```json
[
  {
    "id": "3fa85f64-...",
    "teamName": "Team Sale HN-01",
    "teamType": "Sale",
    "leaderId": "a1b2c3d4-...",
    "storeId": "b2c3d4e5-...",
    "isActive": true,
    "createdAt": "2026-04-01T08:00:00Z"
  }
]
```

---

#### QT-10 — Chi tiết nhóm

```http
GET /api/teams/{id}
```

**Response `200 OK`** — Cùng shape với item trong danh sách.

---

#### QT-10 — Tạo nhóm

```http
POST /api/teams
Content-Type: application/json
```

**Request Body**
```json
{
  "teamName": "Team Sale HN-02",
  "teamType": 0,
  "leaderId": "a1b2c3d4-...",
  "storeId": "b2c3d4e5-..."
}
```

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| `teamName` | ✅ | |
| `teamType` | ✅ | `0=Sale`, `1=Cskh` (không có StoreSupport) |
| `leaderId` | Không | Guid của User có role TN |
| `storeId` | Không | `null` = team trung tâm (centralized) |

**Response `201 Created`** — Trả về `Guid` của team mới.

---

#### QT-10 — Cập nhật nhóm

```http
PUT /api/teams/{id}
Content-Type: application/json
```

**Request Body**
```json
{
  "id": "3fa85f64-...",
  "teamName": "Team Sale HN-02 (updated)",
  "leaderId": "a1b2c3d4-...",
  "storeId": "b2c3d4e5-..."
}
```

> `teamType` không thể thay đổi sau khi tạo.

**Response `204 NoContent`**

---

#### QT-10 — Kích hoạt / Vô hiệu hóa nhóm

```http
PATCH /api/teams/{id}/status
Content-Type: application/json
```

**Request Body**
```json
{ "isActive": true }
```

**Response `204 NoContent`**

---

### 5.6 SLA Config — `/api/sla-config`

SLA Config được **pre-seed sẵn 9 bản ghi** (Sale × High/Medium/Low, CSKH × 3, StoreSupport × 3). QT chỉ **cập nhật** hoặc **bật/tắt** — không tạo mới hay xóa.

#### QT-11 — Danh sách cấu hình SLA

```http
GET /api/sla-config
```

**Response `200 OK`**
```json
[
  {
    "id": "3fa85f64-...",
    "assignedGroup": "Sale",
    "priorityLevel": "High",
    "maxHours": 2,
    "warningBeforeHours": 1,
    "isActive": true
  },
  {
    "id": "4gb96g75-...",
    "assignedGroup": "Sale",
    "priorityLevel": "Medium",
    "maxHours": 4,
    "warningBeforeHours": 1,
    "isActive": true
  }
]
```

**Giá trị mặc định:**

| Group | High | Medium | Low |
|---|---|---|---|
| Sale | 2h (warn 1h) | 4h (warn 1h) | 8h (warn 2h) |
| Cskh | 1h (warn 1h) | 4h (warn 1h) | 24h (warn 4h) |
| StoreSupport | 4h (warn 1h) | 8h (warn 2h) | 24h (warn 4h) |

---

#### QT-11 — Cập nhật cấu hình SLA

```http
PUT /api/sla-config/{id}
Content-Type: application/json
```

**Request Body**
```json
{
  "maxHours": 3,
  "warningBeforeHours": 1
}
```

> Quy tắc: `warningBeforeHours < maxHours`. Nếu không, nhận `400 INVALID_WARNING_HOURS`.

**Response `204 NoContent`**

---

#### QT-11 — Bật / Tắt cấu hình SLA

```http
PATCH /api/sla-config/{id}/status
Content-Type: application/json
```

**Request Body**
```json
{ "isActive": false }
```

**Response `204 NoContent`**

---

## 6. Feature Coverage

### Đã triển khai (Phase 0)

| Feature | Spec | Endpoint |
|---|---|---|
| QT-01 | Xem danh sách tài khoản | `GET /api/users` |
| QT-02 | Tạo tài khoản | `POST /api/users` |
| QT-03 | Chỉnh sửa tài khoản | `PUT /api/users/{id}` |
| QT-04 | Khóa / Mở khóa | `PATCH /api/users/{id}/status` |
| QT-05 | Reset mật khẩu (2 option) | `POST /api/users/{id}/send-reset-link` + `set-temporary-password` |
| QT-06 | Cấu hình rule phân luồng | `POST/PUT /api/routing-rules`, `POST /api/routing-rules/test` |
| QT-07 | Xem danh sách rule | `GET /api/routing-rules` |
| QT-08 | Bật / Tắt rule | `PATCH /api/routing-rules/{id}/status` |
| QT-09 | Quản lý danh mục hệ thống | `CRUD /api/master-data` |
| QT-10 | Quản lý cửa hàng & nhóm | `CRUD /api/stores`, `CRUD /api/teams` |
| QT-11 | Cấu hình SLA | `GET/PUT/PATCH /api/sla-config` |

### Chưa triển khai

| Feature | Spec | Ghi chú |
|---|---|---|
| QT-12 | Cấu hình thông báo / alert | Mapping role → notification_type — **chưa có endpoint** |
| QT-13 | Xem log hệ thống & audit trail | Đọc `ActivityLogs` với filter/export — **chưa có endpoint** |
| QT-14 | Thống kê hoạt động hệ thống | Dashboard số lead, tỷ lệ match rule, lỗi engine — **chưa có endpoint** |
