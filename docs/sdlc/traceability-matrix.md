# Traceability Matrix

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start legend -->
Built from recorded links, not written by a model: requirement key → plan item (`source_stable_key`) → development ticket (`stable_key`) → the ticket's test steps → the last live deployment that started after the work finished. **AC tests** counts the story's acceptance criteria that have a test case, and those whose test cases all passed in the latest finished E2E run.
<!-- sdlc:auto:end legend -->

<!-- sdlc:auto:start matrix -->
| Requirement | Epic | Title | Plan items | Sprint | Design | Code | Commits | Ticket | Tests | AC tests | Deployed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| US-001 | EPIC-001 | Select my identity from the user list | US-001, US-001-T1, US-001-T2, US-001-T3 | 1 | GET /me, GET /users/active, POST /sessions, api_backend, database, sessions, users, web_spa | backend/app/config.py, backend/app/dependencies.py, backend/app/main.py, backend/app/routers/sessions.py, backend/app/schemas.py +9 more | a223610 | delivered | succeeded | 2/2 tested · 2/2 passing | — |
| US-002 | EPIC-001 | Act within my role's permissions | US-002 | 1 | GET /me, api_backend, users, web_spa | — | — | skipped | not run | 0/3 tested · 0/3 passing | — |
| US-003 | EPIC-001 | End my session | US-003 | 1 | DELETE /sessions/current, api_backend, sessions, web_spa | — | — | skipped | not run | 0/3 tested · 0/3 passing | — |
| US-004 | EPIC-002 | Submit a leave request | US-004, US-004-T1, US-004-T2, US-004-T3 | 2 | POST /leave-requests, api_backend, database, leave_requests, web_spa | backend/app/leave_calc.py, backend/app/main.py, backend/app/routers/leave_requests.py, backend/app/schemas.py, backend/tests/unit/test_leave_calc.py +4 more | e5088ce | delivered | succeeded | 2/2 tested · 2/2 passing | — |
| US-005 | EPIC-002 | See the whole-working-day length of my request | US-005 | 2 | POST /leave-requests, api_backend, leave_requests | — | e5088ce | delivered | not run | 2/2 tested · 2/2 passing | — |
| US-006 | EPIC-002 | Be warned about overlapping requests | US-006 | 3 | POST /leave-requests, api_backend, leave_requests | — | — | not started | not run | 0/1 tested · 0/1 passing | — |
| US-007 | EPIC-003 | View my leave requests and their status | US-007 | 3 | GET /leave-requests/mine, api_backend, leave_requests, web_spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-008 | EPIC-003 | See my remaining annual leave balance | US-008 | 3 | GET /balances/mine, api_backend, leave_balances, web_spa | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-009 | EPIC-004 | Review pending requests from my direct reports | US-009 | 3 | GET /leave-requests/pending, api_backend, leave_requests, users, web_spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-010 | EPIC-004 | Approve or reject a request with a comment | US-010, US-010-T1, US-010-T2, US-010-T3 | 4 | POST /leave-requests/{id}/decision, api_backend, audit_log, database, leave_balances, leave_requests, web_spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-011 | EPIC-004 | Be prevented from over-approving annual leave | US-011 | 4 | POST /leave-requests/{id}/decision, api_backend, leave_balances, leave_requests | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-012 | EPIC-005 | View who is on leave by day | US-012 | 5 | GET /calendar, api_backend, leave_requests, web_spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-013 | EPIC-005 | Keep sick-leave reasons off the shared calendar | US-013 | 5 | GET /calendar, api_backend, leave_requests, web_spa | — | — | not started | not run | 0/1 tested · 0/1 passing | — |
| US-014 | EPIC-006 | Manage the user list | US-014 | 2 | GET /admin/users, PATCH /admin/users/{id}, POST /admin/users, api_backend, database, users, web_spa | backend/app/main.py, backend/app/routers/admin.py, backend/app/schemas.py, backend/tests/unit/test_admin_users.py, frontend/e2e/admin-user-management.spec.ts +3 more | a223610 | delivered | succeeded | 2/2 tested · 2/2 passing | — |
| US-015 | EPIC-006 | Assign reporting lines | US-015 | 2 | PATCH /admin/users/{id}, api_backend, users, web_spa | — | a223610 | delivered | not run | 1/1 tested · 1/1 passing | — |
| US-016 | EPIC-006 | Adjust leave balances | US-016 | 4 | PUT /admin/users/{id}/balance, api_backend, audit_log, database, leave_balances | — | — | not started | not run | 0/1 tested · 0/1 passing | — |
| US-017 | EPIC-007 | Record key actions in an audit log | US-017, US-017-T1, US-017-T2, US-017-T3 | 5 | POST /leave-requests, POST /leave-requests/{id}/decision, PUT /admin/users/{id}/balance, api_backend, audit_log, database | — | — | not started | not run | 0/1 tested · 0/1 passing | — |
| US-018 | EPIC-007 | View the audit log | US-018 | 6 | GET /admin/audit-log, api_backend, audit_log, web_spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-019 | EPIC-008 | See in-app notice of items needing my attention | US-019 | 5 | GET /notifications, POST /notifications/{id}/read, api_backend, database, notifications, web_spa | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-020 | EPIC-009 | Restrict access to sick-leave reasons | US-020 | 3 | GET /leave-requests/mine, GET /leave-requests/pending, api_backend, leave_requests | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-021 | EPIC-010 | Access getting-started guidance | US-021 | 3 | GET /docs/getting-started, api_backend, web_spa | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
<!-- sdlc:auto:end matrix -->
