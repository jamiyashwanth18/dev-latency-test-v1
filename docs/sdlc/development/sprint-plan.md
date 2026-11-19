# Sprint Plan

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start sprints -->
## Sprint 1: Sprint 1

Stand up identity selection, role-based access and session lifecycle

Capacity: 20 points · Committed: 18

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-001 | Story | Select my identity from the user list | 8 | backend-agent | — |
| ↳ US-001-T1 | Task | Create users and sessions schema with seeded active-user list | — | backend-agent | — |
| ↳ US-001-T2 | Task | Implement identity selection and session endpoints | — | backend-agent | — |
| ↳ US-001-T3 | Task | Build identity selection screen | — | frontend-agent | — |
| US-002 | Story | Act within my role's permissions | 5 | backend-agent | US-001 |
| US-003 | Story | End my session | 5 | backend-agent | US-001 |

## Sprint 2: Sprint 2

Admin user management, reporting lines, and core leave request submission

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-004 | Story | Submit a leave request | 8 | backend-agent | US-001, US-002 |
| ↳ US-004-T1 | Task | Add leave_requests schema and field validation | — | backend-agent | — |
| ↳ US-004-T2 | Task | Implement POST /leave-requests endpoint | — | backend-agent | — |
| ↳ US-004-T3 | Task | Build leave request submission form | — | frontend-agent | — |
| US-005 | Story | See the whole-working-day length of my request | 3 | backend-agent | US-004 |
| US-014 | Story | Manage the user list | 5 | backend-agent | US-001, US-002 |
| US-015 | Story | Assign reporting lines | 3 | backend-agent | US-014 |

## Sprint 3: Sprint 3

Employee dashboard, manager visibility of pending requests, sick-leave privacy, and docs

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-006 | Story | Be warned about overlapping requests | 3 | backend-agent | US-004 |
| US-007 | Story | View my leave requests and their status | 3 | frontend-agent | US-004 |
| US-008 | Story | See my remaining annual leave balance | 3 | frontend-agent | US-004 |
| US-009 | Story | Review pending requests from my direct reports | 5 | backend-agent | US-004, US-015 |
| US-020 | Story | Restrict access to sick-leave reasons | 3 | security-agent | US-004, US-002 |
| US-021 | Story | Access getting-started guidance | 2 | frontend-agent | — |

## Sprint 4: Sprint 4

Manager approve/reject decisions, balance enforcement and HR balance corrections

Capacity: 20 points · Committed: 16

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-010 | Story | Approve or reject a request with a comment | 8 | backend-agent | US-009 |
| ↳ US-010-T1 | Task | Implement decision endpoint | — | backend-agent | — |
| ↳ US-010-T2 | Task | Wire annual balance deduction on approval | — | backend-agent | — |
| ↳ US-010-T3 | Task | Build manager decision UI | — | frontend-agent | — |
| US-011 | Story | Be prevented from over-approving annual leave | 3 | backend-agent | US-010, US-008 |
| US-016 | Story | Adjust leave balances | 5 | backend-agent | US-014, US-008 |

## Sprint 5: Sprint 5

Audit trail, team calendar and in-app notifications

Capacity: 20 points · Committed: 20

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-012 | Story | View who is on leave by day | 5 | frontend-agent | US-010 |
| US-013 | Story | Keep sick-leave reasons off the shared calendar | 2 | frontend-agent | US-012 |
| US-017 | Story | Record key actions in an audit log | 8 | backend-agent | US-004, US-010, US-016 |
| ↳ US-017-T1 | Task | Add append-only audit_log schema | — | backend-agent | — |
| ↳ US-017-T2 | Task | Write audit entries on submission and decision | — | backend-agent | — |
| ↳ US-017-T3 | Task | Write audit entries on balance adjustment | — | backend-agent | — |
| US-019 | Story | See in-app notice of items needing my attention | 5 | backend-agent | US-004, US-010 |

## Sprint 6: Sprint 6

HR audit log visibility

Capacity: 20 points · Committed: 3

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-018 | Story | View the audit log | 3 | frontend-agent | US-017, US-002 |

## Sprint 7: Fixes

Fix the findings SonarQube reported.

Capacity: 0 points · Committed: 0

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| FIX-SEC-docker-s8544-82cfea7f | Story | Fix: Using dependencies without locking resolved versions is security-sensitive. (backend/Dockerfile) | — | — | — |
| FIX-DAST-zap-10038-a3ec3827 | Story | Fix: Content Security Policy (CSP) Header Not Set | — | backend-agent | — |
| FIX-DAST-zap-10020-c96362a3 | Story | Fix: Missing Anti-clickjacking Header | — | backend-agent | — |
| FIX-DEP-osv-tinypool-b877dfe3 | Story | Fix: tinypool 1.1.1 has a known vulnerability (CVSS 9.5) (frontend/package-lock.json) | — | frontend-agent | — |
| FIX-DEP-osv-vitest-5e660a9e | Story | Fix: vitest 3.0.5 has a known vulnerability (CVSS 9.8) (frontend/package-lock.json) | — | frontend-agent | — |
| FIX-DEP-osv-playwright-283d859b | Story | Fix: playwright 1.49.1 has a known vulnerability (CVSS 8.7) (frontend/package-lock.json) | — | frontend-agent | — |
| FIX-DEP-osv-vite-047954c6 | Story | Fix: vite 6.0.11 has a known vulnerability (CVSS 8.2) (frontend/package-lock.json) | — | frontend-agent | — |

## Unscheduled

_Nothing unscheduled._
<!-- sdlc:auto:end sprints -->
