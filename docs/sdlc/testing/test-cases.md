# Tests

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start summary -->
179 tests · Passed 167 · Failed 10 · Skipped 2 · Not run 0

Acceptance criteria covered: 26/41 · passing: 18/41
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start tests -->
## Sprint 2

### US-001: Select my identity from the user list

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| — | App > sign-out calls DELETE /sessions/current, clears the token and returns to sign-in | Unit | Passed | `frontend/src/App.test.tsx` |
| AC-001 | SignIn > [AC-001] a 404 sign-in error shows 'that user can no longer sign in' | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-001 | SignIn > [AC-001] loads and renders the real active users from GET /users/active | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-001 | SignIn > [AC-001] selecting an identity calls POST /sessions and stores the returned token | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| — | SignIn > shows an empty state when the user list comes back empty | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| — | SignIn > shows an error state when the user list fails to load | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-001 | test_ac001_returns_active_users_ordered_by_name_then_id | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| AC-002 | test_ac002_deactivated_user_never_appears | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_authenticated_request_slides_the_idle_window | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_deactivating_user_rejects_their_token_on_next_request | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_expired_token_returns_401 | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_get_me_returns_identity | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_no_authorization_header_returns_401 | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_non_bearer_scheme_returns_401 | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_sign_in_deactivated_user_returns_404 | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_sign_in_malformed_user_id_returns_404 | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_sign_in_missing_user_id_returns_422 | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_sign_in_returns_opaque_token_and_user | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_sign_in_unknown_user_id_returns_404_and_creates_no_session | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_sign_out_revokes_and_second_call_returns_401 | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_signing_in_twice_creates_two_independent_sessions | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_unknown_token_returns_401 | Integration | Passed | `backend/tests/unit/test_sessions.py` |
| — | [AC-US-001-3-a] no session shows the identity list; picking a name starts a session and lands in the app; signing out returns to the identity list and the protected view is no longer reachable | E2E | Passed | `frontend/e2e/identity-session.spec.ts` |
| — | [AC-US-001-3-b] a user deactivated through the admin API no longer appears in the sign-in list after a reload | E2E | Passed | `frontend/e2e/identity-session.spec.ts` |

### US-004: Submit a leave request

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-011 | test_ac011_saturday_to_sunday_range_has_no_weekday | Unit | Passed | `backend/tests/unit/test_leave_calc.py` |
| AC-011 | test_ac011_single_weekday_counts_as_one | Unit | Passed | `backend/tests/unit/test_leave_calc.py` |
| AC-011 | test_ac011_weekend_spanning_range_excludes_saturday_and_sunday | Unit | Passed | `backend/tests/unit/test_leave_calc.py` |
| AC-012 | test_ac012_full_week_counts_five_regardless_of_start_day | Unit | Passed | `backend/tests/unit/test_leave_calc.py` |
| — | test_end_before_start_counts_zero | Unit | Passed | `backend/tests/unit/test_leave_calc.py` |
| AC-009 | MyLeave > [AC-009] lists my requests from GET /leave-requests/mine with status and working_days | Unit | Passed | `frontend/src/screens/MyLeave.test.tsx` |
| AC-009 | MyLeave > [AC-009] successful submission posts to /leave-requests and the new request appears Pending with its working_days, with no manual reload | Unit | Passed | `frontend/src/screens/MyLeave.test.tsx` |
| AC-010 | MyLeave > [AC-010] a mapped server 422 (no working day in range) is shown inline on end date, not as a thrown error | Unit | Passed | `frontend/src/screens/MyLeave.test.tsx` |
| AC-010 | MyLeave > [AC-010] leaving the end date empty blocks submit and names the field | Unit | Passed | `frontend/src/screens/MyLeave.test.tsx` |
| AC-010 | MyLeave > [AC-010] leaving the reason empty blocks submit and names the field | Unit | Passed | `frontend/src/screens/MyLeave.test.tsx` |
| AC-010 | MyLeave > [AC-010] leaving the start date empty blocks submit and names the field | Unit | Passed | `frontend/src/screens/MyLeave.test.tsx` |
| AC-010 | MyLeave > [AC-010] leaving the type empty blocks submit and names the field | Unit | Passed | `frontend/src/screens/MyLeave.test.tsx` |
| AC-011, AC-012 | MyLeave > [AC-011][AC-012] the list renders the server's working_days as a whole number without computing its own length | Unit | Passed | `frontend/src/screens/MyLeave.test.tsx` |
| — | MyLeave > a 401 from the list fetch clears the session and returns to sign-in | Unit | Passed | `frontend/src/screens/MyLeave.test.tsx` |
| — | MyLeave > the list shows an empty state when no requests exist | Unit | Passed | `frontend/src/screens/MyLeave.test.tsx` |
| — | MyLeave > the list shows an error state with retry when the fetch fails | Unit | Passed | `frontend/src/screens/MyLeave.test.tsx` |
| AC-009 | test_ac009_valid_submission_returns_201_pending_and_appears_in_mine | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| AC-010 | test_ac010_end_date_before_start_date_returns_422 | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| AC-010 | test_ac010_missing_reason_returns_422_and_creates_no_row | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| AC-010 | test_ac010_unknown_leave_type_returns_422 | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| AC-010 | test_ac010_whitespace_reason_returns_422 | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| AC-011 | test_ac011_weekend_only_range_returns_422 | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| — | test_annual_reason_never_stripped | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| — | test_has_overlap_true_when_pending_request_intersects | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| — | test_mine_orders_created_at_desc_then_id_desc | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| — | test_pending_returns_403_for_employee | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| — | test_pending_returns_all_for_hr_admin | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| — | test_pending_returns_direct_reports_requests_ordered_created_at_asc | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| — | test_sick_reason_hidden_from_an_unrelated_manager_but_visible_to_own_manager | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| — | test_submission_writes_exactly_one_audit_log_row | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| — | test_unauthenticated_post_returns_401 | Integration | Passed | `backend/tests/unit/test_leave_requests.py` |
| AC-009 | [AC-009] an employee signs in, submits a valid annual request and sees it in their list with status Pending | E2E | Passed | `frontend/e2e/leave-request.spec.ts` |
| AC-010 | [AC-010] submitting with each required field empty in turn creates nothing and shows which field needs completing | E2E | Passed | `frontend/e2e/leave-request.spec.ts` |

