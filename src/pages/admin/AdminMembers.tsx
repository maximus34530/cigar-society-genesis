import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AdminMemberRow,
  adminMembersListQueryKey,
  useAdminMembersList,
} from "@/hooks/queries/useAdminMembers";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

// Phase 5 Epic F (#191) — admin members tab (read-only).
// DoD (per Phase5_implementation_plan §10): "Members tab lists rows; admin
// can spot-check 3 rows match Stripe." This view is strictly read-only —
// no plan/status edits, no cancel buttons. All mutations continue to flow
// through Stripe → stripe-webhook → memberships.

type StatusFilter = "all" | "active_or_trialing" | "past_due" | "canceled";

function truncateId(id: string | null | undefined, len = 14) {
  if (!id) return "—";
  return id.length <= len ? id : `${id.slice(0, len)}…`;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function statusPillClass(status: string | null | undefined, cancelAtPeriodEnd: boolean | null) {
  if (status === "active" || status === "trialing") {
    return cancelAtPeriodEnd
      ? "bg-amber-500/10 text-amber-200 ring-amber-500/30"
      : "bg-emerald-500/10 text-emerald-200 ring-emerald-500/30";
  }
  if (status === "past_due" || status === "unpaid" || status === "incomplete") {
    return "bg-amber-500/10 text-amber-200 ring-amber-500/30";
  }
  if (status === "canceled") {
    return "bg-muted/50 text-muted-foreground ring-border/60";
  }
  return "bg-background/40 text-muted-foreground ring-border/50";
}

function statusLabel(status: string | null | undefined, cancelAtPeriodEnd: boolean | null) {
  if (!status) return "—";
  if ((status === "active" || status === "trialing") && cancelAtPeriodEnd) {
    return `${status} · canceling`;
  }
  return status;
}

function matchesStatusFilter(row: AdminMemberRow, filter: StatusFilter) {
  if (filter === "all") return true;
  if (filter === "active_or_trialing") return row.status === "active" || row.status === "trialing";
  if (filter === "past_due") return row.status === "past_due" || row.status === "unpaid" || row.status === "incomplete";
  if (filter === "canceled") return row.status === "canceled";
  return true;
}

export default function AdminMembers() {
  const queryClient = useQueryClient();
  const { data: rows = [], isPending: loading, isError, error, refetch } = useAdminMembersList();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (!matchesStatusFilter(row, filter)) return false;
      if (!q) return true;
      const name = row.full_name?.toLowerCase() ?? "";
      const email = row.email?.toLowerCase() ?? "";
      const plan = row.plan?.toLowerCase() ?? "";
      return name.includes(q) || email.includes(q) || plan.includes(q);
    });
  }, [rows, query, filter]);

  const counts = useMemo(() => {
    return {
      all: rows.length,
      active: rows.filter((r) => r.status === "active" || r.status === "trialing").length,
      past_due: rows.filter((r) => r.status === "past_due" || r.status === "unpaid" || r.status === "incomplete").length,
      canceled: rows.filter((r) => r.status === "canceled").length,
    };
  }, [rows]);

  return (
    <Card className="bg-card/40 border-border/60">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle className="font-heading">Members</CardTitle>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Read-only view of La Sociedad memberships. Changes flow through Stripe → webhook.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
              All ({counts.all})
            </FilterChip>
            <FilterChip active={filter === "active_or_trialing"} onClick={() => setFilter("active_or_trialing")}>
              Active ({counts.active})
            </FilterChip>
            <FilterChip active={filter === "past_due"} onClick={() => setFilter("past_due")}>
              Past due ({counts.past_due})
            </FilterChip>
            <FilterChip active={filter === "canceled"} onClick={() => setFilter("canceled")}>
              Canceled ({counts.canceled})
            </FilterChip>
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, plan…"
            className="bg-card border-border md:w-72"
          />
          <Button
            type="button"
            variant="outline"
            className="border-border/70"
            onClick={async () => {
              await queryClient.invalidateQueries({ queryKey: adminMembersListQueryKey });
              void refetch();
            }}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p className="font-body text-sm text-muted-foreground">Loading members…</p>
        ) : isError ? (
          <div className="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-6">
            <p className="font-heading text-base text-destructive">Couldn’t load members</p>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {(error as Error | null)?.message ?? "Unknown error"}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
            <p className="font-heading text-lg text-muted-foreground/90">
              {rows.length === 0 ? "No members yet" : "No members match this filter"}
            </p>
            <p className="mt-2 font-body text-sm text-muted-foreground/70">
              {rows.length === 0
                ? "Once someone subscribes through Stripe, they’ll appear here."
                : "Try clearing your search or switching filters."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[960px] text-left">
                <thead>
                  <tr className="border-b border-border/60">
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Plan</Th>
                    <Th>Status</Th>
                    <Th>Current period end</Th>
                    <Th>Cancel at period end</Th>
                    <Th>Stripe customer</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.membership_id} className="border-b border-border/40 hover:bg-muted/10">
                      <Td>
                        <p className="font-heading text-sm text-foreground">
                          {row.full_name?.trim() ? row.full_name : "Unnamed"}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground/70 break-all">
                          {truncateId(row.user_id, 18)}
                        </p>
                      </Td>
                      <Td>
                        <p className="font-body text-sm text-foreground/90 break-all">{row.email ?? "—"}</p>
                      </Td>
                      <Td>
                        <p className="font-body text-sm text-foreground/90">{row.plan ?? "—"}</p>
                      </Td>
                      <Td>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-body ring-1",
                            statusPillClass(row.status, row.cancel_at_period_end),
                          )}
                        >
                          {statusLabel(row.status, row.cancel_at_period_end)}
                        </span>
                      </Td>
                      <Td>
                        <p className="font-body text-sm text-foreground/90">{formatDate(row.current_period_end)}</p>
                      </Td>
                      <Td>
                        <p className="font-body text-sm text-foreground/90">
                          {row.cancel_at_period_end ? "Yes" : "No"}
                        </p>
                      </Td>
                      <Td>
                        <p className="font-mono text-[11px] text-muted-foreground/80 break-all">
                          {truncateId(row.stripe_customer_id, 22)}
                        </p>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-3">
              {filtered.map((row) => (
                <div
                  key={row.membership_id}
                  className="rounded-xl border border-border/60 bg-card/30 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-base text-foreground">
                      {row.full_name?.trim() ? row.full_name : "Unnamed"}
                    </p>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-body ring-1",
                        statusPillClass(row.status, row.cancel_at_period_end),
                      )}
                    >
                      {statusLabel(row.status, row.cancel_at_period_end)}
                    </span>
                  </div>
                  <p className="mt-1 font-body text-sm text-muted-foreground break-all">
                    {row.email ?? "No email"}
                  </p>
                  <p className="mt-2 font-body text-xs text-muted-foreground/80">
                    Plan: {row.plan ?? "—"} • Period end: {formatDate(row.current_period_end)} • Cancel at period end:{" "}
                    {row.cancel_at_period_end ? "Yes" : "No"}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground/70 break-all">
                    User: {truncateId(row.user_id, 18)} · Stripe: {truncateId(row.stripe_customer_id, 22)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 font-body text-[11px] uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-3 align-top">{children}</td>;
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 font-body text-xs tracking-wide transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border/60 bg-card/30 text-foreground/70 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
