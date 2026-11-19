# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### EPIC-001 · approved · source: planning:EPIC-001

Pick-your-identity sign-in and role-based access with no external login or passwords.

A user signs in by choosing their identity from a list of users and acts in their assigned role (Employee, Manager, or HR/Admin), which determines what they can see and do. Assumption carried: because identity is selected rather than authenticated, there are no passwords in v1; access control relies on the selected identity and role, for a trusted internal team of tens of users in a single region with GDPR-aligned handling.

**Related:** US-001, US-002, US-003

### EPIC-002 · approved · source: planning:EPIC-002

Employees submit leave requests with whole-working-day length calculation and overlap flagging.

Employees submit leave requests with start date, end date, type (annual or sick) and a reason; length is calculated in whole working days (Mon-Fri), excluding weekends. Assumptions carried: no half-days and no public-holiday calendar in v1, so every weekday counts as one day. The system flags overlapping requests for the same employee at submission time.

**Related:** US-004, US-005, US-006

### EPIC-003 · approved · source: planning:EPIC-003

Employee dashboard showing own requests/status and remaining annual balance out of 20 days.

Each employee has a dashboard to view their own leave requests with current status and remaining annual leave balance (out of 20 days per year). Annual leave deducts from the 20-day balance; sick leave is tracked separately, is uncapped, and does not reduce the annual balance. Assumption carried: the 20-day balance resets each calendar year with no carryover.

**Related:** US-007, US-008

### EPIC-004 · approved · source: planning:EPIC-004

Managers review and decide on direct reports' pending requests, with balance-exceeding approvals blocked.

Managers see pending leave requests from their direct reports and approve or reject each with a comment. A manager can only act on their own direct reports. The system prevents approving annual leave that would exceed the employee's remaining balance.

**Related:** US-009, US-010, US-011

### EPIC-005 · approved · source: planning:EPIC-005

Shared team calendar shows who is on approved leave each day without exposing sick-leave reasons.

A team calendar shows who is on leave each day. Assumption carried: only approved leave is shown on the shared calendar to all users; pending requests are not shown. To protect sensitive data, the shared calendar shows that a person is on leave without exposing sick-leave reasons.

**Related:** US-012, US-013

### EPIC-006 · approved · source: planning:EPIC-006

HR/Admin manages the user list, reporting lines, and leave-balance corrections.

A dedicated HR/Admin manages the user list, assigns reporting lines (who reports to which manager), and can correct or adjust leave balances (e.g., for mid-year joiners). All balance adjustments are recorded in the audit log.

**Related:** US-014, US-015, US-016

### EPIC-007 · approved · source: planning:EPIC-007

Append-only audit trail of submissions, decisions, and balance adjustments, viewable only by HR/Admin.

All request submissions, approve/reject decisions (with comment), and HR balance adjustments are logged with a timestamp and the acting user. The audit log is viewable by HR/Admin only.

**Related:** US-017, US-018

### EPIC-008 · approved · source: planning:EPIC-008

In-app-only notifications for managers (pending items) and employees (decision status changes).

Consistent with pick-from-list identity and no email addresses, notifications are in-app only. Assumption carried: no email or SMS notifications in v1; managers see pending requests awaiting them and employees see status changes within the app.

**Related:** US-019

### EPIC-009 · approved · source: planning:EPIC-009

Sick-leave reasons are treated as sensitive personal data with restricted visibility.

Sick-leave reasons may contain health-related personal data and are treated as sensitive personal data under GDPR. Access to a sick-leave reason is limited to the employee, their manager, and HR/Admin. Assumption carried: single-region, GDPR-aligned handling; reasons are stored as free text with restricted access.

**Related:** US-020

### EPIC-010 · approved · source: planning:EPIC-010

In-app getting-started documentation for all roles, with placeholder credentials only.

Provide concise getting-started documentation so a small team can begin using the app, covering how to pick an identity, submit leave, approve as a manager, and administer users and balances as HR/Admin.

**Related:** US-021
<!-- sdlc:auto:end narrative -->
