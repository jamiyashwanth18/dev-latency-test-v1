# Product Requirements

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
## Summary

### REQ-TECH-STACK · approved · source: requirements:technology-stack

Technology stack approved by the product owner for this lightweight-scope internal leave app; design must use exactly these choices.

Backend: FastAPI 0.115 - implements core rules (annual-balance deduction, uncapped/separate sick leave, whole-working-day counting excluding weekends, blocked over-approvals, manager-own-reports restriction, audit logging); clean fit for a small well-defined endpoint set, platform default. Cloud: AWS - single-region (EU) hosting with GDPR-aligned handling of personal and health data; encryption and access controls for sensitive sick-leave notes; platform default; scale far exceeds the tens-of-users need, so a small footprint is run. Database: PostgreSQL 16 - relational model for users, reporting lines, leave requests, per-year balances and an append-only audit trail; enforces relational correctness of balance adjustments; row-level controls help restrict sick-leave reason visibility to employee/manager/HR. Frontend: React 19 - responsive web app (leave request form, manager approval queue, team calendar grid, HR admin area) from one codebase covering desktop and mobile browsers, no native app; platform default.

### REQ-SCOPE · approved · source: requirements:scope

Defines delivery scope (lightweight, requirements v1) and what is explicitly in and out of scope for version 1.

In scope: pick-your-identity sign-in from a user list; submit a leave request (start/end date, annual or sick, reason); view own leave requests and status; view remaining annual balance out of 20 days; whole-working-day leave-length calculation (Mon-Fri, no half-days); my-leave employee dashboard; getting-started documentation; no public-holiday calendar in v1; 20-day annual balance resets each calendar year with no carryover. Out of scope - do not design or build: native mobile app.

### REQ-FEAT-SIGNIN · approved · source: requirements:Sign-in & roles

Feature group covering identity selection, role-scoped permissions, and session lifecycle.

Pick identity from user list: on opening the app, a user not yet acting as anyone sees a list of active users and selects their own identity to start a session; deactivated users do not appear. Act within role permissions: the app shows only the actions/data the acting role allows - Employees submit/view their own leave and the team calendar; Managers additionally act on direct reports' pending requests; HR/Admin additionally manage users, reporting lines, balances and the audit log. End my session: a session ends on sign-out, on inactivity beyond the configured session lifetime, or when HR/Admin deactivates the account being acted as; in each case the user returns to the identity selection screen and cannot continue acting.

### REQ-FEAT-REQUESTING · approved · source: requirements:Requesting leave

Feature group covering submission of leave requests, working-day length calculation, and overlap warnings.

Submit a leave request: employee submits start date, end date (not before start), type (annual or sick), and a reason; a valid request is created with status Pending and appears in the employee's list; if a required field is empty the request is not created and the missing field is shown. Whole-working-day length: length is calculated in whole working days, counting only Monday-to-Friday days within the range, excluding weekends; no half-days and no public-holiday calendar, so every weekday counts as one full day. Warn about overlapping requests: when a new request overlaps dates of the employee's existing pending or approved request, the system flags the overlap so the employee and manager can see it before a decision is made.

### REQ-FEAT-DASHBOARD · approved · source: requirements:My leave dashboard

Feature group covering the employee's view of their own requests and their annual balance.

View my requests and status: dashboard lists each request with dates, type, working-day length, status (Pending, Approved or Rejected) and any manager comment; status updates appear automatically without resubmitting. View my annual balance: employee sees remaining annual leave out of 20 days, equal to 20 minus approved annual working days this calendar year, adjusted by any HR correction; approved sick leave does not reduce this balance; balance resets to 20 days each new calendar year with no carryover.

### REQ-FEAT-MANAGER · approved · source: requirements:Manager approvals

Feature group covering a manager's review and decision workflow on direct reports' requests.

Review reports' pending requests: approvals view shows each pending request from direct reports with employee, dates, type, working-day length, reason, remaining balance and any overlap flag; requests from non-direct-reports do not appear. Approve or reject with comment: manager approves or rejects each request with a comment; approving an annual request sets it Approved, reduces the employee's annual balance by the working-day length, and records the comment; rejecting sets it Rejected with no deduction and records the comment. Prevent over-approving annual leave: if an annual request's working-day length exceeds the employee's remaining annual balance, approval is blocked and the manager is told it exceeds the balance; sick requests can always be approved because sick leave is uncapped and separate.

