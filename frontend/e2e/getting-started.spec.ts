import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import { createUser, signInAsAdmin } from "./support/api";

// [US-021-2] Getting-started guidance: reachable from the nav, role-appropriate, and
// free of any real credential — every example uses a placeholder instead.

async function signInThroughUi(page: import("@playwright/test").Page, name: string) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Choose Your Identity/i })).toBeVisible();
  await page.getByPlaceholder("Name or role").fill(name);
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

test("[AC-040] a signed-in user opens Getting Started from the navigation and finds guidance for selecting an identity, submitting leave, approving requests and HR administration", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const name = `QA AC040 Employee ${randomUUID()}`;
  await createUser(adminToken, { full_name: name, role: "employee" });

  await signInThroughUi(page, name);
  await page.getByRole("link", { name: /Getting Started/i }).click();
  await expect(page).toHaveURL(/\/getting-started$/);
  await expect(page.getByRole("heading", { name: /Getting Started/i })).toBeVisible();

  await expect(page.getByText(/Pick your identity/i)).toBeVisible();
  await expect(page.getByText(/Submit leave/i)).toBeVisible();
  await expect(page.getByText(/Approve as a manager/i)).toBeVisible();
  await expect(page.getByText(/Administer as HR\/Admin/i)).toBeVisible();
});

test("[AC-040] switching the role view marks the guidance that applies to that role", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const name = `QA AC040Role Employee ${randomUUID()}`;
  await createUser(adminToken, { full_name: name, role: "employee" });

  await signInThroughUi(page, name);
  await page.goto("/getting-started");

  // Default "Everyone" view: all four cards apply.
  await expect(page.getByText(/Applies to you/i)).toHaveCount(4);

  // Switch to the Employee role view: only the identity and submit-leave cards apply;
  // approve and administer become "For reference".
  await page.getByRole("tab", { name: /^Employee$/i }).click();
  const employeeApplies = page.getByText(/Applies to you/i);
  await expect(employeeApplies).toHaveCount(2);
  await expect(page.getByText(/For reference/i)).toHaveCount(2);

  const approveCard = page.locator("article", { hasText: "Approve as a manager" });
  await expect(approveCard.getByText(/For reference/i)).toBeVisible();
  const identityCard = page.locator("article", { hasText: "Pick your identity" });
  await expect(identityCard.getByText(/Applies to you/i)).toBeVisible();

  // Switch to Manager: approving applies, administering does not.
  await page.getByRole("tab", { name: /^Manager$/i }).click();
  const approveCardManager = page.locator("article", { hasText: "Approve as a manager" });
  await expect(approveCardManager.getByText(/Applies to you/i)).toBeVisible();
  const adminCardManager = page.locator("article", { hasText: "Administer as HR/Admin" });
  await expect(adminCardManager.getByText(/For reference/i)).toBeVisible();

  // Switch to HR/Admin: administering applies, approving does not.
  await page.getByRole("tab", { name: /HR\/Admin/i }).click();
  const adminCardHr = page.locator("article", { hasText: "Administer as HR/Admin" });
  await expect(adminCardHr.getByText(/Applies to you/i)).toBeVisible();
  const approveCardHr = page.locator("article", { hasText: "Approve as a manager" });
  await expect(approveCardHr.getByText(/For reference/i)).toBeVisible();
});

test("[AC-041] every credential-like example on the page uses a placeholder, never a real password or token", async ({
  page,
}) => {
  const { email, password } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const name = `QA AC041 Employee ${randomUUID()}`;
  await createUser(adminToken, { full_name: name, role: "employee" });

  await signInThroughUi(page, name);
  await page.goto("/getting-started");

  const bodyText = (await page.locator("body").innerText()).toLowerCase();

  // The bootstrap admin's real password — the only real credential this run holds —
  // must never appear on the page.
  expect(bodyText).not.toContain(password.toLowerCase());

  // The current session's bearer token must never be echoed onto the page either.
  const token = await page.evaluate(() => window.localStorage.getItem("session_token") ?? "");
  if (token) {
    expect(bodyText).not.toContain(token.toLowerCase());
  }

  // A placeholder stands in wherever the guide would otherwise show a credential.
  await expect(page.getByText("<set-at-first-login>")).toBeVisible();
});

test("[NFR-008] the Getting Started page renders readably at a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });

  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const name = `QA NFR008 Employee ${randomUUID()}`;
  await createUser(adminToken, { full_name: name, role: "employee" });

  await signInThroughUi(page, name);
  await page.getByRole("link", { name: /Getting Started/i }).click();
  await expect(page).toHaveURL(/\/getting-started$/);

  await expect(page.getByRole("heading", { name: /Getting Started/i })).toBeVisible();
  await expect(page.getByRole("tablist")).toBeVisible();

  // No horizontal scroll at mobile width: content fits within the viewport.
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

  await expect(page.getByText(/Pick your identity/i)).toBeVisible();
});
