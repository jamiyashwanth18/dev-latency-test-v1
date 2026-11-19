# Tests

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start summary -->
90 tests · Passed 90 · Failed 0 · Skipped 0 · Not run 0

Acceptance criteria covered: 9/41 · passing: 9/41
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
| — | the app loads | E2E | Passed | `frontend/e2e/example.spec.ts` |
<!-- sdlc:auto:end tests -->
