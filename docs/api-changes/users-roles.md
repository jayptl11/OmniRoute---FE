# API Tích Hợp Frontend - Lấy Danh Sách Roles

## Endpoint
`GET /api/users/roles`

## Authorization
`Authorization: Bearer &lt;token&gt;` (CanAdminSystem policy)

## Parameters
None

## Response Success (200 OK)
```json
[
  {
    "roleId": "guid",
    "roleName": "string"
  }
]
```

## Example
```bash
curl -X GET http://localhost:5000/api/users/roles \
  -H "Authorization: Bearer &lt;token&gt;"
```

**Sử dụng:** Load dropdown roles khi tạo user.
