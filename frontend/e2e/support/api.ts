// Minimal HTTP helpers for e2e setup: sign in as the seeded admin, then create and
// deactivate users through the admin API, exactly as the contract requires. Never talk to
// the database directly.

const API_BASE_URL = process.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export interface ActiveUser {
  id: string;
  full_name: string;
  role: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<{ status: number; body: T }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  const body = (text ? JSON.parse(text) : undefined) as T;
  return { status: response.status, body };
}

// Mirrors backend/app/seed.py's `_display_name`: the admin has no password-based
// sign-in in this app, so this is how a test finds the seeded admin's identity-picker
// row from only the email the platform gave it.
export function derivedDisplayName(email: string): string {
  const localPart = email.split("@", 1)[0] ?? email;
  const words = localPart.replace(/[._]/g, " ").split(/\s+/).filter(Boolean);
  const name = words.map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  return name.slice(0, 200) || email.slice(0, 200);
}

// Signs in as the platform's seeded HR/Admin through the real POST /sessions endpoint
// (no password: this product signs in by picking an identity) and returns its bearer token.
export async function signInAsAdmin(adminEmail: string): Promise<string> {
  const { status, body } = await request<ActiveUser[]>("/users/active");
  if (status !== 200) {
    throw new Error(`GET /users/active returned ${status}`);
  }
  const displayName = derivedDisplayName(adminEmail);
  const admin = body.find((u) => u.full_name === displayName);
  if (!admin) {
    throw new Error(
      `No active user named "${displayName}" (derived from ${adminEmail}) was found via /users/active.`,
    );
  }
  const session = await request<{ token: string }>("/sessions", {
    method: "POST",
    body: JSON.stringify({ user_id: admin.id }),
  });
  if (session.status !== 201) {
    throw new Error(`POST /sessions for the admin returned ${session.status}`);
  }
  return session.body.token;
}

export async function createUser(
  adminToken: string,
  payload: { full_name: string; role: string; manager_id?: string | null },
): Promise<{ id: string; full_name: string; role: string }> {
  const { status, body } = await request<{ id: string; full_name: string; role: string }>(
    "/admin/users",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(payload),
    },
  );
  if (status !== 201) {
    throw new Error(`POST /admin/users returned ${status}: ${JSON.stringify(body)}`);
  }
  return body;
}

export async function deactivateUser(adminToken: string, userId: string): Promise<void> {
  const { status, body } = await request(`/admin/users/${userId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ is_active: false }),
  });
  if (status !== 200 && status !== 204) {
    throw new Error(`PATCH /admin/users/${userId} returned ${status}: ${JSON.stringify(body)}`);
  }
}

// Sets (or clears, with null) the reporting manager of a user: used to set up and to
// change reporting lines for the routing tests, through the real admin API.
export async function setManager(
  adminToken: string,
  userId: string,
  managerId: string | null,
): Promise<void> {
  const { status, body } = await request(`/admin/users/${userId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ manager_id: managerId }),
  });
  if (status !== 200 && status !== 204) {
    throw new Error(`PATCH /admin/users/${userId} returned ${status}: ${JSON.stringify(body)}`);
  }
}

// Signs in as any active user by id, through the real POST /sessions endpoint, and
// returns the bearer token. Used to hold a session for an employee or manager created
// in a test so the test can call authenticated endpoints as them.
export async function signInAs(userId: string): Promise<string> {
  const session = await request<{ token: string }>("/sessions", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
  if (session.status !== 201) {
    throw new Error(`POST /sessions for ${userId} returned ${session.status}`);
  }
  return session.body.token;
}

// GET /me with a bearer token: used to confirm a token is accepted (200) or rejected
// (401) without importing any application module.
export async function getMeStatus(token: string): Promise<number> {
  const { status } = await request("/me", { headers: { Authorization: `Bearer ${token}` } });
  return status;
}

// POST /sessions with a raw user_id: used to confirm sign-in is refused (404) for a
// deactivated user without throwing on the non-2xx status.
export async function trySignIn(userId: string): Promise<number> {
  const { status } = await request("/sessions", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
  return status;
}

// GET /leave-requests/pending as a given bearer token: used to check which manager's
// queue a submitted request routes into.
export async function getPending(token: string): Promise<{ status: number; body: unknown }> {
  return request("/leave-requests/pending", { headers: { Authorization: `Bearer ${token}` } });
}

// POST /leave-requests/{id}/decision as a manager or HR/Admin bearer token: approves or
// rejects a direct report's pending request with a comment, per the contract.
export async function decideLeaveRequest(
  managerToken: string,
  requestId: string,
  payload: { decision: "approve" | "reject"; comment: string },
): Promise<{ status: number; body: unknown }> {
  return request(`/leave-requests/${requestId}/decision`, {
    method: "POST",
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify(payload),
  });
}

// GET /leave-requests/mine as a given bearer token: used to read back a request's
// status, comment and other fields after a decision, without relying on the UI.
export async function getMine(token: string): Promise<{ status: number; body: unknown }> {
  return request("/leave-requests/mine", { headers: { Authorization: `Bearer ${token}` } });
}

// GET /balances/mine as a given bearer token: the acting employee's current-year
// annual balance, per the contract.
export async function getBalanceMine(token: string): Promise<{ status: number; body: unknown }> {
  return request("/balances/mine", { headers: { Authorization: `Bearer ${token}` } });
}

// PUT /admin/users/{id}/balance as an HR/Admin bearer token: sets a new remaining
// balance for the given year with a note, per the contract.
export async function putAdminBalance(
  adminToken: string,
  userId: string,
  payload: { year: number; new_remaining_days: number; note: string },
): Promise<{ status: number; body: unknown }> {
  return request(`/admin/users/${userId}/balance`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(payload),
  });
}
