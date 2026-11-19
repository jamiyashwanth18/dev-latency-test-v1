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
  const words = localPart
    .replace(/[._]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
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
