# API Reference

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start endpoints -->
| Method | Path | Handler | Source | Summary |
|---|---|---|---|---|
| GET | /health | health | `backend/app/main.py:71` | Liveness probe, and the only route here that is not a stub. |
<!-- sdlc:auto:end endpoints -->

<!-- sdlc:auto:start drift -->
**Designed but missing:**

- DELETE /sessions/current
- GET /admin/audit-log
- GET /admin/users
- GET /balances/mine
- GET /calendar
- GET /docs/getting-started
- GET /leave-requests/mine
- GET /leave-requests/pending
- GET /me
- GET /notifications
- GET /users/active
- PATCH /admin/users/{id}
- POST /admin/users
- POST /leave-requests
- POST /leave-requests/{id}/decision
- POST /notifications/{id}/read
- POST /sessions
- PUT /admin/users/{id}/balance
<!-- sdlc:auto:end drift -->

<!-- sdlc:auto:start source -->
Generated from commit `6d52753`
<!-- sdlc:auto:end source -->
