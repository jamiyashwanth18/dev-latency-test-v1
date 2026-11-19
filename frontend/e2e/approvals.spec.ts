import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import { createUser, getPending, signInAs, signInAsAdmin } from "./support/api";

// [US-009-3] Manager approvals flow, the direct-report boundary and the overlap flag,
// through the real UI (Approvals screen). Employees submit through My Leave on screen;
// the manager's decision is taken on the Approvals screen itself, per the contract.

async function signInThroughUi(page: import("@playwright/test").Page, name: string) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Choose Your Identity/i })).toBeVisible();
  await page.getByPlaceholder("Name or role").fill(name);
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

test("[AC-019] a manager opens Approvals and sees a direct report's pending request with employee, dates, type, working days, reason, remaining balance and overlap flag, then approves it with a comment and the row clears", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const managerName = `QA AC019 Manager ${suffix}`;
  const employeeName = `QA AC019 Employee ${suffix}`;
  const manager = await createUser(adminToken, { full_name: managerName, role: "manager" });
  await createUser(adminToken, {
    full_name: employeeName,
    role: "employee",
    manager_id: manager.id,
  });

  const reason = `QA AC019 reason ${suffix}`;
  await signInThroughUi(page, employeeName);
  await page.goto("/my-leave");
  await page.locator("#start_date").fill("2027-08-02");
  await page.locator("#end_date").fill("2027-08-03");
  await page.locator("#leave_type").selectOption("annual");
  await page.locator("#reason").fill(reason);
  await page.getByRole("button", { name: /Submit request/i }).click();
  await expect(page.getByText(/Filed/i)).toBeVisible();

  await page.getByRole("button", { name: /Sign out/i }).click();
  await signInThroughUi(page, managerName);
  await page.goto("/approvals");

  const row = page.locator("table tbody tr", { hasText: employeeName });
  await expect(row).toBeVisible();
  await expect(row.getByText("2027-08-02", { exact: false })).toBeVisible();
  await expect(row.getByText(/Annual/i)).toBeVisible();
  await expect(row.getByText("2", { exact: true })).toBeVisible();
  await expect(row.getByText(reason)).toBeVisible();
  // Remaining balance and overlap flag are both rendered somewhere in the row.
  await expect(row.getByText(/\d+\s*\/\s*20 days/i)).toBeVisible();
  await expect(row.getByText(/Overlap|None/i)).toBeVisible();

  await row.getByRole("button", { name: /Decide/i }).click();

  const panel = page.getByRole("heading", { name: /Decide:/i }).locator("xpath=ancestor::section");
  const comment = `QA AC019 approved ${suffix}`;
  await panel.getByRole("textbox").first().fill(comment);
  await panel.getByRole("button", { name: /Approve/i }).click();

  await expect(page.locator("table tbody tr", { hasText: employeeName })).toHaveCount(0);
});

test("[AC-020] a second employee reporting to another manager has a pending request that never appears in the first manager's queue", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const managerAName = `QA AC020 Manager A ${suffix}`;
  const managerBName = `QA AC020 Manager B ${suffix}`;
  const employeeBName = `QA AC020 Employee B ${suffix}`;
  const managerA = await createUser(adminToken, { full_name: managerAName, role: "manager" });
  const managerB = await createUser(adminToken, { full_name: managerBName, role: "manager" });
  await createUser(adminToken, {
    full_name: employeeBName,
    role: "employee",
    manager_id: managerB.id,
  });

  await signInThroughUi(page, employeeBName);
  await page.goto("/my-leave");
  await page.locator("#start_date").fill("2027-09-06");
  await page.locator("#end_date").fill("2027-09-07");
  await page.locator("#leave_type").selectOption("annual");
  await page.locator("#reason").fill(`QA AC020 reason ${suffix}`);
  await page.getByRole("button", { name: /Submit request/i }).click();
  await expect(page.getByText(/Filed/i)).toBeVisible();

  // API-level confirmation: manager A's pending queue never contains employee B.
  const tokenA = await signInAs(managerA.id);
  const pendingA = await getPending(tokenA);
  expect(JSON.stringify(pendingA.body)).not.toContain(employeeBName);

  // UI-level confirmation: manager A's Approvals screen shows no such row either.
  await page.getByRole("button", { name: /Sign out/i }).click();
  await signInThroughUi(page, managerAName);
  await page.goto("/approvals");
  await expect(page.locator("table tbody tr", { hasText: employeeBName })).toHaveCount(0);
});