### US-014: Manage the user list

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-028 | Admin > [AC-028] add-user success posts {full_name, role} and the new user appears without a manual reload | Unit | Passed | `frontend/src/screens/Admin.test.tsx` |
| AC-028 | Admin > [AC-028] add-user validation error shows inline messages and never calls the API | Unit | Passed | `frontend/src/screens/Admin.test.tsx` |
| AC-028 | Admin > [AC-028] lists users from GET /admin/users for an HR/Admin session | Unit | Passed | `frontend/src/screens/Admin.test.tsx` |
| AC-029 | Admin > [AC-029] deactivate calls PATCH {is_active:false}, renders the row inactive, and explains sign-in is blocked | Unit | Passed | `frontend/src/screens/Admin.test.tsx` |
| AC-030 | Admin > [AC-030] manager assignment saves via PATCH {manager_id} | Unit | Passed | `frontend/src/screens/Admin.test.tsx` |
| — | Admin > the whole screen shows an HR/Admin only message for a non-HR/Admin session | Unit | Passed | `frontend/src/screens/Admin.test.tsx` |
| AC-028 | test_ac028_create_user_returns_201_and_appears_in_active_users | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| AC-029 | test_ac029_deactivation_revokes_sessions_and_hides_from_active | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| AC-030 | test_ac030_manager_assignment_sets_reporting_line | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| — | test_empty_full_name_returns_422 | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| — | test_list_users_ordered_by_full_name_case_insensitive_then_id | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| — | test_malformed_id_returns_404 | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| — | test_non_hr_admin_caller_gets_403_and_changes_nothing | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| — | test_role_accepted_case_insensitively_and_stored_lowercase_on_create | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| — | test_role_change_via_patch | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| — | test_unauthenticated_call_returns_401 | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| — | test_unknown_manager_id_on_create_returns_404 | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| — | test_unknown_manager_id_on_patch_returns_404 | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| — | test_unknown_role_returns_422 | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| — | test_well_formed_but_unknown_id_returns_404 | Integration | Passed | `backend/tests/unit/test_admin_users.py` |
| AC-028 | [AC-028] HR/Admin signs in, adds a user with the Employee role, sees them in the list, deactivates them, and the deactivated user is gone from the sign-in list | E2E | Passed | `frontend/e2e/admin-user-management.spec.ts` |
| AC-029, NFR-002 | [AC-029][NFR-002] deactivating a user through the admin API ends every session they hold and blocks a fresh sign-in | E2E | Passed | `frontend/e2e/admin-user-management.spec.ts` |
| AC-030 | [AC-030] a submitted request routes only to the employee's own manager's pending queue, and reassigning moves future requests | E2E | Passed | `frontend/e2e/admin-user-management.spec.ts` |

