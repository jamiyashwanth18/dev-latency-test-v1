import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { adminCredentials } from "./support/admin";
import { createUser, deactivateUser, signInAsAdmin } from "./support/api";

// [AC][US-001-3] Identity selection and session lifecycle, end to end through the UI.
test("[AC-US-001-3-a] no session shows the identity list; picking a name starts a session and lands in the app; signing out returns to the identity list and the protected view is no longer reachable", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const name = `QA Identity E2E ${randomUUID()}`;
  await createUser(adminToken, { full_name: name, role: "employee" });

  // No session: landing on "/" shows the identity list, not the app.
  await page.goto("/");
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: /Choose Your Identity/i })).toBeVisible();

  // Pick the identity: search narrows the list, clicking the row starts a session.
  await page.getByPlaceholder("Name or role").fill(name);
  await page.getByRole("button", { name: new RegExp(name) }).click();

  // Signed in: the app shell is reachable and shows this identity.
  await expect(page).toHaveURL(/\/my-leave$/);
  await expect(page.getByText(name, { exact: false })).toBeVisible();

  // Sign out: back to the identity list.
  await page.getByRole("button", { name: /Sign out/i }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: /Choose Your Identity/i })).toBeVisible();

  // The protected view is no longer reachable: navigating straight to it bounces back.
  await page.goto("/my-leave");
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: /Choose Your Identity/i })).toBeVisible();
});

// [AC][US-001-3] A deactivated user drops out of the sign-in list.
test("[AC-US-001-3-b] a user deactivated through the admin API no longer appears in the sign-in list after a reload", async ({
  page,
}) => {
  const { email } = adminCredentials();
  const adminToken = await signInAsAdmin(email);
  const name = `QA Deactivate E2E ${randomUUID()}`;
  const created = await createUser(adminToken, { full_name: name, role: "employee" });

  await page.goto("/");
  await page.getByPlaceholder("Name or role").fill(name);
  await expect(page.getByRole("button", { name: new RegExp(name) })).toBeVisible();

  await deactivateUser(adminToken, created.id);

  await page.reload();
  await page.getByPlaceholder("Name or role").fill(name);
  await expect(page.getByRole("button", { name: new RegExp(name) })).toHaveCount(0);
});
