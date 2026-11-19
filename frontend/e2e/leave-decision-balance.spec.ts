import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import { createUser, decideLeaveRequest, getMine, signInAs, signInAsAdmin } from "./support/api";

// [US-007-3] Employee dashboard: request statuses after a manager decision, and the
// annual balance rules. The decision itself is a manager action with no wired screen
// yet (Approvals.tsx is still static sample data), so it is taken through the real
// decision API while the employee's own journey (submit, see Pending, reload to see
// the decided status and comment) happens on screen, per the contract.

async function signInThroughUi(page: import("@playwright/test").Page, name: string) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Choose Your Identity/i })).toBeVisible();
  await page.getByPlaceholder("Name or role").fill(name);
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

test("[AC-014][AC-015] an employee's request shows Pending with its dates, type and working days, then Approved with the manager's comment after a decision, and offers no way to resubmit it", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const managerName = `QA AC014 Manager ${suffix}`;
  const employeeName = `QA AC014 Employee ${suffix}`;
  const manager = await createUser(adminToken, { full_name: managerName, role: "manager" });
  const employee = await createUser(adminToken, {
    full_name: employeeName,
    role: "employee",
    manager_id: manager.id,
  });

  await signInThroughUi(page, employeeName);
  await page.goto("/my-leave");
  await page.locator("#start_date").fill("2027-05-03");
  await page.locator("#end_date").fill("2027-05-04");
  await page.locator("#leave_type").selectOption("annual");
  await page.locator("#reason").fill(`QA AC014 reason ${suffix}`);
  await page.getByRole("button", { name: /Submit request/i }).click();
  await expect(page.getByText(/Filed/i)).toBeVisible();

  const row = page.locator("table tbody tr", { hasText: "2027-05-03" });
  await expect(row).toBeVisible();
  await expect(row.getByText(/Annual/i)).toBeVisible();
  await expect(row.getByText(/Pending/i)).toBeVisible();
  await expect(row.locator("td").nth(2)).toHaveText("2", { exact: true });

  const mineBeforeDecision = await getMine(await signInAs(employee.id));
  const requestId = (mineBeforeDecision.body as Array<{ id: string }>)[0]?.id;
  expect(
    requestId,
    "GET /leave-requests/mine returned no row for the submitted request",
  ).toBeTruthy();

  const managerToken = await signInAs(manager.id);
  const comment = `QA AC014 approved — cover arranged ${suffix}`;
  const decision = await decideLeaveRequest(managerToken, requestId!, {
    decision: "approve",
    comment,
  });
  expect(
    decision.status,
    `POST /leave-requests/${requestId}/decision returned ${decision.status}: ${JSON.stringify(decision.body)}`,
  ).toBe(200);

  // Reloading My Leave as the employee must show the decided status and comment: no
  // separate "decide" call changes what the employee's own list endpoint returns.
  await page.reload();
  const decidedRow = page.locator("table tbody tr", { hasText: "2027-05-03" });
  await expect(decidedRow).toBeVisible();
  await expect(decidedRow.getByText(/Approved/i)).toBeVisible();
  await expect(decidedRow.getByText(comment)).toBeVisible();

  // No resubmission: the decided row offers no edit or resubmit action, it is a
  // read-only historical record once decided.
  await expect(decidedRow.getByRole("button", { name: /resubmit|edit/i })).toHaveCount(0);
});

test("[AC-015] a rejected request shows Rejected with the manager's comment after reloading", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const managerName = `QA AC015 Manager ${suffix}`;
  const employeeName = `QA AC015 Employee ${suffix}`;
  const manager = await createUser(adminToken, { full_name: managerName, role: "manager" });
  const employee = await createUser(adminToken, {
    full_name: employeeName,
    role: "employee",
    manager_id: manager.id,
  });

  await signInThroughUi(page, employeeName);
  await page.goto("/my-leave");
  await page.locator("#start_date").fill("2027-06-07");
  await page.locator("#end_date").fill("2027-06-08");
  await page.locator("#leave_type").selectOption("annual");
  await page.locator("#reason").fill(`QA AC015 reason ${suffix}`);
  await page.getByRole("button", { name: /Submit request/i }).click();
  await expect(page.getByText(/Filed/i)).toBeVisible();

  const mine = await getMine(await signInAs(employee.id));
  const requestId = (mine.body as Array<{ id: string }>)[0]?.id;
  expect(requestId).toBeTruthy();

  const managerToken = await signInAs(manager.id);
  const comment = `QA AC015 rejected — team short-staffed that week ${suffix}`;
  const decision = await decideLeaveRequest(managerToken, requestId!, {
    decision: "reject",
    comment,
  });
  expect(decision.status).toBe(200);

  await page.reload();
  const decidedRow = page.locator("table tbody tr", { hasText: "2027-06-07" });
  await expect(decidedRow).toBeVisible();
  await expect(decidedRow.getByText(/Rejected/i)).toBeVisible();
  await expect(decidedRow.getByText(comment)).toBeVisible();
});

test("[AC-016] the balance panel shows a remaining 20 days and drops by the approved annual request's working days", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const managerName = `QA AC016 Manager ${suffix}`;
  const employeeName = `QA AC016 Employee ${suffix}`;
  const manager = await createUser(adminToken, { full_name: managerName, role: "manager" });
  const employee = await createUser(adminToken, {
    full_name: employeeName,
    role: "employee",
    manager_id: manager.id,
  });

  await signInThroughUi(page, employeeName);
  await page.goto("/my-leave");

  // Before any approval: the panel shows the full 20-day allocation.
  await expect(page.getByText(/20/).first()).toBeVisible();

  await page.locator("#start_date").fill("2027-07-05");
  await page.locator("#end_date").fill("2027-07-07");
  await page.locator("#leave_type").selectOption("annual");
  await page.locator("#reason").fill(`QA AC016 reason ${suffix}`);
  await page.getByRole("button", { name: /Submit request/i }).click();
  await expect(page.getByText(/Filed/i)).toBeVisible();

  const mine = await getMine(await signInAs(employee.id));
  const row = (mine.body as Array<{ id: string; working_days: number }>)[0];
  expect(row).toBeTruthy();
  const workingDays = row!.working_days;
  expect(workingDays).toBe(3);

  const managerToken = await signInAs(manager.id);
  const decision = await decideLeaveRequest(managerToken, row!.id, {
    decision: "approve",
    comment: `QA AC016 approved ${suffix}`,
  });
  expect(decision.status).toBe(200);

  await page.reload();
  // The panel must now show 20 - working_days remaining, not the original 20.
  await expect(page.getByText(new RegExp(String(20 - workingDays)))).toBeVisible();
});