## Sprint 3

### US-007: View my leave requests and their status

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-016 | MyLeave balance panel and overlap badge > [AC-016] the balance panel shows the HR adjustment effect | Unit | Passed | `frontend/src/screens/MyLeaveBalance.test.tsx` |
| AC-016, AC-018 | MyLeave balance panel and overlap badge > [AC-016][AC-018] the balance panel shows remaining of allocated days, labelled with the year | Unit | Passed | `frontend/src/screens/MyLeaveBalance.test.tsx` |
| AC-017 | MyLeave balance panel and overlap badge > [AC-017] approved sick leave is listed but visibly excluded from the annual balance figure | Unit | Passed | `frontend/src/screens/MyLeaveBalance.test.tsx` |
| AC-018 | MyLeave balance panel and overlap badge > [AC-018] a new calendar year with no adjustment or approvals reads 20 of 20 | Unit | Passed | `frontend/src/screens/MyLeaveBalance.test.tsx` |
| — | MyLeave balance panel and overlap badge > a row whose has_overlap is true carries a visible overlap warning badge | Unit | Passed | `frontend/src/screens/MyLeaveBalance.test.tsx` |
| — | MyLeave balance panel and overlap badge > a row without overlap shows no overlap badge | Unit | Passed | `frontend/src/screens/MyLeaveBalance.test.tsx` |
| — | MyLeave balance panel and overlap badge > the balance panel shows an error state with retry when its fetch fails | Unit | Passed | `frontend/src/screens/MyLeaveBalance.test.tsx` |
| AC-017 | test_ac017_approved_sick_leave_leaves_remaining_days_unchanged | Integration | Passed | `backend/tests/integration/test_balances.py` |
| AC-018 | test_ac018_prior_year_annual_approval_does_not_reduce_current_years_remaining_days | Integration | Passed | `backend/tests/integration/test_balances.py` |
| — | test_balances_mine_honours_an_hr_adjustment_made_via_put_admin_users_id_balance | Integration | Passed | `backend/tests/integration/test_balances.py` |
| AC-014, AC-015 | test_ac014_ac015_mine_shows_updated_status_and_manager_comment_on_next_read | Integration | Passed | `backend/tests/unit/test_balances.py` |
| AC-016 | test_ac016_first_read_auto_creates_the_balance_row_with_defaults | Integration | Passed | `backend/tests/unit/test_balances.py` |
| AC-017 | test_ac017_approved_sick_leave_never_changes_approved_annual_or_remaining | Integration | Passed | `backend/tests/unit/test_balances.py` |
| AC-018 | test_ac018_request_counts_against_the_year_of_its_start_date | Integration | Passed | `backend/tests/unit/test_balances.py` |
| — | test_authenticated_call_slides_the_idle_window | Integration | Passed | `backend/tests/unit/test_balances.py` |
| — | test_balance_shape_and_formula | Integration | Passed | `backend/tests/unit/test_balances.py` |
| — | test_only_approved_annual_requests_are_deducted | Integration | Passed | `backend/tests/unit/test_balances.py` |
| — | test_unauthenticated_call_returns_401 | Integration | Passed | `backend/tests/unit/test_balances.py` |
| AC-014, AC-015 | [AC-014][AC-015] an employee's request shows Pending with its dates, type and working days, then Approved with the manager's comment after a decision, and offers no way to resubmit it | E2E | Failed | `frontend/e2e/leave-decision-balance.spec.ts` |
| AC-015 | [AC-015] a rejected request shows Rejected with the manager's comment after reloading | E2E | Failed | `frontend/e2e/leave-decision-balance.spec.ts` |
| AC-016 | [AC-016] the balance panel shows a remaining 20 days and drops by the approved annual request's working days | E2E | Failed | `frontend/e2e/leave-decision-balance.spec.ts` |

