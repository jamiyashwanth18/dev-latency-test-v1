import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import {
  createUser,
  decideLeaveRequest,
  getBalanceMine,
  getMine,
  getPending,
  putAdminBalance,
  signInAs,
  signInAsAdmin,
} from "./support/api";

// [US-010-3] Approve/reject with a comment, the resulting balance deduction, and the
// over-approval block, driven through the real UI (Approvals, My Leave) and API.
//
// The contract pins balances and adjustments to the *current* UTC year, so every date
// and `year` field here is computed from the current UTC year at run time, never
// authored as a literal year. The Approvals screen opens its decide panel as a plain
// comment box and Approve/Reject buttons beside the row it belongs to (Approvals.tsx):
// there is no "Decide:" heading or wrapping <section>, so the panel is driven by its
// "Comment" label and its buttons, not by locating a heading.

const CURRENT_YEAR = new Date().getUTCFullYear();

// Returns the ISO date of the Monday on or after the given year/month/day, so a test
// can ask for "N working days starting on a Monday" without assuming what weekday any
// particular calendar date falls on this year.
function mondayOnOrAfter(year: number, month: number, day: number): string {
  const d = new Date(Date.UTC(year, month - 1, day));
  const dow = d.getUTCDay();
  const add = (8 - dow) % 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function signInThroughUi(page: import("@playwright/test").Page, name: string) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Choose Your Identity/i })).toBeVisible();
  await page.getByPlaceholder("Name or role").fill(name);
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

async function submitRequest(
  page: import("@playwright/test").Page,
  opts: { start: string; end: string; type: "annual" | "sick"; reason: string },
) {
  await page.goto("/my-leave");
  await page.locator("#start_date").fill(opts.start);
  await page.locator("#end_date").fill(opts.end);
  await page.locator("#leave_type").selectOption(opts.type);
  await page.locator("#reason").fill(opts.reason);
  await page.getByRole("button", { name: /Submit request/i }).click();
  await expect(page.getByText(/Filed/i)).toBeVisible();
}

// The Approvals screen renders the decide panel as a comment box plus Approve/Reject
// buttons directly below the row (no heading, no <section>), opened via that row's own
// "Decide" button. Only one row's panel is open at a time, so once it is open its
// "Comment" label and its buttons are unique on the page.
async function approveOrRejectViaUi(
  page: import("@playwright/test").Page,
  employeeName: string,
  comment: string,
  action: "Approve" | "Reject",
) {
  await page.goto("/approvals");
  const row = page.locator("table tbody tr", { hasText: employeeName });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /Decide/i }).click();
  await page.getByLabel("Comment").fill(comment);
  await page.getByRole("button", { name: new RegExp(`^${action}$`) }).click();
}

test("[AC-021] a manager approves a direct report's annual request with a comment: it clears the queue, shows Approved with the comment on My Leave, and drops the remaining balance by its working days", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const managerName = `QA AC021 Manager ${suffix}`;
  const employeeName = `QA AC021 Employee ${suffix}`;
  const manager = await createUser(adminToken, { full_name: managerName, role: "manager" });
  const employee = await createUser(adminToken, {
    full_name: employeeName,
    role: "employee",
    manager_id: manager.id,
  });

  const start = mondayOnOrAfter(CURRENT_YEAR, 10, 1);
  const end = addDaysIso(start, 2); // Monday through Wednesday: 3 working days.

  await signInThroughUi(page, employeeName);
  await submitRequest(page, {
    start,
    end,
    type: "annual",
    reason: `QA AC021 reason ${suffix}`,
  });

  const mine = await getMine(await signInAs(employee.id));
  const row = (mine.body as Array<{ id: string; working_days: number }>)[0];
  expect(row).toBeTruthy();
  const workingDays = row!.working_days;
  expect(workingDays).toBe(3);

  await page.getByRole("button", { name: /Sign out/i }).click();
  await signInThroughUi(page, managerName);
  const comment = `QA AC021 approved ${suffix}`;
  await approveOrRejectViaUi(page, employeeName, comment, "Approve");

  // The row clears from the pending queue.
  await expect(page.locator("table tbody tr", { hasText: employeeName })).toHaveCount(0);

  // The employee's My Leave shows Approved with the manager's comment.
  await page.getByRole("button", { name: /Sign out/i }).click();
  await signInThroughUi(page, employeeName);
  await page.goto("/my-leave");
  const decidedRow = page.locator("table tbody tr", { hasText: start });
  await expect(decidedRow).toBeVisible();
  await expect(decidedRow.getByText(/Approved/i)).toBeVisible();
  await expect(decidedRow.getByText(comment)).toBeVisible();

  // The remaining balance drops by the request's working days.
  const balance = await getBalanceMine(await signInAs(employee.id));
  expect((balance.body as { remaining_days: number }).remaining_days).toBe(20 - workingDays);
});