### REQ-FEAT-CALENDAR · approved · source: requirements:Team calendar

Feature group covering the shared team calendar of approved leave and confidentiality of sick-leave reasons on it.

View who is on leave: the team calendar shows each person as on leave on their approved leave days, visible to all users; pending requests are not shown. Hide sick-leave reasons on calendar: when a person has approved sick leave, other team members see that they are on leave but the reason text is not displayed on the shared calendar.

### REQ-FEAT-NOTIFICATIONS · approved · source: requirements:In-app notifications

Feature group covering in-app-only activity indicators for managers and employees.

In-app activity indicators: managers see an in-app indication when a direct report submits a request awaiting their decision; employees see an in-app indication when their request is approved or rejected. No email or SMS is sent.

### REQ-FEAT-HRADMIN · approved · source: requirements:HR administration

Feature group covering HR/Admin management of users, reporting lines, balances, and the audit log.

Manage the user list: HR/Admin can add, edit and deactivate users with a role of Employee, Manager or HR/Admin; new users become selectable on the sign-in list, deactivated users disappear from the list and have active sessions ended. Assign reporting lines: HR/Admin sets which manager each employee reports to, so the employee's future pending requests appear in that manager's approvals view and in no other manager's view. Adjust leave balances: HR/Admin can set a new remaining annual balance for an employee with a note (e.g., mid-year joiners or corrections); the balance updates and the change is written to the audit log with the acting identity, timestamp and note. View the audit log: HR/Admin can open the audit log and see each entry with the acting user, timestamp and detail; Employees and Managers are denied access.

### REQ-FEAT-HELP · approved · source: requirements:Help & documentation

Feature group covering in-app getting-started documentation for all roles.

Getting-started documentation: role-appropriate guidance is available in the app covering how to select an identity, submit leave, approve requests as a manager, and administer users and balances as HR/Admin. Any referenced credential uses a placeholder such as <set-at-first-login> rather than a real value.

### NFR-001 · approved · source: requirements:NFR-001

Security - sessions expire after a configured period of inactivity.

A signed-in session expires after a configured period of inactivity; when the user next attempts an action they must select their identity again. No specific inactivity timeout value was agreed.

**Related:** REQ-FEAT-SIGNIN

### NFR-002 · approved · source: requirements:NFR-002

Security - sign-out and HR deactivation immediately end sessions.

Signing out immediately ends the session and returns the user to the identity selection screen. When HR/Admin deactivates a user, any session acting as that user ends so nobody can continue acting as them.

**Related:** REQ-FEAT-SIGNIN

### NFR-003 · approved · source: requirements:NFR-003

Security - role-based access control is enforced throughout the app.

Domain-skill analogue flagged for human confirmation: role-based access by line of business is a typical insurance non-functional requirement; here the equivalent control is role-based access by HR role. The app shows and permits only the actions/data allowed for the acting role: managers can act only on their own direct reports' requests; only HR/Admin can manage users, reporting lines and balances and view the audit log.

**Related:** REQ-FEAT-SIGNIN, REQ-FEAT-MANAGER, REQ-FEAT-HRADMIN

### NFR-004 · approved · source: requirements:NFR-004

Privacy - sick-leave reasons are confidential, visible only to the employee, their manager, and HR/Admin.

GDPR / health-data confidentiality control (flagged for human confirmation of applicability, not legal advice - this is employee HR data, not policyholder health data): a sick-leave reason is visible only to the employee, their manager and HR/Admin; it is never shown to other colleagues or on the shared team calendar.

**Related:** REQ-FEAT-REQUESTING, REQ-FEAT-CALENDAR

### NFR-005 · approved · source: requirements:NFR-005

Compliance - single EU region hosting with GDPR-aligned handling of personal and health-related data.

GDPR: data-residency and special-category data protection control (flagged for human confirmation, not legal advice). All personal and health-related data is stored and processed in a single EU region with GDPR-aligned handling; sensitive sick-leave data is encrypted and access-controlled. Target: single EU region.

**Related:** REQ-TECH-STACK

### NFR-006 · approved · source: requirements:NFR-006

Compliance - append-only audit history of submissions, decisions, and balance adjustments.

GDPR: accountability-principle / audit-trail control (flagged for human confirmation, not legal advice). Audit entries for request submissions, approve/reject decisions (with comment), and HR balance adjustments are retained unchanged as an append-only history, each with the acting user and timestamp.

**Related:** REQ-FEAT-HRADMIN

