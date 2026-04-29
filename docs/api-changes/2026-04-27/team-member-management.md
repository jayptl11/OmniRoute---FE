# Cập nhật API — Quản lý thành viên đội (TN-11 bổ sung)

> **Ngày:** 2026-04-29
> **Liên quan:** TN-10, TN-11, TN-12
> **Base URL:** `/api/my-team`

---

## Thay đổi so với tài liệu Phase 6 ban đầu

### 1. Thêm endpoint tìm kiếm user (mới)

FE không cần tự nhập UUID khi thêm thành viên. Dùng endpoint sau để populate dropdown/search:

```
GET /api/my-team/members/search?q=nguyen
```

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `q` | `string?` | Tìm theo tên (họ tên) hoặc username. Để trống → trả về 30 user đầu. |

**Response 200** — `List<AddableUserDto>`

```json
[
  {
    "userId": "uuid",
    "fullName": "Nguyễn Văn A",
    "username": "sale01",
    "roleName": "SA",
    "hasTeam": false
  },
  {
    "userId": "uuid",
    "fullName": "Nguyễn Thị B",
    "username": "sale02",
    "roleName": "SA",
    "hasTeam": true
  }
]
```

| Field | Mô tả |
|-------|-------|
| `hasTeam` | `false` = chưa có đội, ưu tiên hiển thị trước. `true` = đang ở đội khác — nếu chọn sẽ nhận lỗi `IN_OTHER_TEAM`. |

**Lưu ý:**
- Kết quả đã lọc sẵn **đúng role** theo loại đội của TN đang đăng nhập:
  - Đội Sale (`Sale`) → chỉ trả về user role `SA`
  - Đội CSKH (`Cskh`) → chỉ trả về user role `CS`
  - Đội điều phối (`StoreSupport`) → chỉ trả về user role `DP`
- Tối đa **30 kết quả**. Nếu cần nhiều hơn, hãy nhập thêm từ khóa.
- Loại trừ TN đang đăng nhập khỏi kết quả.

**Errors**

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |

---

### 2. Cập nhật validation `POST /api/my-team/members` (TN-11)

Nay server kiểm tra role của user phải khớp với loại đội. Thêm error mới:

| Code | HTTP | Mô tả |
|------|------|-------|
| `INVALID_ROLE` | 400 | User không có role phù hợp với loại đội (ví dụ: cố thêm CS vào đội Sale) |

Danh sách đầy đủ error của TN-11:

| Code | HTTP | Mô tả |
|------|------|-------|
| `NO_TEAM` | 400 | TN chưa được gán vào đội |
| `USER_NOT_FOUND` | 404 | User không tồn tại |
| `USER_INACTIVE` | 400 | User đã bị khóa |
| `INVALID_ROLE` | 400 | Role không phù hợp loại đội |
| `ALREADY_IN_TEAM` | 400 | User đã là thành viên đội này |
| `IN_OTHER_TEAM` | 400 | User đang thuộc đội khác |

---

## Luồng UX gợi ý cho dialog "Thêm thành viên"

```
1. Mở dialog
2. Gọi GET /api/my-team/members/search (không có q) → hiển thị danh sách sẵn
3. User gõ tên → debounce 300ms → gọi lại với ?q=...
4. User chọn một người từ dropdown
   - hasTeam=false → hiển thị bình thường
   - hasTeam=true  → hiển thị cảnh báo "Đang ở đội khác, thêm sẽ thất bại"
5. Xác nhận → POST /api/my-team/members { "userId": "..." }
6. 204 → refresh danh sách TN-10
   400 IN_OTHER_TEAM → toast "Người dùng đang thuộc đội khác"
   400 INVALID_ROLE  → toast "Role không phù hợp với đội này" (không xảy ra nếu dùng search endpoint)
```