test("[AC-022] a manager rejects a pending request with a comment: status becomes Rejected, the comment is visible to the employee, and the remaining balance is unchanged", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const managerName = `QA AC022 Manager ${suffix}`;
  const employeeName = `QA AC022 Employee ${suffix}`;
  const manager = await createUser(adminToken, { full_name: managerName, role: "manager" });
  const employee = await createUser(adminToken, {
    full_name: employeeName,
    role: "employee",
    manager_id: manager.id,
  });

  const start = mondayOnOrAfter(CURRENT_YEAR, 10, 8);
  const end = addDaysIso(start, 1); // Monday and Tuesday: 2 working days.

  await signInThroughUi(page, employeeName);
  await submitRequest(page, {
    start,
    end,
    type: "annual",
    reason: `QA AC022 reason ${suffix}`,
  });

  const balanceBefore = await getBalanceMine(await signInAs(employee.id));
  const remainingBefore = (balanceBefore.body as { remaining_days: number }).remaining_days;

  await page.getByRole("button", { name: /Sign out/i }).click();
  await signInThroughUi(page, managerName);
  const comment = `QA AC022 rejected ${suffix}`;
  await approveOrRejectViaUi(page, employeeName, comment, "Reject");
  await expect(page.locator("table tbody tr", { hasText: employeeName })).toHaveCount(0);

  await page.getByRole("button", { name: /Sign out/i }).click();
  await signInThroughUi(page, employeeName);
  await page.goto("/my-leave");
  const decidedRow = page.locator("table tbody tr", { hasText: start });
  await expect(decidedRow).toBeVisible();
  await expect(decidedRow.getByText(/Rejected/i)).toBeVisible();
  await expect(decidedRow.getByText(comment)).toBeVisible();

  const balanceAfter = await getBalanceMine(await signInAs(employee.id));
  expect((balanceAfter.body as { remaining_days: number }).remaining_days).toBe(remainingBefore);
});

test("[AC-023] approving an annual request longer than the remaining balance is blocked: the UI shows an error naming the remaining balance and the request is still pending afterwards", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const managerName = `QA AC023 Manager ${suffix}`;
  const employeeName = `QA AC023 Employee ${suffix}`;
  const manager = await createUser(adminToken, { full_name: managerName, role: "manager" });
  const employee = await createUser(adminToken, {
    full_name: employeeName,
    role: "employee",
    manager_id: manager.id,
  });

  // Cut the employee's remaining balance down to 1 day, so a 3-working-day request
  // exceeds it.
  await putAdminBalance(adminToken, employee.id, {
    year: CURRENT_YEAR,
    new_remaining_days: 1,
    note: `QA AC023 cut balance ${suffix}`,
  });

  const start = mondayOnOrAfter(CURRENT_YEAR, 10, 15);
  const end = addDaysIso(start, 2); // Monday through Wednesday: 3 working days.

  await signInThroughUi(page, employeeName);
  await submitRequest(page, {
    start,
    end,
    type: "annual",
    reason: `QA AC023 reason ${suffix}`,
  });

  const mine = await getMine(await signInAs(employee.id));
  const row = (mine.body as Array<{ id: string; working_days: number }>)[0];
  expect(row).toBeTruthy();
  expect(row!.working_days).toBe(3);

  await page.getByRole("button", { name: /Sign out/i }).click();
  await signInThroughUi(page, managerName);
  await approveOrRejectViaUi(page, employeeName, `QA AC023 attempt ${suffix}`, "Approve");

  // The error names the remaining balance (1 day).
  await expect(page.getByRole("alert").filter({ hasText: /1/ }).first()).toBeVisible();

  // The row is still in the pending queue.
  await expect(page.locator("table tbody tr", { hasText: employeeName })).toBeVisible();

  const pending = await getPending(await signInAs(manager.id));
  expect(JSON.stringify(pending.body)).toContain(employeeName);

  const mineAfter = await getMine(await signInAs(employee.id));
  const rowAfter = (mineAfter.body as Array<{ id: string; status: string }>)[0];
  expect(rowAfter!.status).toBe("pending");
});

