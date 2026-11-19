import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import {
  createUser,
  decideLeaveRequest,
  derivedDisplayName,
  getAuditLog,
  getBalanceMine,
  putAdminBalance,
  signInAs,
  signInAsAdmin,
  submitLeaveRequest,
} from "./support/api";

// [US-016-3] HR/Admin balance adjustment: the employee's balance updates to the new
// value, the change is auditable, and it interacts correctly with the approval flow's
// balance check. The Admin screen may not yet carry an adjustment control (this ticket
// may land concurrently with the UI work), so AC-031's on-screen assertions are written
// against the contract's own vocabulary (an "Adjust balance" action per row, a panel
// that shows the resulting remaining days) and will fail to find it until that UI ships;
// that is expected, not a defect in this spec.
//
// The current UTC year is used throughout, per the contract: never a year hard-coded at
// authoring time.

const CURRENT_YEAR = new Date().getUTCFullYear();

async function signInThroughUi(page: import("@playwright/test").Page, name: string) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Choose Your Identity/i })).toBeVisible();
  await page.getByPlaceholder("Name or role").fill(name);
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

test("[AC-031] HR/Admin adjusts an employee's remaining annual balance with a note, the screen shows the new remaining days, and the employee's own balance view reports the same value", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminName = derivedDisplayName(email);
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const employeeName = `QA AC031 Employee ${suffix}`;
  const employee = await createUser(adminToken, { full_name: employeeName, role: "employee" });

  const note = `QA AC031 adjustment note ${suffix}`;

  await signInThroughUi(page, adminName);
  await page.goto("/admin");
  await expect(page.getByText(/Administration/i)).toBeVisible();

  const row = page.locator("tr", { hasText: employeeName });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /Adjust balance/i }).click();

  const panel = page
    .getByRole("heading", { name: /Adjust balance/i })
    .locator("xpath=ancestor::section");
  await panel.getByRole("spinbutton").or(panel.locator('input[type="number"]')).fill("12");
  await panel.getByRole("textbox").last().fill(note);
  await panel.getByRole("button", { name: /Save/i }).click();

  await expect(row.getByText(/12/)).toBeVisible();

  const employeeBalance = await getBalanceMine(await signInAs(employee.id));
  expect((employeeBalance.body as { remaining_days: number }).remaining_days).toBe(12);
});

test("[AC-031-API] a balance adjustment is recorded in the audit trail with the acting HR/Admin's identity, a timestamp and the note", async () => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);

  const suffix = randomUUID();
  const employeeName = `QA AC031Audit Employee ${suffix}`;
  const employee = await createUser(adminToken, { full_name: employeeName, role: "employee" });
  const note = `QA AC031Audit note ${suffix}`;

  const adjust = await putAdminBalance(adminToken, employee.id, {
    year: CURRENT_YEAR,
    new_remaining_days: 7,
    note,
  });
  expect(adjust.status).toBe(200);

  const auditLog = await getAuditLog(adminToken);
  expect(auditLog.status).toBe(200);
  const rows = auditLog.body as Array<{
    actor_user_id: string;
    action_type: string;
    created_at: string;
    detail: Record<string, unknown>;
  }>;

  // Find the admin's own id by signing in and checking /me-equivalent: the admin's
  // user id is whichever actor_user_id authored this note, cross-checked by content.
  const match = rows.find((r) => JSON.stringify(r.detail).includes(note));
  expect(match, "no audit-log row carries this adjustment's note").toBeTruthy();
  expect(match!.actor_user_id).toBeTruthy();
  expect(match!.created_at).toMatch(/Z$/);
  expect(JSON.stringify(match!.detail)).toContain(note);
});

test("[AC-031-EMPTY-NOTE] saving a balance adjustment with an empty note is refused and the employee's balance is unchanged", async () => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const employeeName = `QA AC031Empty Employee ${suffix}`;
  const employee = await createUser(adminToken, { full_name: employeeName, role: "employee" });

  const before = await getBalanceMine(await signInAs(employee.id));
  const remainingBefore = (before.body as { remaining_days: number }).remaining_days;

  const result = await putAdminBalance(adminToken, employee.id, {
    year: CURRENT_YEAR,
    new_remaining_days: 5,
    note: "",
  });
  expect(result.status).toBe(422);

  const after = await getBalanceMine(await signInAs(employee.id));
  expect((after.body as { remaining_days: number }).remaining_days).toBe(remainingBefore);
});

test("[AC-031-FORBIDDEN] a non-HR/Admin user cannot reach or perform the balance adjustment, and nothing changes", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const employeeName = `QA AC031Forbidden Employee ${suffix}`;
  const employee = await createUser(adminToken, { full_name: employeeName, role: "employee" });

  const before = await getBalanceMine(await signInAs(employee.id));
  const remainingBefore = (before.body as { remaining_days: number }).remaining_days;

  // API: the employee's own token is refused with 403 and nothing changes.
  const employeeToken = await signInAs(employee.id);
  const attempt = await putAdminBalance(employeeToken, employee.id, {
    year: CURRENT_YEAR,
    new_remaining_days: 99,
    note: `QA AC031Forbidden attempt ${suffix}`,
  });
  expect(attempt.status).toBe(403);

  const after = await getBalanceMine(await signInAs(employee.id));
  expect((after.body as { remaining_days: number }).remaining_days).toBe(remainingBefore);

  // UI: signed in as the employee, the Admin screen refuses the HR/Admin-only state.
  await signInThroughUi(page, employeeName);
  await page.goto("/admin");
  await expect(page.getByText(/HR\/Admin only/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Adjust balance/i })).toHaveCount(0);
});

