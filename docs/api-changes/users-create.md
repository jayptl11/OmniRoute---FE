# API Tích Hợp Frontend - Tạo Tài Khoản Người Dùng (QT-02)

## Endpoint
`POST /api/users`

## Authorization
`Authorization: Bearer &lt;token&gt;` (CanAdminSystem policy)

## Request Body
```json
{
  "username": "string (required, max 50 chars)",
  "email": "string (required, valid email)",
  "firstName": "string (optional, max 100 chars)",
  "lastName": "string (optional, max 100 chars)",
  "roleId": "guid (required)",
  "storeId": "guid (optional)",
  "phone": "string (optional)",
  "password": "string (required, 8-100 chars)"
}
```

**Thay đổi mới:**
- Thêm `password` - admin nhập trực tiếp, không generate temp password
- Không gửi email welcome nữa

## Response Success (201 Created)
```json
{
  "userId": "guid",
  "username": "string",
  "email": "string"
}
```
**Lưu ý:** Không return password trong response (security)

## Error Responses
- 400 Bad Request: Validation error, EMAIL_TAKEN, USERNAME_TAKEN, ROLE_NOT_FOUND
- 409 Conflict: Email/Username đã tồn tại

## Example
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer &lt;token&gt;" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "roleId": "00000000-0000-0000-0000-000000000001",
    "password": "SecurePass123"
  }'