### NFR-007 · approved · source: requirements:NFR-007

Scalability - sized for a single small team rather than thousands of users.

The app is sized for a single small team of tens of users rather than thousands, running a small footprint. Target: tens of users.

**Related:** REQ-TECH-STACK

### NFR-008 · approved · source: requirements:NFR-008

Compatibility - responsive web app for desktop and mobile browsers, no native app.

The app works as a responsive web application on both desktop and mobile browsers from a single codebase; there is no native mobile app.

**Related:** REQ-TECH-STACK

### NFR-009 · approved · source: requirements:NFR-009

Security (accepted risk) - no passwords or external login; access control relies on chosen identity and role.

Users sign in by selecting their identity from a list, with no passwords or external authentication; access control relies on the chosen identity and role. Accepted because the app is for a trusted internal team of tens of users.

**Related:** REQ-FEAT-SIGNIN

### NFR-010 · approved · source: requirements:NFR-010

Usability (accepted risk) - in-app notifications only, no email or SMS in version 1.

Notifications are shown in-app only, with no email or SMS alerts in version 1; users are informed of pending requests and decisions only when they next use the app.

**Related:** REQ-FEAT-NOTIFICATIONS

### REQ-COMPLIANCE-REVIEW · draft · source: requirements:domain-skill-insurance

The project is tagged with the Insurance industry domain skill, but the stated requirements describe an internal team leave-management app with no policyholder, claims, premium, or underwriting data. Flagged for human confirmation rather than assumed.

Open questions for a human to confirm (not legal advice, not a compliance determination): (1) Does this app sit inside a regulated insurer such that insurer-level rules (e.g., Solvency II, NAIC model laws, IRDAI) or customer fair-treatment/conduct rules could apply indirectly to internal HR tooling, or are they out of scope here? (2) The sick-leave reason field holds health-related personal data about employees, not policyholders or claimants - confirm whether any HIPAA-like or local health-data rule applies to internal HR records in this organization, beyond the GDPR-aligned handling already specified in NFR-004/NFR-005. (3) No claims handling, premiums, underwriting, policy-admin integration, or automated pricing/decisioning appear anywhere in scope - confirm there is no hidden connection to those insurance-specific risk areas (claims fraud, premium/reserve miscalculation, unexplainable automated decisions) before closing the domain checklist. (4) Confirm whether the audit log (NFR-006) and sick-leave reason data need a retention period aligned to any regulatory retention rule applicable to the parent organization, beyond what is currently specified.

**Related:** NFR-004, NFR-005, NFR-006
<!-- sdlc:auto:end narrative -->

<!-- sdlc:auto:start summary -->
**Requirements version:** v1  
**Delivery scope:** lightweight  
**Approved:** 2026-11-19

**Capabilities in scope:** Pick-your-identity sign-in from a user list, Submit a leave request (start date, end date, annual or sick, reason), View my own leave requests and their current status, See my remaining annual leave balance (out of 20 days), Whole-working-day leave length calculation, My-leave employee dashboard, Getting-started documentation for the app, Leave counted in whole working days, Mon–Fri, no half-days, No public-holiday calendar in version 1, 20-day annual balance resets each year with no carryover

**Approved technology stack:**

| Layer | Choice | Rationale |
|---|---|---|
| backend | FastAPI | Your rules live in the backend: deducting annual leave from the 20-day balance, keeping sick leave uncapped and separate, counting whole working days excluding weekends, blocking approvals that exceed balance, enforcing that managers act only on their own reports, and writing an audit log on every decision. FastAPI is a clean fit for expressing these checks as a small, well-defined set of endpoints, and is the platform default. |
| cloud | AWS | You need single-region hosting with GDPR-aligned handling of personal and health data. AWS lets you pin all data to one EU region, gives you encryption and access controls for the sensitive sick-leave notes, and is the platform default. Its scale is far beyond what tens of users need, so you simply run a small footprint. |
| database | PostgreSQL | Everything here is structured and relational: users, reporting lines, leave requests, balances per year, and an append-only audit trail. PostgreSQL enforces these relationships and the correctness of balance adjustments reliably, and its row-level controls help you limit access to sensitive sick-leave reasons to the employee, their manager and HR, as your GDPR handling requires. |
| frontend | React | The product is a responsive web app with several distinct interactive screens — a leave request form, a manager approval queue, a team calendar grid, and an HR admin area for users and balances. React handles this kind of role-driven, stateful interface well and is the platform default here. It covers desktop and mobile browsers from one codebase, which is exactly what you asked for (no native app). |
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start epics -->
## EPIC-001: Pick-Your-Identity Sign-In and Roles

