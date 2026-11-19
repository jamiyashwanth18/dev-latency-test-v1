import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import GettingStarted from "./GettingStarted";

function renderScreen() {
  render(
    <MemoryRouter initialEntries={["/getting-started"]}>
      <GettingStarted />
    </MemoryRouter>,
  );
}

describe("GettingStarted", () => {
  it("[AC-040] covers all four topics: identity, submitting leave, approving requests and HR administration", () => {
    renderScreen();

    expect(screen.getByText("Pick your identity")).toBeInTheDocument();
    expect(screen.getByText("Submit leave")).toBeInTheDocument();
    expect(screen.getByText("Approve as a manager")).toBeInTheDocument();
    expect(screen.getByText("Administer as HR/Admin")).toBeInTheDocument();
  });

  it("[AC-040] the Everyone tab marks every card as applying", () => {
    renderScreen();

    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getAllByText("Applies to you")).toHaveLength(4);
    expect(within(panel).queryByText("For reference")).not.toBeInTheDocument();
  });

  it("[AC-040] filtering by the Manager tab marks submit-leave and HR administration for reference, and keeps approving as applying", () => {
    renderScreen();

    fireEvent.click(screen.getByRole("tab", { name: "Manager" }));

    const panel = screen.getByRole("tabpanel");
    const submitCard = within(panel).getByText("Submit leave").closest("article")!;
    const approveCard = within(panel).getByText("Approve as a manager").closest("article")!;
    const adminCard = within(panel).getByText("Administer as HR/Admin").closest("article")!;

    expect(within(submitCard).getByText("For reference")).toBeInTheDocument();
    expect(within(approveCard).getByText("Applies to you")).toBeInTheDocument();
    expect(within(adminCard).getByText("For reference")).toBeInTheDocument();
  });

  it("[AC-040] filtering by the Employee tab marks approving and HR administration for reference", () => {
    renderScreen();

    fireEvent.click(screen.getByRole("tab", { name: "Employee" }));

    const panel = screen.getByRole("tabpanel");
    const approveCard = within(panel).getByText("Approve as a manager").closest("article")!;
    const adminCard = within(panel).getByText("Administer as HR/Admin").closest("article")!;
    const submitCard = within(panel).getByText("Submit leave").closest("article")!;

    expect(within(approveCard).getByText("For reference")).toBeInTheDocument();
    expect(within(adminCard).getByText("For reference")).toBeInTheDocument();
    expect(within(submitCard).getByText("Applies to you")).toBeInTheDocument();
  });

  it("[AC-040] filtering by the HR/Admin tab marks submit-leave and approving for reference, and keeps administration as applying", () => {
    renderScreen();

    fireEvent.click(screen.getByRole("tab", { name: "HR/Admin" }));

    const panel = screen.getByRole("tabpanel");
    const submitCard = within(panel).getByText("Submit leave").closest("article")!;
    const approveCard = within(panel).getByText("Approve as a manager").closest("article")!;
    const adminCard = within(panel).getByText("Administer as HR/Admin").closest("article")!;

    expect(within(submitCard).getByText("For reference")).toBeInTheDocument();
    expect(within(approveCard).getByText("For reference")).toBeInTheDocument();
    expect(within(adminCard).getByText("Applies to you")).toBeInTheDocument();
  });

  it("[AC-041] any credential example uses the <set-at-first-login> placeholder and no real secret value", () => {
    renderScreen();

    expect(screen.getByText("<set-at-first-login>")).toBeInTheDocument();
    expect(screen.queryByText(/@.+\.(com|ai|io|org)/i)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/password\s*[:=]\s*\S+/i);
  });
});