### US-009: Review pending requests from my direct reports

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-013 | Approvals > [AC-013] a request with has_overlap true shows a visible overlap warning | Unit | Passed | `frontend/src/screens/Approvals.test.tsx` |
| AC-019 | Approvals > [AC-019] loads the pending queue from GET /leave-requests/pending and renders employee, dates, type, working days, reason and remaining balance, with no seeded sample data | Unit | Passed | `frontend/src/screens/Approvals.test.tsx` |
| AC-020 | Approvals > [AC-020] an employee hitting the screen sees the 403 state with no actionable controls | Unit | Passed | `frontend/src/screens/Approvals.test.tsx` |
| AC-038, AC-039 | Approvals > [AC-038][AC-039] a request whose reason is null renders a 'Restricted' placeholder, not an empty cell | Unit | Passed | `frontend/src/screens/Approvals.test.tsx` |
| — | Approvals > a 401 from the list fetch clears the session and returns to sign-in | Unit | Passed | `frontend/src/screens/Approvals.test.tsx` |
| — | Approvals > a 409 response renders the server's detail message without losing the typed comment | Unit | Passed | `frontend/src/screens/Approvals.test.tsx` |
| — | Approvals > approve or reject without a comment is blocked and shows that a comment is required | Unit | Passed | `frontend/src/screens/Approvals.test.tsx` |
| — | Approvals > approve posts to /leave-requests/{id}/decision with the comment and removes the row on success | Unit | Passed | `frontend/src/screens/Approvals.test.tsx` |
| AC-013 | test_ac013_overlapping_request_flagged_not_blocked_and_visible_on_mine_and_pending | Integration | Passed | `backend/tests/integration/test_approvals.py` |
| AC-020 | test_ac020_manager_decision_on_non_direct_report_returns_403_and_stays_pending | Integration | Passed | `backend/tests/integration/test_approvals.py` |
| AC-038 | test_ac038_sick_reason_hidden_from_unrelated_colleague_and_manager | Integration | Passed | `backend/tests/integration/test_approvals.py` |
| AC-039 | test_ac039_sick_reason_readable_by_employee_manager_hr_and_annual_reason_never_stripped | Integration | Passed | `backend/tests/integration/test_approvals.py` |
| — | test_annual_over_balance_returns_409_naming_remaining_balance_sick_approves_fine | Integration | Passed | `backend/tests/integration/test_approvals.py` |
| AC-019 | test_ac019_pending_item_has_remaining_balance_and_has_overlap | Integration | Passed | `backend/tests/unit/test_leave_decisions.py` |
| AC-020 | test_ac020_manager_approves_direct_reports_request | Integration | Passed | `backend/tests/unit/test_leave_decisions.py` |
| AC-020 | test_ac020_non_manager_gets_403_and_changes_nothing | Integration | Passed | `backend/tests/unit/test_leave_decisions.py` |
| — | test_approving_annual_request_exceeding_balance_returns_409_naming_balance | Integration | Passed | `backend/tests/unit/test_leave_decisions.py` |
| — | test_deciding_a_non_pending_request_returns_409 | Integration | Passed | `backend/tests/unit/test_leave_decisions.py` |
| — | test_empty_comment_returns_422 | Integration | Passed | `backend/tests/unit/test_leave_decisions.py` |
| — | test_malformed_id_returns_404 | Integration | Passed | `backend/tests/unit/test_leave_decisions.py` |
| — | test_missing_comment_returns_422 | Integration | Passed | `backend/tests/unit/test_leave_decisions.py` |
| — | test_sick_reason_hidden_from_decision_response_for_unrelated_viewer_but_shown_to_manager | Integration | Passed | `backend/tests/unit/test_leave_decisions.py` |
| — | test_sick_request_approval_never_blocked_by_balance | Integration | Passed | `backend/tests/unit/test_leave_decisions.py` |
| — | test_unknown_decision_value_returns_422 | Integration | Passed | `backend/tests/unit/test_leave_decisions.py` |
| — | test_unknown_id_returns_404 | Integration | Passed | `backend/tests/unit/test_leave_decisions.py` |
| AC-019 | [AC-019] a manager opens Approvals and sees a direct report's pending request with employee, dates, type, working days, reason, remaining balance and overlap flag, then approves it with a comment and the row clears | E2E | Failed | `frontend/e2e/approvals.spec.ts` |
| AC-020 | [AC-020] a second employee reporting to another manager has a pending request that never appears in the first manager's queue | E2E | Passed | `frontend/e2e/approvals.spec.ts` |

