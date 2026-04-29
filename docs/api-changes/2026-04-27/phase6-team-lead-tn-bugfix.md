# Phase 6 Bug Fix — TN `NO_TEAM` 400 After Team Assignment

**Date:** 2026-04-29

---

## Root Cause

`TeamId` được nhúng vào **JWT tại thời điểm login** (`TokenService.GenerateAccessToken`).  
`CurrentUserService.TeamId` đọc từ JWT claim `"teamId"` — **không truy vấn DB**.

Khi QT tạo team qua `POST /api/teams` (QT-10) với `leaderId = <TN UserId>`:
- `Teams.LeaderId` được set ✅  
- `Users.TeamId` của TN **không được set** ❌  
→ TN login → JWT không có `teamId` claim → mọi Phase 6 handler trả `NO_TEAM` 400.

---

## Fix Applied

### `CreateTeamCommandHandler`
Sau khi tạo team, nếu `LeaderId` được cung cấp → gọi `leader.AssignToTeam(team.Id)` để set `Users.TeamId`.

### `UpdateTeamCommandHandler`
Khi `LeaderId` thay đổi:
- TN cũ (nếu team hiện tại đúng là team này): `oldLeader.AssignToTeam(null)` — xóa liên kết
- TN mới: `newLeader.AssignToTeam(team.Id)` — gán TeamId mới

---

## Flow Sau Fix

```
QT tạo/cập nhật team (POST/PUT /api/teams)
    → Teams.LeaderId = <TN UserId>
    → Users.TeamId   = <team.Id>      ← mới, tự động

TN re-login
    → JWT có claim "teamId"
    → CurrentUserService.TeamId trả về đúng giá trị
    → Phase 6 handlers hoạt động ✅
```

> **Lưu ý:** TN **phải re-login** sau khi QT assign để JWT mới có claim `teamId`.  
> JWT cũ (issued trước khi assign) vẫn sẽ gặp `NO_TEAM`.

---

## Ai map TN → Team?

- **QT (Admin)** thực hiện thủ công qua QT-10: `POST /api/teams` (tạo mới) hoặc `PUT /api/teams/{id}` (cập nhật), set field `leaderId`.
- Không có auto-mapping — TN không tự assign vào team.
- Sau khi QT set → system tự đồng bộ `Users.TeamId` (fix trên) → TN re-login là dùng được.
