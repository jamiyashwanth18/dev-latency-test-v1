import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SignIn from "./SignIn";
import { clearSessionToken, getSessionToken } from "@/lib/api";

const ACTIVE_USERS = [
  { id: "u-1", full_name: "Amara Bello", role: "employee" },
  { id: "u-2", full_name: "Priya Raghunathan", role: "manager" },
];

function mockFetchSequence(responses: Array<{ status: number; body: unknown }>) {
  let call = 0;
  return vi.fn().mockImplementation(() => {
    const r = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return Promise.resolve({
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      statusText: "",
      clone() {
        return this;
      },
      json: async () => r.body,
    });
  });
}

function renderSignIn(onSignedIn = vi.fn()) {
  render(
    <MemoryRouter initialEntries={["/sign-in"]}>
      <SignIn onSignedIn={onSignedIn} />
    </MemoryRouter>,
  );
  return onSignedIn;
}

describe("SignIn", () => {
  beforeEach(() => {
    clearSessionToken();
  });

  afterEach(() => {
    clearSessionToken();
    vi.unstubAllGlobals();
  });

  it("[AC-001] loads and renders the real active users from GET /users/active", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: ACTIVE_USERS }]));
    renderSignIn();

    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
    expect(await screen.findByText("Amara Bello")).toBeInTheDocument();
    expect(screen.getByText("Priya Raghunathan")).toBeInTheDocument();
  });

  it("[AC-001] selecting an identity calls POST /sessions and stores the returned token", async () => {
    const sessionResponse = {
      token: "a-very-long-opaque-token-value-1234567890",
      user: { id: "u-1", full_name: "Amara Bello", role: "employee" },
      expires_at: "2026-11-19T10:00:00Z",
    };
    vi.stubGlobal(
      "fetch",
      mockFetchSequence([
        { status: 200, body: ACTIVE_USERS },
        { status: 201, body: sessionResponse },
      ]),
    );
    const onSignedIn = renderSignIn();

    const button = await screen.findByText("Amara Bello");
    fireEvent.click(button);

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith(sessionResponse.user));
    expect(getSessionToken()).toBe(sessionResponse.token);
  });

  it("[AC-001] a 404 sign-in error shows 'that user can no longer sign in'", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchSequence([
        { status: 200, body: ACTIVE_USERS },
        { status: 404, body: { detail: "User not found" } },
      ]),
    );
    const onSignedIn = renderSignIn();

    const button = await screen.findByText("Amara Bello");
    fireEvent.click(button);

    expect(await screen.findByText(/that user can no longer sign in/i)).toBeInTheDocument();
    expect(onSignedIn).not.toHaveBeenCalled();
    expect(getSessionToken()).toBeNull();
  });

  it("shows an empty state when the user list comes back empty", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: [] }]));
    renderSignIn();

    expect(await screen.findByText("No active users yet")).toBeInTheDocument();
  });

  it("shows an error state when the user list fails to load", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 500, body: { detail: "boom" } }]));
    renderSignIn();

    expect(await screen.findByText("Could not load active users")).toBeInTheDocument();
  });
});