The app is internal to a single small team and has no external login. A user signs in by choosing their identity from a list of users and acts in their assigned role (Employee, Manager, or HR/Admin). Role determines what each user can see and do. Assumption: because identity is selected from a list rather than authenticated with credentials, there are no passwords in v1; access control relies on the selected identity and role, and the app is intended for a trusted internal team of tens of users in a single region with GDPR-aligned handling.

### US-001: Select my identity from the user list

**Priority:** critical

> As a team member, I want to pick my name from a list of users to act as, so that I can use the app without an external login.

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | I open the app and am not acting as anyone | I view the sign-in screen | I see a list of active users to choose from and can select my own identity to start a session |
| AC-002 | a user has been deactivated by HR/Admin | the sign-in list is shown | that user does not appear in the selectable list |

### US-002: Act within my role's permissions

**Priority:** critical

> As a signed-in user, I want the app to show only the actions and data my role allows, so that I cannot see or do things outside my role.

| ID | Given | When | Then |
|---|---|---|---|
| AC-003 | I am acting as an Employee | I use the app | I can submit and view my own leave and the team calendar, but I cannot approve requests or manage users |
| AC-004 | I am acting as a Manager | I use the app | I can additionally see and act on pending requests from my direct reports, but only my direct reports |
| AC-005 | I am acting as HR/Admin | I use the app | I can additionally manage users, assign reporting lines, adjust balances, and view the audit log |

### US-003: End my session

**Priority:** high

> As a signed-in user, I want my session to end when I sign out, when I become inactive, or when my account is deactivated, so that nobody can continue acting as me.

| ID | Given | When | Then |
|---|---|---|---|
| AC-006 | I am acting as a user | I choose to sign out | my session ends and I am returned to the identity selection screen |
| AC-007 | I have been inactive beyond the configured session lifetime | I next attempt an action | my session has expired and I must select my identity again |
| AC-008 | HR/Admin deactivates the account I am acting as | I next attempt an action | my session ends and I can no longer act as that user |

## EPIC-002: Submit a Leave Request

Employees submit leave requests with a start date, end date, type (annual or sick) and a reason. Leave length is calculated in whole working days (Monday–Friday), excluding weekends. Assumptions to surface: no half-days and no public-holiday calendar in v1, so every weekday within the range counts as one day. The system flags overlapping requests for the same employee at submission time.

### US-004: Submit a leave request

**Priority:** critical

> As a employee, I want to submit a leave request with start date, end date, type and reason, so that my manager can review and decide on it.

| ID | Given | When | Then |
|---|---|---|---|
| AC-009 | I am an employee on the submit-leave screen | I enter a valid start date, end date (not before the start date), select a type of annual or sick, and provide a reason, then submit | the request is created with status Pending and appears in my list of requests |
| AC-010 | I leave a required field (dates, type, or reason) empty | I try to submit | the request is not created and I see which field needs completing |

### US-005: See the whole-working-day length of my request

**Priority:** high

> As a employee, I want the request length calculated in whole working days, so that I know how many days I am requesting.

| ID | Given | When | Then |
|---|---|---|---|
| AC-011 | I enter a date range that spans weekdays and weekends | the length is calculated | only Monday-to-Friday days within the range are counted and each counts as one whole day |
| AC-012 | version 1 has no public-holiday calendar and no half-days | any weekday falls within my requested range | it is counted as a full working day with no deduction for public holidays |

### US-006: Be warned about overlapping requests

**Priority:** medium

> As a employee, I want to be warned when a new request overlaps an existing one of mine, so that I do not accidentally book conflicting leave.

| ID | Given | When | Then |
|---|---|---|---|
| AC-013 | I already have a pending or approved request covering some of the same dates | I submit a new request that overlaps those dates | the system flags the overlap so that I and my manager can see it before a decision is made |

## EPIC-003: My-Leave Employee Dashboard

Each employee has a dashboard to view their own leave requests with current status and their remaining annual leave balance (out of 20 days per year). Annual leave deducts from the 20-day balance; sick leave is tracked separately, is uncapped and does not reduce the annual balance. Assumption: the 20-day balance resets each calendar year with no carryover.

### US-007: View my leave requests and their status

