# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### EPIC-001 · approved · source: planning:EPIC-001

Users sign in by picking their identity from a list instead of using external login/passwords, then operate within the permissions of their assigned role (Employee, Manager, or HR/Admin).

Covers identity selection on sign-in, role-scoped visibility and actions, and session lifecycle (manual sign-out, inactivity timeout, forced end on deactivation). Assumption stated: no passwords in v1; access control relies on selected identity and role; app is intended for a trusted internal team of tens of users in a single region with GDPR-aligned handling.

**Related:** US-001, US-002, US-003

### EPIC-002 · approved · source: planning:EPIC-002

Employees submit leave requests with start date, end date, type (annual or sick), and a reason; request length is calculated in whole working days (Mon-Fri), and overlapping requests are flagged at submission.

Assumptions stated: no half-days and no public-holiday calendar in v1, so every weekday in the range counts as a full day. The system checks for overlap against the same employee's existing pending or approved requests and flags it so both employee and manager can see it before a decision.

**Related:** US-004, US-005, US-006

### EPIC-003 · approved · source: planning:EPIC-003

Employees see all of their leave requests with current status and manager comments, plus their remaining annual leave balance out of a 20-day yearly allowance.

Annual leave deducts from the 20-day balance; sick leave is tracked separately, is uncapped, and does not reduce the annual balance. Assumption stated: the 20-day balance resets each calendar year with no carryover of unused days.

**Related:** US-007, US-008

### EPIC-004 · approved · source: planning:EPIC-004

Managers review pending leave requests from their own direct reports only, and approve or reject each with a required comment.

A manager cannot see or act on requests from employees who are not their direct report. The system blocks approval of annual leave that would exceed the employee's remaining balance; sick leave approval is not balance-constrained since sick leave is uncapped and tracked separately.

**Related:** US-009, US-010, US-011

### EPIC-005 · approved · source: planning:EPIC-005

A shared team calendar shows who is on approved leave each day; pending requests are not shown, and sick-leave reasons are kept private.

Assumption stated: only approved leave appears on the shared calendar, not pending requests. To protect sensitive data, the calendar shows that a person is on leave without exposing the sick-leave reason text to other team members.

**Related:** US-012, US-013

### EPIC-006 · approved · source: planning:EPIC-006

HR/Admin manages the user list (add, edit, deactivate with role), assigns reporting lines between employees and managers, and can correct/adjust leave balances.

Deactivating a user removes them from the sign-in list and ends any existing session as that user. Reporting-line assignment determines which manager's approvals view a given employee's pending requests route to. All balance adjustments are recorded in the audit log with the HR/Admin identity, timestamp and note.

**Related:** US-014, US-015, US-016

### EPIC-007 · approved · source: planning:EPIC-007

All request submissions, approve/reject decisions (with comment), and HR balance adjustments are logged with a timestamp and the acting user; the log is viewable only by HR/Admin.

Employees and Managers are explicitly denied access to the audit log; only HR/Admin may open it. Each entry records the acting user, timestamp, action type and relevant detail including any comment.

**Related:** US-017, US-018

### EPIC-008 · approved · source: planning:EPIC-008

Notifications are in-app only: managers see an indicator that requests are awaiting their decision, and employees see an indicator when their request's status changes.

Assumption stated: there are no email or SMS notifications in v1, consistent with the pick-from-list identity model and absence of email addresses in the system.

**Related:** US-019

### EPIC-009 · approved · source: planning:EPIC-009

Sick-leave reasons are treated as sensitive personal data under GDPR; access to the reason text is restricted to the employee themselves, their manager, and HR/Admin.

Assumption stated: single-region, GDPR-aligned handling; reasons are stored as free text with restricted access. Colleagues outside that set (including other managers) cannot see the reason text even if they can see that the person is on leave.

**Related:** US-020

### EPIC-010 · approved · source: planning:EPIC-010

Concise getting-started documentation lets a small team begin using the app without external training, covering identity selection, submitting leave, approving as a manager, and HR administration.

Guidance must be role-appropriate and, per acceptance criteria, any credential-like example in the documentation must use a placeholder (e.g. <set-at-first-login>) rather than a real value.

**Related:** US-021

### SPRINT-1 · draft · source: planning:Sprint 1

Sprint 1 goal: stand up identity selection, role-based access and session lifecycle.

Capacity: 20 points. Plan version 1 status is 'generated' (not marked approved in the input).

**Related:** EPIC-001

### SPRINT-2 · draft · source: planning:Sprint 2

Sprint 2 goal: admin user management, reporting lines, and core leave request submission.

Capacity: 20 points. Plan version 1 status is 'generated' (not marked approved in the input).

**Related:** EPIC-006, EPIC-002

### SPRINT-3 · draft · source: planning:Sprint 3

Sprint 3 goal: employee dashboard, manager visibility of pending requests, sick-leave privacy, and docs.

Capacity: 20 points. Plan version 1 status is 'generated' (not marked approved in the input).

**Related:** EPIC-003, EPIC-004, EPIC-005, EPIC-009, EPIC-010

### SPRINT-4 · draft · source: planning:Sprint 4

Sprint 4 goal: manager approve/reject decisions, balance enforcement and HR balance corrections.

Capacity: 20 points. Plan version 1 status is 'generated' (not marked approved in the input).

**Related:** EPIC-004, EPIC-006

### SPRINT-5 · draft · source: planning:Sprint 5

Sprint 5 goal: audit trail, team calendar and in-app notifications.

Capacity: 20 points. Plan version 1 status is 'generated' (not marked approved in the input).

**Related:** EPIC-007, EPIC-005, EPIC-008

### SPRINT-6 · draft · source: planning:Sprint 6

Sprint 6 goal: HR audit log visibility.

Capacity: 20 points. Plan version 1 status is 'generated' (not marked approved in the input).

**Related:** EPIC-007
<!-- sdlc:auto:end narrative -->
