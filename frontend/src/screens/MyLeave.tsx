import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { apiFetch, ApiError, clearSessionToken } from "@/lib/api";

const {
  Button,
  Card,
  CardContent,
  Input,
  Textarea,
  Label,
  Select,
  Badge,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Empty,
} = UI;

const { Check, X, Clock, AlertCircle, CheckCircle } = Icons;

interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  reason: string | null;
  working_days: number;
  status: string;
  has_overlap: boolean;
  manager_comment: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
}

interface Balance {
  year: number;
  allocated_days: number;
  adjustment_days: number;
  approved_annual_days: number;
  remaining_days: number;
}

type ListState = "loading" | "error" | "ready";
type BalanceState = "loading" | "error" | "ready";

type FormState = {
  start_date: string;
  end_date: string;
  leave_type: string;
  reason: string;
};

type Banner = { kind: "success" | "error"; body: string } | null;

const EMPTY_FORM: FormState = { start_date: "", end_date: "", leave_type: "", reason: "" };

function redirectToSignIn() {
  clearSessionToken();
  window.location.href = "/sign-in";
}

// Client-side validation already rejects a missing field, an unknown leave
// type, a whitespace-only reason and an end date before the start date, so
// the only server 422 a validly-filled form can still hit is a weekend-only
// range. Map that one onto its field; anything else falls back to the
// generic banner.
function mapServerError(message: string): { field: keyof FormState; text: string } | null {
  const m = message.toLowerCase();
  if (m.includes("no monday-to-friday day") || m.includes("weekend")) {
    return { field: "end_date", text: "That range has no working day in it — Mon–Fri only." };
  }
  return null;
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function Screen() {
  const ink = brand.primaryColor;
  const cream = brand.backgroundColor;
  const neutral = brand.neutralColor;

  const [listState, setListState] = React.useState<ListState>("loading");
  const [listError, setListError] = React.useState("");
  const [requests, setRequests] = React.useState<LeaveRequest[]>([]);

  const [balanceState, setBalanceState] = React.useState<BalanceState>("loading");
  const [balanceError, setBalanceError] = React.useState("");
  const [balance, setBalance] = React.useState<Balance | null>(null);

  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const [banner, setBanner] = React.useState<Banner>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const loadRequests = React.useCallback(() => {
    setListState("loading");
    setListError("");
    apiFetch<LeaveRequest[]>("/leave-requests/mine")
      .then((data) => {
        setRequests(data);
        setListState("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          redirectToSignIn();
          return;
        }
        setListError(err instanceof Error ? err.message : "Could not load your requests.");
        setListState("error");
      });
  }, []);

  const loadBalance = React.useCallback(() => {
    setBalanceState("loading");
    setBalanceError("");
    apiFetch<Balance>("/balances/mine")
      .then((data) => {
        setBalance(data);
        setBalanceState("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          redirectToSignIn();
          return;
        }
        setBalanceError(err instanceof Error ? err.message : "Could not load your balance.");
        setBalanceState("error");
      });
  }, []);

  React.useEffect(() => {
    loadRequests();
    loadBalance();
  }, [loadRequests, loadBalance]);

  function setField(name: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function validate(): Partial<Record<keyof FormState, string>> {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.start_date) next.start_date = "Pick a start date.";
    if (!form.end_date) next.end_date = "Pick an end date.";
    if (
      form.start_date &&
      form.end_date &&
      !next.start_date &&
      !next.end_date &&
      form.end_date < form.start_date
    ) {
      next.end_date = "End date falls before the start date.";
    }
    if (!form.leave_type) next.leave_type = "Choose annual or sick.";
    if (!form.reason.trim()) next.reason = "Add a reason.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      setBanner({
        kind: "error",
        body:
          Object.keys(next).length === 1
            ? "One field needs completing. Nothing you typed has been lost."
            : `${Object.keys(next).length} fields need completing. Nothing you typed has been lost.`,
      });
      return;
    }

    setErrors({});
    setBanner(null);
    setSubmitting(true);
    try {
      const created = await apiFetch<LeaveRequest>("/leave-requests", {
        method: "POST",
        body: JSON.stringify({
          start_date: form.start_date,
          end_date: form.end_date,
          leave_type: form.leave_type,
          reason: form.reason.trim(),
        }),
      });
      setRequests((prev) => [created, ...prev]);
      setBanner({
        kind: "success",
        body: `Filed · ${created.working_days} working day${created.working_days === 1 ? "" : "s"} · status ${statusLabel(created.status)}.`,
      });
      setForm(EMPTY_FORM);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        redirectToSignIn();
        return;
      }
      if (err instanceof ApiError && err.status === 422) {
        const mapped = mapServerError(err.message);
        if (mapped) {
          setErrors({ [mapped.field]: mapped.text });
          setBanner({ kind: "error", body: "Not filed yet — see the field below." });
        } else {
          setBanner({ kind: "error", body: err.message || "Could not file that request." });
        }
      } else {
        setBanner({
          kind: "error",
          body: err instanceof Error ? err.message : "Could not file that request. Try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const hardBox = {
    border: `3px solid ${ink}`,
    borderRadius: 0,
    boxShadow: `6px 6px 0 ${ink}`,
    backgroundColor: cream,
  };

  function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;
    return (
      <p
        id={id}
        role="alert"
        className="mt-2 flex items-start gap-2 text-xs"
        style={{ color: ink }}
      >
        <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 mt-[1px]" />
        <span>{message}</span>
      </p>
    );
  }

  function StatusBadge({ status }: { status: string }) {
    if (status === "approved") {
      return (
        <Badge
          className="inline-flex items-center gap-1"
          style={{ backgroundColor: ink, color: cream }}
        >
          <Check aria-hidden="true" className="h-3 w-3" />
          Approved
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge className="inline-flex items-center gap-1">
          <X aria-hidden="true" className="h-3 w-3" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className="inline-flex items-center gap-1">
        <Clock aria-hidden="true" className="h-3 w-3" />
        Pending
      </Badge>
    );
  }

  return (
    <div
      style={{ backgroundColor: cream, color: ink, fontFamily: brand.fontBody }}
      className="w-full"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-10">
        <header className="mb-10">
          <h1 className="text-[40px]" style={{ fontFamily: brand.fontHeading }}>
            My Leave
          </h1>
          <p className="mt-2 text-sm" style={{ color: neutral }}>
            Request leave and track your own requests. Length is counted server-side, Monday to
            Friday, in whole working days.
          </p>
        </header>

        <section aria-labelledby="balance-heading" className="mb-12">
          <h2
            id="balance-heading"
            className="text-2xl mb-4"
            style={{ fontFamily: brand.fontHeading }}
          >
            Annual balance
          </h2>
          {balanceState === "loading" ? (
            <p role="status">Loading your balance…</p>
          ) : balanceState === "error" ? (
            <Empty
              title="Could not load your balance"
              description={balanceError}
              action={
                <Button type="button" onClick={loadBalance}>
                  Try again
                </Button>
              }
            />
          ) : balance ? (
            <Card style={hardBox} className="p-6 sm:p-8">
              <CardContent className="p-0">
                <p className="text-xs uppercase tracking-wide" style={{ color: neutral }}>
                  Balance for {balance.year}
                </p>
                <p className="mt-2 text-3xl" style={{ fontFamily: brand.fontHeading }}>
                  {balance.remaining_days} of {balance.allocated_days}
                </p>
                <p className="mt-2 text-sm" style={{ color: neutral }}>
                  {balance.adjustment_days !== 0
                    ? `Includes an HR adjustment of ${
                        balance.adjustment_days > 0 ? "+" : ""
                      }${balance.adjustment_days} days. `
                    : ""}
                  Sick leave is tracked separately and never reduces this figure.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </section>

        <form onSubmit={handleSubmit} noValidate className="mb-12">
          <Card style={hardBox} className="p-6 sm:p-8">
            <CardContent className="p-0">
              <h2 className="text-2xl mb-6" style={{ fontFamily: brand.fontHeading }}>
                Request leave
              </h2>

              {banner ? (
                <div
                  role="status"
                  className="mb-6 p-4 flex items-start gap-3"
                  style={{
                    border: `3px solid ${ink}`,
                    backgroundColor: banner.kind === "success" ? ink : cream,
                    color: banner.kind === "success" ? cream : ink,
                    borderStyle: banner.kind === "success" ? "solid" : "dashed",
                  }}
                >
                  {banner.kind === "success" ? (
                    <CheckCircle aria-hidden="true" className="h-5 w-5 shrink-0 mt-[2px]" />
                  ) : (
                    <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0 mt-[2px]" />
                  )}
                  <span className="text-sm">{banner.body}</span>
                </div>
              ) : null}

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 sm:col-span-3">
                  <Label htmlFor="start_date">Start date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={form.start_date}
                    aria-invalid={errors.start_date ? "true" : undefined}
                    aria-describedby={errors.start_date ? "start_date-error" : undefined}
                    onChange={(e) => setField("start_date", e.target.value)}
                  />
                  <FieldError id="start_date-error" message={errors.start_date} />
                </div>

                <div className="col-span-12 sm:col-span-3">
                  <Label htmlFor="end_date">End date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={form.end_date}
                    aria-invalid={errors.end_date ? "true" : undefined}
                    aria-describedby={errors.end_date ? "end_date-error" : undefined}
                    onChange={(e) => setField("end_date", e.target.value)}
                  />
                  <FieldError id="end_date-error" message={errors.end_date} />
                </div>

                <div className="col-span-12 sm:col-span-3">
                  <Label htmlFor="leave_type">Leave type</Label>
                  <Select
                    id="leave_type"
                    value={form.leave_type}
                    aria-invalid={errors.leave_type ? "true" : undefined}
                    aria-describedby={errors.leave_type ? "leave_type-error" : undefined}
                    onChange={(e) => setField("leave_type", e.target.value)}
                  >
                    <option value="">Choose…</option>
                    <option value="annual">Annual</option>
                    <option value="sick">Sick</option>
                  </Select>
                  <FieldError id="leave_type-error" message={errors.leave_type} />
                </div>

                <div className="col-span-12 sm:col-span-3">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    rows={1}
                    value={form.reason}
                    aria-invalid={errors.reason ? "true" : undefined}
                    aria-describedby={errors.reason ? "reason-error" : undefined}
                    onChange={(e) => setField("reason", e.target.value)}
                  />
                  <FieldError id="reason-error" message={errors.reason} />
                </div>
              </div>

              <div className="mt-6">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Filing…" : "Submit request"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <section aria-labelledby="requests-heading">
          <h2
            id="requests-heading"
            className="text-2xl mb-4"
            style={{ fontFamily: brand.fontHeading }}
          >
            My requests
          </h2>

          {listState === "loading" ? (
            <p role="status">Loading your requests…</p>
          ) : listState === "error" ? (
            <Empty
              title="Could not load your requests"
              description={listError}
              action={
                <Button type="button" onClick={loadRequests}>
                  Try again
                </Button>
              }
            />
          ) : requests.length === 0 ? (
            <Empty
              title="No leave filed yet"
              description="When you submit a request it lands here with its status and the working days the server counted."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH scope="col">Dates</TH>
                  <TH scope="col">Type</TH>
                  <TH scope="col">Working days</TH>
                  <TH scope="col">Status</TH>
                  <TH scope="col">Manager comment</TH>
                  <TH scope="col">Overlap</TH>
                </TR>
              </THead>
              <TBody>
                {requests.map((r) => (
                  <TR key={r.id}>
                    <TD>
                      {r.start_date} – {r.end_date}
                    </TD>
                    <TD>
                      <div className="flex flex-col gap-1">
                        <Badge>{r.leave_type === "annual" ? "Annual" : "Sick"}</Badge>
                        {r.leave_type === "sick" && r.status === "approved" ? (
                          <span className="text-xs" style={{ color: neutral }}>
                            Excluded from annual balance
                          </span>
                        ) : null}
                      </div>
                    </TD>
                    <TD>{r.working_days}</TD>
                    <TD>
                      <StatusBadge status={r.status} />
                    </TD>
                    <TD>{r.manager_comment || <span style={{ color: neutral }}>—</span>}</TD>
                    <TD>
                      {r.has_overlap ? (
                        <Badge variant="warning" className="inline-flex items-center gap-1">
                          <AlertCircle aria-hidden="true" className="h-3 w-3" />
                          Overlap
                        </Badge>
                      ) : (
                        <span style={{ color: neutral }}>—</span>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </section>
      </div>
    </div>
  );
}