**Priority:** high

> As a employee, I want to see all my leave requests and their current status, so that I know what is pending, approved or rejected.

| ID | Given | When | Then |
|---|---|---|---|
| AC-014 | I have submitted one or more requests | I open my dashboard | I see each request with its dates, type, working-day length, status (Pending, Approved, Rejected) and any manager comment |
| AC-015 | a request of mine has been approved or rejected | I view my dashboard | the updated status is shown without me needing to resubmit anything |

### US-008: See my remaining annual leave balance

**Priority:** high

> As a employee, I want to see my remaining annual leave out of 20 days, so that I know how much annual leave I have left.

| ID | Given | When | Then |
|---|---|---|---|
| AC-016 | I have approved annual leave this calendar year | I view my balance | my remaining balance equals 20 days minus approved annual working days, adjusted by any HR correction |
| AC-017 | I have approved sick leave | I view my balance | my annual balance is unchanged because sick leave is tracked separately and does not reduce the 20-day balance |
| AC-018 | a new calendar year begins | I view my balance | my annual balance has reset to 20 days with no carryover of unused days from the previous year |

## EPIC-004: Manager Review and Decisions

Managers see pending leave requests from their direct reports and approve or reject each with a comment. A manager can only act on their own direct reports. The system prevents approving annual leave that would exceed the employee's remaining balance.

### US-009: Review pending requests from my direct reports

**Priority:** critical

> As a manager, I want to see pending leave requests from my direct reports, so that I can decide on them.

| ID | Given | When | Then |
|---|---|---|---|
| AC-019 | I am a manager with direct reports who have pending requests | I open my approvals view | I see each pending request with the employee, dates, type, working-day length, reason, remaining balance and any overlap flag |
| AC-020 | a request belongs to an employee who is not my direct report | I view my approvals | that request does not appear and I cannot act on it |

### US-010: Approve or reject a request with a comment

**Priority:** critical

> As a manager, I want to approve or reject each request with a comment, so that the employee has a decision and a reason.

| ID | Given | When | Then |
|---|---|---|---|
| AC-021 | a pending annual request within the employee's remaining balance | I approve it with a comment | its status becomes Approved, the employee's annual balance is reduced by the working-day length, and the comment is recorded |
| AC-022 | a pending request | I reject it with a comment | its status becomes Rejected, no balance is deducted, and the comment is recorded |

### US-011: Be prevented from over-approving annual leave

**Priority:** high

> As a manager, I want the system to stop me approving annual leave beyond the remaining balance, so that employees cannot exceed their 20-day entitlement.

| ID | Given | When | Then |
|---|---|---|---|
| AC-023 | a pending annual request whose working-day length exceeds the employee's remaining annual balance | I try to approve it | the approval is blocked and I am told the request exceeds the remaining balance |
| AC-024 | a pending sick request | I approve it | the approval succeeds regardless of annual balance because sick leave is uncapped and separate |

## EPIC-005: Team Calendar

A team calendar shows who is on leave each day. Assumption: only approved leave is shown on the shared calendar to all users; pending requests are not shown. To protect sensitive data, the shared calendar shows that a person is on leave without exposing sick-leave reasons.

### US-012: View who is on leave by day

**Priority:** high

> As a team member, I want to see who is on approved leave each day, so that I can plan around team availability.

| ID | Given | When | Then |
|---|---|---|---|
| AC-025 | colleagues have approved leave | I open the team calendar | I see each person shown as on leave on their approved leave days |
| AC-026 | a request is still pending | I view the team calendar | it is not shown, because only approved leave appears on the shared calendar |

### US-013: Keep sick-leave reasons off the shared calendar

**Priority:** high

> As a employee, I want the shared calendar not to reveal my sick-leave reason, so that my health-related information stays private.

| ID | Given | When | Then |
|---|---|---|---|
| AC-027 | I have approved sick leave | other team members view the calendar | they see that I am on leave but the reason text is not displayed to them |

## EPIC-006: HR/Admin Administration

A dedicated HR/Admin manages the user list, assigns reporting lines (who reports to which manager), and can correct or adjust leave balances (for example for mid-year joiners). All balance adjustments are recorded in the audit log.

### US-014: Manage the user list

**Priority:** high

> As a HR/Admin, I want to add, edit and deactivate users with their role, so that the identity list and permissions stay correct.

