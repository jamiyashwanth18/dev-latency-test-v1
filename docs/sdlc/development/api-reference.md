# API Reference

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start endpoints -->
| Method | Path | Handler | Source | Summary |
|---|---|---|---|---|
| GET | /admin/audit-log | list_audit_log | `backend/app/routers/admin.py:72` | — |
| GET | /admin/users | list_users | `backend/app/routers/admin.py:93` | — |
| POST | /admin/users | create_user | `backend/app/routers/admin.py:102` | — |
| PATCH | /admin/users/{id} | update_user | `backend/app/routers/admin.py:126` | — |
| PUT | /admin/users/{id}/balance | adjust_balance | `backend/app/routers/admin.py:180` | — |
| GET | /balances/mine | get_my_balance | `backend/app/routers/balances.py:86` | — |
| GET | /health | health | `backend/app/main.py:75` | Liveness probe, and the only route here that is not a stub. |
| POST | /leave-requests | create_leave_request | `backend/app/routers/leave_requests.py:107` | — |
| GET | /leave-requests/mine | list_mine | `backend/app/routers/leave_requests.py:167` | — |
| GET | /leave-requests/pending | list_pending | `backend/app/routers/leave_requests.py:181` | — |
| POST | /leave-requests/{id}/decision | decide_leave_request | `backend/app/routers/leave_requests.py:201` | — |
| GET | /me | get_me | `backend/app/routers/sessions.py:70` | — |
| POST | /sessions | create_session | `backend/app/routers/sessions.py:30` | — |
| DELETE | /sessions/current | delete_current_session | `backend/app/routers/sessions.py:81` | — |
| GET | /users/active | list_active_users | `backend/app/routers/sessions.py:21` | Everyone active, for the identity picker. No auth: this is how one signs in. |
<!-- sdlc:auto:end endpoints -->

<!-- sdlc:auto:start drift -->
**Designed but missing:**

- GET /calendar
- GET /docs/getting-started
- GET /notifications
- POST /notifications/{id}/read
<!-- sdlc:auto:end drift -->

<!-- sdlc:auto:start source -->
Generated from commit `8bd31fa`
<!-- sdlc:auto:end source -->
