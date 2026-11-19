import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { apiFetch, ApiError, clearSessionToken } from "@/lib/api";

const { Button, Textarea, Label, Table, THead, TBody, TR, TH, TD, Badge, Empty } = UI;
const { AlertCircle } = Icons;

interface PendingRequest {
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
  remaining_balance: number;
  manager_comment: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
}

type ListState = "loading" | "error" | "forbidden" | "ready";

function redirectToSignIn() {
  clearSessionToken();
  window.location.href = "/sign-in";
}

function typeLabel(t: string): string {
  return t === "annual" ? "Annual" : "Sick";
}

export default function Screen() {
  const ink = brand.primaryColor;
  const cream = brand.backgroundColor;
  const neutral = brand.neutralColor;

  const [listState, setListState] = React.useState<ListState>("loading");
  const [listError, setListError] = React.useState("");
  const [requests, setRequests] = React.useState<PendingRequest[]>([]);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [comment, setComment] = React.useState("");
  const [commentErrors, setCommentErrors] = React.useState<Record<string, string>>({});
  const [decisionErrors, setDecisionErrors] = React.useState<Record<string, string>>({});
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setListState("loading");
    setListError("");
    apiFetch<PendingRequest[]>("/leave-requests/pending")
      .then((data) => {
        setRequests(data);
        setListState("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          redirectToSignIn();
          return;
        }
        if (err instanceof ApiError && err.status === 403) {
          setListState("forbidden");
          return;
        }
        setListError(err instanceof Error ? err.message : "Could not load the pending queue.");
        setListState("error");
      });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  function openRequest(id: string) {
    setSelectedId(id);
    setComment("");
    setCommentErrors((prev) => ({ ...prev, [id]: "" }));
    setDecisionErrors((prev) => ({ ...prev, [id]: "" }));
  }

  function closePanel() {
    setSelectedId(null);
    setComment("");
  }

  async function decide(r: PendingRequest, decision: "approve" | "reject") {
    if (busyId) return;
    if (!comment.trim()) {
      setCommentErrors((prev) => ({ ...prev, [r.id]: "A comment is required." }));
      return;
    }
    setCommentErrors((prev) => ({ ...prev, [r.id]: "" }));
    setDecisionErrors((prev) => ({ ...prev, [r.id]: "" }));
    setBusyId(r.id);
    try {
      await apiFetch(`/leave-requests/${r.id}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision, comment: comment.trim() }),
      });
      setRequests((prev) => prev.filter((x) => x.id !== r.id));
      setSelectedId(null);
      setComment("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        redirectToSignIn();
        return;
      }
      if (err instanceof ApiError && (err.status === 403 || err.status === 409)) {
        setDecisionErrors((prev) => ({
          ...prev,
          [r.id]: err.message || "Could not record that decision.",
        }));
      } else {
        setDecisionErrors((prev) => ({
          ...prev,
          [r.id]: err instanceof Error ? err.message : "Could not record that decision. Try again.",
        }));
      }
    } finally {
      setBusyId(null);
    }
  }

  const hardBox = {
    border: `3px solid ${ink}`,
    borderRadius: 0,
    boxShadow: `6px 6px 0 ${ink}`,
    backgroundColor: cream,
  };

  if (listState === "forbidden") {
    return (
      <div
        style={{ backgroundColor: cream, color: ink, fontFamily: brand.fontBody }}
        className="w-full"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-10">
          <h1 className="text-[40px]" style={{ fontFamily: brand.fontHeading }}>
            Approvals
          </h1>
          <Empty
            title="Managers only"
            description="This screen is only available to managers and HR/Admin. You cannot decide on anyone's leave here."
          />
        </div>
      </div>
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
            Approvals
          </h1>
          <p className="mt-2 text-sm" style={{ color: neutral }}>
            Pending requests from your direct reports. Approve or reject with a comment.
          </p>
        </header>

        <section aria-labelledby="pending-heading">
          <h2
            id="pending-heading"
            className="text-2xl mb-4"
            style={{ fontFamily: brand.fontHeading }}
          >
            Pending requests
          </h2>

          {listState === "loading" ? (
            <p role="status">Loading the pending queue…</p>
          ) : listState === "error" ? (
            <Empty
              title="Could not load the pending queue"
              description={listError}
              action={
                <Button type="button" onClick={load}>
                  Try again
                </Button>
              }
            />
          ) : requests.length === 0 ? (
            <Empty
              title="No requests waiting on you"
              description="Anything new from your direct reports lands here the moment it is submitted."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <THead>
                  <TR>
                    <TH scope="col">Employee</TH>
                    <TH scope="col">Dates</TH>
                    <TH scope="col">Type</TH>
                    <TH scope="col">Working days</TH>
                    <TH scope="col">Reason</TH>
                    <TH scope="col">Remaining balance</TH>
                    <TH scope="col">Overlap</TH>
                    <TH scope="col">
                      <span className="sr-only">Decision</span>
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {requests.map((r) => {
                    const isSelected = r.id === selectedId;
                    const commentError = commentErrors[r.id];
                    const decisionError = decisionErrors[r.id];
                    const isBusy = busyId === r.id;
                    return (
                      <React.Fragment key={r.id}>
                        <TR>
                          <TD>{r.employee_name}</TD>
                          <TD>
                            {r.start_date} – {r.end_date}
                          </TD>
                          <TD>
                            <Badge>{typeLabel(r.leave_type)}</Badge>
                          </TD>
                          <TD>{r.working_days}</TD>
                          <TD className="max-w-[240px]">
                            {r.reason === null ? (
                              <span style={{ color: neutral }}>Restricted</span>
                            ) : (
                              r.reason
                            )}
                          </TD>
                          <TD>{r.remaining_balance}</TD>
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
                          <TD>
                            <Button
                              type="button"
                              variant="secondary"
                              aria-label={`Decide on ${r.employee_name}'s request`}
                              onClick={() => (isSelected ? closePanel() : openRequest(r.id))}
                            >
                              {isSelected ? "Close" : "Decide"}
                            </Button>
                          </TD>
                        </TR>
                        {isSelected ? (
                          <TR>
                            <TD colSpan={8}>
                              <div className="p-4" style={hardBox}>
                                <Label htmlFor={`comment-${r.id}`}>Comment</Label>
                                <Textarea
                                  id={`comment-${r.id}`}
                                  rows={2}
                                  value={comment}
                                  onChange={(e) => {
                                    setComment(e.target.value);
                                    setCommentErrors((prev) => ({ ...prev, [r.id]: "" }));
                                  }}
                                  aria-invalid={commentError ? "true" : undefined}
                                  aria-describedby={
                                    commentError ? `comment-${r.id}-error` : undefined
                                  }
                                />
                                {commentError ? (
                                  <p
                                    id={`comment-${r.id}-error`}
                                    role="alert"
                                    className="mt-2 text-xs"
                                    style={{ color: ink }}
                                  >
                                    {commentError}
                                  </p>
                                ) : null}
                                {decisionError ? (
                                  <p role="alert" className="mt-2 text-xs" style={{ color: ink }}>
                                    {decisionError}
                                  </p>
                                ) : null}
                                <div className="mt-4 flex gap-3">
                                  <Button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => decide(r, "approve")}
                                  >
                                    {isBusy ? "Saving…" : "Approve"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="danger"
                                    disabled={isBusy}
                                    onClick={() => decide(r, "reject")}
                                  >
                                    {isBusy ? "Saving…" : "Reject"}
                                  </Button>
                                </div>
                              </div>
                            </TD>
                          </TR>
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </TBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
