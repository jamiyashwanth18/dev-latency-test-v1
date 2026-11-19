import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import { createUser, signInAsAdmin } from "./support/api";

// [US-004-3] Leave submission, validation feedback and whole-working-day counting,
// through the real UI (My Leave screen). Each test builds its own employee through the
// admin API, signed in through the real identity picker, so these are user journeys.

async function signInThroughUi(page: import("@playwright/test").Page, name: string) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Choose Your Identity/i })).toBeVisible();
  await page.getByPlaceholder("Name or role").fill(name);
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

test("[AC-009] an employee signs in, submits a valid annual request and sees it in their list with status Pending", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const employeeName = `QA AC009 Employee ${suffix}`;
  await createUser(adminToken, { full_name: employeeName, role: "employee" });

  await signInThroughUi(page, employeeName);
  await page.goto("/my-leave");

  // No request yet: the empty state is shown, not a table row for this employee.
  await expect(page.getByText(/No leave filed yet/i)).toBeVisible();

  await page.locator("#start_date").fill("2027-03-01");
  await page.locator("#end_date").fill("2027-03-02");
  await page.locator("#leave_type").selectOption("annual");
  await page.locator("#reason").fill(`QA AC009 reason ${suffix}`);
  await page.getByRole("button", { name: /Submit request/i }).click();

  await expect(page.getByText(/Filed/i)).toBeVisible();

  const row = page.locator("table tbody tr", { hasText: "2027-03-01" });
  await expect(row).toBeVisible();
  await expect(row.getByText(/Annual/i)).toBeVisible();
  await expect(row.getByText(/Pending/i)).toBeVisible();
  await expect(row.getByText("2")).toBeVisible();
});

test("[AC-010] submitting with each required field empty in turn creates nothing and shows which field needs completing", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const suffix = randomUUID();
  const employeeName = `QA AC010 Employee ${suffix}`;
  await createUser(adminToken, { full_name: employeeName, role: "employee" });

  await signInThroughUi(page, employeeName);
  await page.goto("/my-leave");
  await expect(page.getByText(/No leave filed yet/i)).toBeVisible();

  async function fillAllExcept(missing: "start_date" | "end_date" | "leave_type" | "reason") {
    if (missing !== "start_date") await page.locator("#start_date").fill("2027-03-01");
    else await page.locator("#start_date").fill("");

    if (missing !== "end_date") await page.locator("#end_date").fill("2027-03-02");
    else await page.locator("#end_date").fill("");

    if (missing !== "leave_type") await page.locator("#leave_type").selectOption("annual");
    else await page.locator("#leave_type").selectOption("");

    if (missing !== "reason") await page.locator("#reason").fill(`QA AC010 reason ${suffix}`);
    else await page.locator("#reason").fill("");
  }

  // Missing start date.
  await fillAllExcept("start_date");
  await page.getByRole("button", { name: /Submit request/i }).click();
  await expect(page.locator("#start_date-error")).toBeVisible();
  await expect(page.getByText(/No leave filed yet/i)).toBeVisible();

  // Missing end date.
  await fillAllExcept("end_date");
  await page.getByRole("button", { name: /Submit request/i }).click();
  await expect(page.locator("#end_date-error")).toBeVisible();
  await expect(page.getByText(/No leave filed yet/i)).toBeVisible();

  // Missing leave type.
  await fillAllExcept("leave_type");
  await page.getByRole("button", { name: /Submit request/i }).click();
  await expect(page.locator("#leave_type-error")).toBeVisible();
  await expect(page.getByText(/No leave filed yet/i)).toBeVisible();

  // Missing (whitespace-equivalent blank) reason.
  await fillAllExcept("reason");
  await page.getByRole("button", { name: /Submit request/i }).click();
  await expect(page.locator("#reason-error")).toBeVisible();
  await expect(page.getByText(/No leave filed yet/i)).toBeVisible();
});