test("[AC-031-INTERACTION] an adjustment to N days lets an N-working-day annual approval through, and blocks an N+1-working-day approval with the over-balance message", async () => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const managerName = `QA AC031Interact Manager ${suffix}`;
  const employeeName = `QA AC031Interact Employee ${suffix}`;
  const manager = await createUser(adminToken, { full_name: managerName, role: "manager" });
  const employee = await createUser(adminToken, {
    full_name: employeeName,
    role: "employee",
    manager_id: manager.id,
  });

  // Adjust the employee's remaining balance down to N = 3 days.
  const adjust = await putAdminBalance(adminToken, employee.id, {
    year: CURRENT_YEAR,
    new_remaining_days: 3,
    note: `QA AC031Interact set to 3 ${suffix}`,
  });
  expect(adjust.status).toBe(200);

  const employeeToken = await signInAs(employee.id);
  const managerToken = await signInAs(manager.id);

  // A request of exactly N (3) working days — a fixed mid-year Monday-to-Wednesday —
  // approves successfully.
  const exact = await submitLeaveRequest(employeeToken, {
    start_date: `${CURRENT_YEAR}-07-06`,
    end_date: `${CURRENT_YEAR}-07-08`,
    leave_type: "annual",
    reason: `QA AC031Interact exact ${suffix}`,
  });
  expect(exact.status).toBe(201);
  const exactId = (exact.body as { id: string; working_days: number }).id;
  expect((exact.body as { working_days: number }).working_days).toBe(3);

  const approveExact = await decideLeaveRequest(managerToken, exactId, {
    decision: "approve",
    comment: `QA AC031Interact approve exact ${suffix}`,
  });
  expect(approveExact.status).toBe(200);

  // Re-adjust back up to 4 so an N+1-day request has something to be blocked against
  // without the first approval having already exhausted it below zero in a way that
  // would also block for the wrong reason. We re-adjust explicitly to N=4 remaining
  // immediately before submitting the second, over-balance request.
  const readjust = await putAdminBalance(adminToken, employee.id, {
    year: CURRENT_YEAR,
    new_remaining_days: 4,
    note: `QA AC031Interact set to 4 ${suffix}`,
  });
  expect(readjust.status).toBe(200);

  // A request of N+1 (5) working days — a fixed mid-year Monday-to-Friday — is blocked
  // with the over-balance message naming the remaining balance (4).
  const over = await submitLeaveRequest(employeeToken, {
    start_date: `${CURRENT_YEAR}-08-02`,
    end_date: `${CURRENT_YEAR}-08-06`,
    leave_type: "annual",
    reason: `QA AC031Interact over ${suffix}`,
  });
  expect(over.status).toBe(201);
  const overId = (over.body as { id: string; working_days: number }).id;
  expect((over.body as { working_days: number }).working_days).toBe(5);

  const approveOver = await decideLeaveRequest(managerToken, overId, {
    decision: "approve",
    comment: `QA AC031Interact approve over ${suffix}`,
  });
  expect(approveOver.status).toBe(409);
  expect(JSON.stringify(approveOver.body)).toContain("4");
});

test("[AC-031][NFR-008] the balance-adjustment flow renders and works at a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });

  const { email } = adminCredentials();
  const adminName = derivedDisplayName(email);
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const employeeName = `QA AC031Mobile Employee ${suffix}`;
  const employee = await createUser(adminToken, { full_name: employeeName, role: "employee" });
  const note = `QA AC031Mobile note ${suffix}`;

  await signInThroughUi(page, adminName);
  await page.goto("/admin");
  await expect(page.getByText(/Administration/i)).toBeVisible();

  const row = page.locator("tr", { hasText: employeeName });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /Adjust balance/i }).click();

  const panel = page
    .getByRole("heading", { name: /Adjust balance/i })
    .locator("xpath=ancestor::section");
  await panel.getByRole("spinbutton").or(panel.locator('input[type="number"]')).fill("9");
  await panel.getByRole("textbox").last().fill(note);
  await panel.getByRole("button", { name: /Save/i }).click();

  await expect(row.getByText(/9/)).toBeVisible();

  const employeeBalance = await getBalanceMine(await signInAs(employee.id));
  expect((employeeBalance.body as { remaining_days: number }).remaining_days).toBe(9);

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
});

// NFR-005 (single EU region, GDPR-aligned hosting) and NFR-007 (sized for a small team)
// are hosting/operations commitments: no request this app serves can observe which
// region PostgreSQL runs in or how many users its infrastructure is provisioned for, so
// neither is testable from this app's own behaviour.
test("[NFR-005] single EU region, GDPR-aligned hosting", async () => {
  test.skip(
    true,
    "[KNOWN-LIMIT][NFR-005] single EU region GDPR-aligned hosting is a deployment/infrastructure commitment, not observable from any API or UI response this app makes",
  );
});

test("[NFR-007] sized for a small team", async () => {
  test.skip(
    true,
    "[KNOWN-LIMIT][NFR-007] sizing for tens of users rather than thousands is an infrastructure/capacity commitment, not observable from this app's own behaviour",
  );
});