### US-021: Access getting-started guidance

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-040 | GettingStarted > [AC-040] covers all four topics: identity, submitting leave, approving requests and HR administration | Unit | Passed | `frontend/src/screens/GettingStarted.test.tsx` |
| AC-040 | GettingStarted > [AC-040] filtering by the Employee tab marks approving and HR administration for reference | Unit | Passed | `frontend/src/screens/GettingStarted.test.tsx` |
| AC-040 | GettingStarted > [AC-040] filtering by the HR/Admin tab marks submit-leave and approving for reference, and keeps administration as applying | Unit | Passed | `frontend/src/screens/GettingStarted.test.tsx` |
| AC-040 | GettingStarted > [AC-040] filtering by the Manager tab marks submit-leave and HR administration for reference, and keeps approving as applying | Unit | Passed | `frontend/src/screens/GettingStarted.test.tsx` |
| AC-040 | GettingStarted > [AC-040] the Everyone tab marks every card as applying | Unit | Passed | `frontend/src/screens/GettingStarted.test.tsx` |
| AC-041 | GettingStarted > [AC-041] any credential example uses the <set-at-first-login> placeholder and no real secret value | Unit | Passed | `frontend/src/screens/GettingStarted.test.tsx` |
| AC-040 | [AC-040] a signed-in user opens Getting Started from the navigation and finds guidance for selecting an identity, submitting leave, approving requests and HR administration | E2E | Passed | `frontend/e2e/getting-started.spec.ts` |
| AC-040 | [AC-040] switching the role view marks the guidance that applies to that role | E2E | Failed | `frontend/e2e/getting-started.spec.ts` |
| AC-041 | [AC-041] every credential-like example on the page uses a placeholder, never a real password or token | E2E | Passed | `frontend/e2e/getting-started.spec.ts` |
| NFR-008 | [NFR-008] the Getting Started page renders readably at a mobile viewport | E2E | Failed | `frontend/e2e/getting-started.spec.ts` |

## Sprint 4

### US-010: Approve or reject a request with a comment

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-020 | [AC-020] a manager attempting a decision on a request that is not their direct report's is refused and nothing changes | E2E | Passed | `frontend/e2e/leave-decision-approve-reject.spec.ts` |
| AC-021 | [AC-021] a manager approves a direct report's annual request with a comment: it clears the queue, shows Approved with the comment on My Leave, and drops the remaining balance by its working days | E2E | Failed | `frontend/e2e/leave-decision-approve-reject.spec.ts` |
| AC-021, NFR-008 | [AC-021][NFR-008] a manager approves a direct report's request with a comment at a mobile viewport | E2E | Failed | `frontend/e2e/leave-decision-approve-reject.spec.ts` |
| AC-022 | [AC-022] a manager rejects a pending request with a comment: status becomes Rejected, the comment is visible to the employee, and the remaining balance is unchanged | E2E | Failed | `frontend/e2e/leave-decision-approve-reject.spec.ts` |
| AC-023 | [AC-023] approving an annual request longer than the remaining balance is blocked: the UI shows an error naming the remaining balance and the request is still pending afterwards | E2E | Passed | `frontend/e2e/leave-decision-approve-reject.spec.ts` |
| AC-024 | [AC-024] approving a sick request succeeds even when the annual balance is zero or negative, and the annual remaining balance is unchanged | E2E | Passed | `frontend/e2e/leave-decision-approve-reject.spec.ts` |

