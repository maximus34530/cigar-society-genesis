import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/useMembership";

// Phase 5 Epic E (#190) — composable gating primitive. Wrap any member-only
// UI in <MemberOnly>…</MemberOnly> and non-members see the fallback.
//
// Usage:
//   <MemberOnly>
//     <MemberPerkCard />
//   </MemberOnly>
//
//   <MemberOnly fallback={<MyCustomPaywall />}>
//     <MemberPerkCard />
//   </MemberOnly>
//
// By default non-members see a small "Join La Sociedad to unlock" prompt
// linking to `/membership`.

type MemberOnlyProps = {
  children: ReactNode;
  /** Replaces the default "Join La Sociedad" prompt when the user is not a member. */
  fallback?: ReactNode;
  /** Rendered while membership state is still loading. Default: null (render nothing). */
  loadingFallback?: ReactNode;
};

const DefaultFallback = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex flex-col items-center gap-3 rounded-xl border border-primary/35 bg-card/40 p-6 text-center shadow-card ring-1 ring-border/40"
  >
    <span
      aria-hidden="true"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary"
    >
      <Lock className="h-4 w-4" />
    </span>
    <div className="space-y-1">
      <p className="!font-heading text-base font-semibold text-foreground">Members only</p>
      <p className="text-sm leading-relaxed text-muted-foreground font-body">
        Join La Sociedad to unlock.
      </p>
    </div>
    <Button asChild variant="luxury" size="sm" className="mt-1">
      <Link to="/membership">View membership</Link>
    </Button>
  </div>
);

export function MemberOnly({ children, fallback, loadingFallback = null }: MemberOnlyProps) {
  const { isActive, isLoading } = useMembership();

  if (isLoading) return <>{loadingFallback}</>;
  if (!isActive) return <>{fallback ?? <DefaultFallback />}</>;
  return <>{children}</>;
}