test("[AC-024] approving a sick request succeeds even when the annual balance is zero or negative, and the annual remaining balance is unchanged", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const managerName = `QA AC024 Manager ${suffix}`;
  const employeeName = `QA AC024 Employee ${suffix}`;
  const manager = await createUser(adminToken, { full_name: managerName, role: "manager" });
  const employee = await createUser(adminToken, {
    full_name: employeeName,
    role: "employee",
    manager_id: manager.id,
  });

  // Drive the annual remaining balance negative through an HR adjustment.
  await putAdminBalance(adminToken, employee.id, {
    year: CURRENT_YEAR,
    new_remaining_days: -5,
    note: `QA AC024 negative balance ${suffix}`,
  });

  const start = mondayOnOrAfter(CURRENT_YEAR, 10, 22);
  const end = addDaysIso(start, 1);

  await signInThroughUi(page, employeeName);
  await submitRequest(page, {
    start,
    end,
    type: "sick",
    reason: `QA AC024 reason ${suffix}`,
  });

  await page.getByRole("button", { name: /Sign out/i }).click();
  await signInThroughUi(page, managerName);
  await approveOrRejectViaUi(page, employeeName, `QA AC024 approved ${suffix}`, "Approve");

  // Approval succeeds: the row clears from the pending queue.
  await expect(page.locator("table tbody tr", { hasText: employeeName })).toHaveCount(0);

  const mineAfter = await getMine(await signInAs(employee.id));
  const rowAfter = (mineAfter.body as Array<{ status: string }>)[0];
  expect(rowAfter!.status).toBe("approved");

  // The annual remaining balance is unchanged by the sick approval.
  const balance = await getBalanceMine(await signInAs(employee.id));
  expect((balance.body as { remaining_days: number }).remaining_days).toBe(-5);
});

test("[AC-020] a manager attempting a decision on a request that is not their direct report's is refused and nothing changes", async () => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const ownManagerName = `QA Refusal OwnManager ${suffix}`;
  const otherManagerName = `QA Refusal OtherManager ${suffix}`;
  const employeeName = `QA Refusal Employee ${suffix}`;
  const ownManager = await createUser(adminToken, { full_name: ownManagerName, role: "manager" });
  const otherManager = await createUser(adminToken, {
    full_name: otherManagerName,
    role: "manager",
  });
  const employee = await createUser(adminToken, {
    full_name: employeeName,
    role: "employee",
    manager_id: ownManager.id,
  });

  const start = mondayOnOrAfter(CURRENT_YEAR, 11, 1);
  const end = addDaysIso(start, 1);

  // Submit the request through the API directly: the journey under test is the
  // manager's decision attempt, not the submission.
  const employeeToken = await signInAs(employee.id);
  const submit = await fetch(
    `${process.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"}/leave-requests`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        start_date: start,
        end_date: end,
        leave_type: "annual",
        reason: `QA refusal reason ${suffix}`,
      }),
    },
  );
  expect(submit.status).toBe(201);
  const created = (await submit.json()) as { id: string };

  const otherManagerToken = await signInAs(otherManager.id);
  const decision = await decideLeaveRequest(otherManagerToken, created.id, {
    decision: "approve",
    comment: `QA refusal attempt ${suffix}`,
  });
  expect(decision.status).toBe(403);

  const mineAfter = await getMine(employeeToken);
  const rowAfter = (mineAfter.body as Array<{ id: string; status: string }>).find(
    (r) => r.id === created.id,
  );
  expect(rowAfter!.status).toBe("pending");

  const pendingOwn = await getPending(await signInAs(ownManager.id));
  expect(JSON.stringify(pendingOwn.body)).toContain(employeeName);
});

test("[AC-021][NFR-008] a manager approves a direct report's request with a comment at a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });

  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const managerName = `QA AC021Mobile Manager ${suffix}`;
  const employeeName = `QA AC021Mobile Employee ${suffix}`;
  const manager = await createUser(adminToken, { full_name: managerName, role: "manager" });
  await createUser(adminToken, {
    full_name: employeeName,
    role: "employee",
    manager_id: manager.id,
  });

  const start = mondayOnOrAfter(CURRENT_YEAR, 11, 8);
  const end = addDaysIso(start, 1);

  await signInThroughUi(page, employeeName);
  await submitRequest(page, {
    start,
    end,
    type: "annual",
    reason: `QA AC021Mobile reason ${suffix}`,
  });

  await page.getByRole("button", { name: /Sign out/i }).click();
  await signInThroughUi(page, managerName);
  const comment = `QA AC021Mobile approved ${suffix}`;
  await approveOrRejectViaUi(page, employeeName, comment, "Approve");

  await expect(page.locator("table tbody tr", { hasText: employeeName })).toHaveCount(0);

  // No horizontal scroll at mobile width on the Approvals screen itself.
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
});
