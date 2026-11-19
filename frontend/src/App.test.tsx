import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { clearSessionToken, getSessionToken, setSessionToken } from "@/lib/api";

describe("App", () => {
  beforeEach(() => {
    setSessionToken("test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "u-1",
          full_name: "Jamie Rivers",
          role: "employee",
          manager_id: null,
          is_active: true,
        }),
      }),
    );
  });

  afterEach(() => {
    clearSessionToken();
    vi.unstubAllGlobals();
  });

  it("renders a screen inside the app shell and shows its menu", async () => {
    render(
      <MemoryRouter initialEntries={["/my-leave"]}>
        <App />
      </MemoryRouter>,
    );
    // getAllByText, not getByText: the page may repeat its menu item's text.
    expect((await screen.findAllByText("My Leave")).length).toBeGreaterThan(0);
  });

  it("sign-out calls DELETE /sessions/current, clears the token and returns to sign-in", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string, init?: RequestInit) => {
        if (init?.method === "DELETE") {
          return Promise.resolve({ ok: true, status: 204, json: async () => undefined });
        }
        if (url.includes("/users/active") || url.includes("/leave-requests/mine")) {
          return Promise.resolve({ ok: true, status: 200, json: async () => [] });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            id: "u-1",
            full_name: "Jamie Rivers",
            role: "employee",
            manager_id: null,
            is_active: true,
          }),
        });
      }),
    );

    render(
      <MemoryRouter initialEntries={["/my-leave"]}>
        <App />
      </MemoryRouter>,
    );

    const signOut = await screen.findByText("Sign out");
    fireEvent.click(signOut);

    await screen.findByText("Choose Your Identity", { exact: false });
    expect(getSessionToken()).toBeNull();
  });
});
