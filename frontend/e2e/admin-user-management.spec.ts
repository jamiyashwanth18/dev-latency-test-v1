import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import {
  createUser,
  deactivateUser,
  derivedDisplayName,
  getMeStatus,
  getPending,
  setManager,
  signInAs,
  signInAsAdmin,
  trySignIn,
} from "./support/api";

// [US-014-3] Admin user management, deactivation session-kill and reporting-line routing.
//
// The Admin, My Leave and Approvals screens currently render fixed seed data and do not
// yet call the real API (see the comment on API_BASE_URL in frontend/src/lib/api.ts), so
// the UI-journey tests below are written against the contract and are expected to fail
// until those screens are wired up. The sign-in screen is already wired, so it drives
// every real session in these tests.

async function signInThroughUi(page: import("@playwright/test").Page, name: string) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Choose Your Identity/i })).toBeVisible();
  await page.getByPlaceholder("Name or role").fill(name);
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

test("[AC-028] HR/Admin signs in, adds a user with the Employee role, sees them in the list, deactivates them, and the deactivated user is gone from the sign-in list", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminName = derivedDisplayName(email);
  const name = `QA AC028 Employee ${randomUUID()}`;

  await signInThroughUi(page, adminName);
  await page.goto("/admin");
  await expect(page.getByText(/Administration/i)).toBeVisible();

  await page.getByRole("button", { name: /Add user/i }).click();
  const newRow = page.locator("table tbody tr").first();
  await newRow.locator("input").first().fill(name);
  await newRow.locator("select").first().selectOption("Employee");
  await newRow.getByRole("button", { name: /Create user|Save/i }).click();

  // The row shows the new employee as Active.
  const row = page.locator("tr", { hasText: name });
  await expect(row).toBeVisible();
  await expect(row.getByText(/Active/i)).toBeVisible();

  // The action must really have created a signed-in-able person, per the contract.
  await page.goto("/");
  await page.getByPlaceholder("Name or role").fill(name);
  await expect(page.getByRole("button", { name: new RegExp(name) })).toBeVisible();

  // Deactivate them from the same screen.
  await page.goto("/admin");
  const rowAgain = page.locator("tr", { hasText: name });
  await rowAgain.getByRole("button", { name: /Deactivate/i }).click();
  await page.getByRole("button", { name: /Yes, deactivate/i }).click();
  await expect(rowAgain.getByText(/Deactivated/i)).toBeVisible();

  // Gone from the real sign-in list once the deactivation really reached the API.
  await page.goto("/");
  await page.getByPlaceholder("Name or role").fill(name);
  await expect(page.getByRole("button", { name: new RegExp(name) })).toHaveCount(0);
});

test("[AC-029][NFR-002] deactivating a user through the admin API ends every session they hold and blocks a fresh sign-in", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const name = `QA AC029 Session Kill ${randomUUID()}`;
  const created = await createUser(adminToken, { full_name: name, role: "employee" });

  // Signing in twice: deactivation must end every session they hold (NFR-002), not just
  // the one in use when it happens.
  const tokenA = await signInAs(created.id);
  const tokenB = await signInAs(created.id);
  expect(await getMeStatus(tokenA)).toBe(200);
  expect(await getMeStatus(tokenB)).toBe(200);

  await deactivateUser(adminToken, created.id);

  expect(await getMeStatus(tokenA)).toBe(401);
  expect(await getMeStatus(tokenB)).toBe(401);
  expect(await trySignIn(created.id)).toBe(404);

  // Also gone from the identity picker in the UI itself.
  await page.goto("/");
  await page.getByPlaceholder("Name or role").fill(name);
  await expect(page.getByRole("button", { name: new RegExp(name) })).toHaveCount(0);
});

test("[AC-030] a submitted request routes only to the employee's own manager's pending queue, and reassigning moves future requests", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const managerM = await createUser(adminToken, {
    full_name: `QA AC030 Manager M ${suffix}`,
    role: "manager",
  });
  const managerN = await createUser(adminToken, {
    full_name: `QA AC030 Manager N ${suffix}`,
    role: "manager",
  });
  const employeeE = await createUser(adminToken, {
    full_name: `QA AC030 Employee E ${suffix}`,
    role: "employee",
    manager_id: managerM.id,
  });
  const employeeName = employeeE.full_name;

  // The employee submits a request through the real UI, not the API: this is the user
  // journey the criterion describes.
  await signInThroughUi(page, employeeName);
  await page.goto("/my-leave");
  await page.locator("#start_date").fill("2027-03-01");
  await page.locator("#end_date").fill("2027-03-02");
  await page.locator("#leave_type").selectOption("annual");
  await page.locator("#reason").fill(`QA AC030 reason ${suffix}`);
  await page.getByRole("button", { name: /Submit request/i }).click();
  await expect(page.getByText(/Filed as/i)).toBeVisible();

  const tokenM = await signInAs(managerM.id);
  const tokenN = await signInAs(managerN.id);

  const pendingM = await getPending(tokenM);
  const pendingN = await getPending(tokenN);

  expect(JSON.stringify(pendingM.body)).toContain(employeeName);
  expect(JSON.stringify(pendingN.body)).not.toContain(employeeName);

  // Reassign E to N: future pending requests should route to N instead.
  await setManager(adminToken, employeeE.id, managerN.id);

  await page.goto("/my-leave");
  await page.locator("#start_date").fill("2027-04-05");
  await page.locator("#end_date").fill("2027-04-06");
  await page.locator("#leave_type").selectOption("annual");
  await page.locator("#reason").fill(`QA AC030 reassigned reason ${suffix}`);
  await page.getByRole("button", { name: /Submit request/i }).click();
  await expect(page.getByText(/Filed as/i)).toBeVisible();

  const pendingNAfter = await getPending(tokenN);
  expect(JSON.stringify(pendingNAfter.body)).toContain(employeeName);
});