| ID | Given | When | Then |
|---|---|---|---|
| AC-028 | I am HR/Admin | I add a user with a name and role of Employee, Manager, or HR/Admin | the user is created and becomes selectable on the sign-in list |
| AC-029 | a user has left the team | I deactivate that user | they no longer appear on the sign-in list and existing sessions as that user end |

### US-015: Assign reporting lines

**Priority:** high

> As a HR/Admin, I want to assign which manager each employee reports to, so that approvals route to the correct manager.

| ID | Given | When | Then |
|---|---|---|---|
| AC-030 | an employee and a manager exist | I set the employee's manager | that employee's future pending requests appear in that manager's approvals view and not in any other manager's view |

### US-016: Adjust leave balances

**Priority:** medium

> As a HR/Admin, I want to correct or adjust an employee's annual leave balance, so that mid-year joiners and corrections are handled fairly.

| ID | Given | When | Then |
|---|---|---|---|
| AC-031 | an employee whose balance needs correcting | I set a new remaining annual balance with a note | the employee's balance updates to the new value and the change is written to the audit log with my identity, timestamp and note |

## EPIC-007: Audit Trail

All request submissions, approve/reject decisions (with comment), and HR balance adjustments are logged with a timestamp and the acting user. The audit log is viewable by HR/Admin.

### US-017: Record key actions in an audit log

**Priority:** high

> As a HR/Admin, I want submissions, decisions and balance adjustments logged, so that there is an accountable history of leave activity.

| ID | Given | When | Then |
|---|---|---|---|
| AC-032 | an employee submits a request, a manager approves or rejects one, or HR adjusts a balance | the action completes | an audit entry is recorded with the acting user, timestamp, action type and relevant detail including any comment |

### US-018: View the audit log

**Priority:** medium

> As a HR/Admin, I want to view the audit log, so that I can review what happened and when.

| ID | Given | When | Then |
|---|---|---|---|
| AC-033 | audit entries exist | I open the audit log as HR/Admin | I see the recorded entries with acting user, timestamp and detail |
| AC-034 | I am acting as an Employee or Manager | I attempt to open the audit log | access is denied because only HR/Admin may view it |

## EPIC-008: In-App Notifications

Consistent with pick-from-list identity and no email addresses, notifications are in-app only. Assumption: there are no email or SMS notifications in v1; managers see pending requests awaiting them and employees see status changes within the app.

### US-019: See in-app notice of items needing my attention

**Priority:** medium

> As a manager or employee, I want to see in-app indicators of new activity relevant to me, so that I act on requests and learn of decisions without email.

| ID | Given | When | Then |
|---|---|---|---|
| AC-035 | a direct report submits a request | I next use the app as their manager | I see an in-app indication that requests are awaiting my decision |
| AC-036 | my request has been approved or rejected | I next use the app as that employee | I see an in-app indication of the status change |
| AC-037 | version 1 has in-app notifications only | any notification is raised | no email or SMS is sent |

## EPIC-009: Sensitive Data and Privacy Handling

Sick-leave reasons may contain health-related personal data and are treated as sensitive personal data under GDPR. Access to a sick-leave reason is limited to the employee, their manager and HR/Admin. Assumption: single-region, GDPR-aligned handling; reasons are stored as free text with restricted access.

### US-020: Restrict access to sick-leave reasons

**Priority:** high

> As a employee, I want my sick-leave reason visible only to me, my manager and HR, so that my health-related information stays confidential.

| ID | Given | When | Then |
|---|---|---|---|
| AC-038 | I have a sick-leave request with a reason | a colleague who is not my manager or HR views leave information | they cannot see the reason text |
| AC-039 | a sick-leave request with a reason | I view it as the employee, their manager, or HR/Admin | the reason text is visible |

## EPIC-010: Getting-Started Documentation

Provide concise getting-started documentation so a small team can begin using the app, covering how to pick an identity, submit leave, approve as a manager, and administer users and balances as HR/Admin.

### US-021: Access getting-started guidance

**Priority:** low

> As a new user of the app, I want getting-started documentation for my role, so that I can start using the app without external training.

| ID | Given | When | Then |
|---|---|---|---|
| AC-040 | I am using the app | I open the getting-started documentation | I find role-appropriate guidance covering selecting an identity, submitting leave, approving requests, and HR administration tasks |
| AC-041 | any credentials or placeholders are referenced in the documentation | I read an example | it uses a placeholder such as <set-at-first-login> rather than a real value |
<!-- sdlc:auto:end epics -->