### US-016: Adjust leave balances

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-031 | Admin balance adjustment > [AC-031] a 401 response clears the stored token and redirects to /sign-in | Unit | Passed | `frontend/src/screens/AdminBalance.test.tsx` |
| AC-031 | Admin balance adjustment > [AC-031] a 403 response shows the HR/Admin-only server message inline | Unit | Passed | `frontend/src/screens/AdminBalance.test.tsx` |
| AC-031 | Admin balance adjustment > [AC-031] a 404 response shows the API detail text inline | Unit | Passed | `frontend/src/screens/AdminBalance.test.tsx` |
| AC-031 | Admin balance adjustment > [AC-031] a 422 response shows the API detail text inline without closing the panel | Unit | Passed | `frontend/src/screens/AdminBalance.test.tsx` |
| AC-031 | Admin balance adjustment > [AC-031] a non-integer new remaining days blocks the request and shows a visible inline validation error | Unit | Passed | `frontend/src/screens/AdminBalance.test.tsx` |
| AC-031 | Admin balance adjustment > [AC-031] an empty or whitespace-only note blocks the request and shows a visible inline validation error | Unit | Passed | `frontend/src/screens/AdminBalance.test.tsx` |
| AC-031 | Admin balance adjustment > [AC-031] each user row offers an 'Adjust balance' action that opens a panel with a numeric days field and a required note field | Unit | Passed | `frontend/src/screens/AdminBalance.test.tsx` |
| AC-031 | Admin balance adjustment > [AC-031] negative new remaining days is accepted and rendered | Unit | Passed | `frontend/src/screens/AdminBalance.test.tsx` |
| AC-031 | Admin balance adjustment > [AC-031] saving sends PUT /admin/users/{id}/balance with the current UTC year, new_remaining_days and trimmed note, and shows the returned remaining_days, closing the panel | Unit | Passed | `frontend/src/screens/AdminBalance.test.tsx` |
| AC-031 | [AC-031-API] a balance adjustment is recorded in the audit trail with the acting HR/Admin's identity, a timestamp and the note | E2E | Passed | `frontend/e2e/admin-balance-adjustment.spec.ts` |
| AC-031 | [AC-031-EMPTY-NOTE] saving a balance adjustment with an empty note is refused and the employee's balance is unchanged | E2E | Passed | `frontend/e2e/admin-balance-adjustment.spec.ts` |
| AC-031 | [AC-031-FORBIDDEN] a non-HR/Admin user cannot reach or perform the balance adjustment, and nothing changes | E2E | Passed | `frontend/e2e/admin-balance-adjustment.spec.ts` |
| AC-031 | [AC-031-INTERACTION] an adjustment to N days lets an N-working-day annual approval through, and blocks an N+1-working-day approval with the over-balance message | E2E | Passed | `frontend/e2e/admin-balance-adjustment.spec.ts` |
| AC-031 | [AC-031] HR/Admin adjusts an employee's remaining annual balance with a note, the screen shows the new remaining days, and the employee's own balance view reports the same value | E2E | Passed | `frontend/e2e/admin-balance-adjustment.spec.ts` |
| AC-031, NFR-008 | [AC-031][NFR-008] the balance-adjustment flow renders and works at a mobile viewport | E2E | Failed | `frontend/e2e/admin-balance-adjustment.spec.ts` |
| NFR-005 | [NFR-005] single EU region, GDPR-aligned hosting | E2E | Skipped | `frontend/e2e/admin-balance-adjustment.spec.ts` |
| NFR-007 | [NFR-007] sized for a small team | E2E | Skipped | `frontend/e2e/admin-balance-adjustment.spec.ts` |

## Project setup

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| — | test_downgrade_removes_the_schema_again | Unit | Passed | `backend/tests/unit/test_migrations.py` |
| — | test_upgrade_head_builds_every_table_the_models_declare | Unit | Passed | `backend/tests/unit/test_migrations.py` |
| — | test_a_half_configured_pair_seeds_nothing | Unit | Passed | `backend/tests/unit/test_seed.py` |
| — | test_seeding_twice_creates_nothing_the_second_time | Unit | Passed | `backend/tests/unit/test_seed.py` |
| — | test_seeds_nothing_when_the_platform_set_nothing | Unit | Passed | `backend/tests/unit/test_seed.py` |
| — | test_seeds_the_admin_and_the_smoke_user_with_their_roles | Unit | Passed | `backend/tests/unit/test_seed.py` |
| — | App > renders a screen inside the app shell and shows its menu | Unit | Passed | `frontend/src/App.test.tsx` |
| — | test_health_reports_ok | Integration | Passed | `backend/tests/integration/test_health.py` |
| — | test_the_openapi_document_builds | Integration | Passed | `backend/tests/integration/test_health.py` |
| — | test_ac_admin_audit_log_requires_hr_admin_and_orders_newest_first | Integration | Passed | `backend/tests/unit/test_admin_audit_log.py` |
| — | test_ac_admin_audit_log_unauthenticated_returns_401 | Integration | Passed | `backend/tests/unit/test_admin_audit_log.py` |
| AC-016 | test_ac016_put_balance_sets_remaining_days_and_leaves_allocated_days_unchanged | Integration | Passed | `backend/tests/unit/test_admin_balance.py` |
| — | test_put_balance_malformed_id_returns_404 | Integration | Passed | `backend/tests/unit/test_admin_balance.py` |
| — | test_put_balance_non_hr_admin_caller_gets_403 | Integration | Passed | `backend/tests/unit/test_admin_balance.py` |
| — | test_put_balance_requires_non_empty_note_returns_422 | Integration | Passed | `backend/tests/unit/test_admin_balance.py` |
| — | test_put_balance_unknown_id_returns_404 | Integration | Passed | `backend/tests/unit/test_admin_balance.py` |
| — | test_put_balance_writes_exactly_one_audit_log_row | Integration | Passed | `backend/tests/unit/test_admin_balance.py` |
| — | the app loads | E2E | Passed | `frontend/e2e/example.spec.ts` |
<!-- sdlc:auto:end tests -->
