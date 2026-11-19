# API Reference

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start endpoints -->
| Method | Path | Handler | Source | Summary |
|---|---|---|---|---|
| GET | /admin/users | list_users | `backend/app/routers/admin.py:45` | — |
| POST | /admin/users | create_user | `backend/app/routers/admin.py:54` | — |
| PATCH | /admin/users/{id} | update_user | `backend/app/routers/admin.py:78` | — |
| GET | /health | health | `backend/app/main.py:74` | Liveness probe, and the only route here that is not a stub. |
| POST | /leave-requests | create_leave_request | `backend/app/routers/leave_requests.py:53` | — |
| GET | /leave-requests/mine | list_mine | `backend/app/routers/leave_requests.py:113` | — |
| GET | /leave-requests/pending | list_pending | `backend/app/routers/leave_requests.py:126` | — |
| GET | /me | get_me | `backend/app/routers/sessions.py:70` | — |
| POST | /sessions | create_session | `backend/app/routers/sessions.py:30` | — |
| DELETE | /sessions/current | delete_current_session | `backend/app/routers/sessions.py:81` | — |
| GET | /users/active | list_active_users | `backend/app/routers/sessions.py:21` | Everyone active, for the identity picker. No auth: this is how one signs in. |
<!-- sdlc:auto:end endpoints -->

<!-- sdlc:auto:start drift -->
**Designed but missing:**

- GET /admin/audit-log
- GET /balances/mine
- GET /calendar
- GET /docs/getting-started
- GET /notifications
- POST /leave-requests/{id}/decision
- POST /notifications/{id}/read
- PUT /admin/users/{id}/balance
<!-- sdlc:auto:end drift -->

<!-- sdlc:auto:start source -->
Generated from commit `bc954cb`
<!-- sdlc:auto:end source -->
