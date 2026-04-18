import { Badge } from "@/components/ui/badge";
import { PUBLIC_CAPACITY_EXACT_COUNT_THRESHOLD } from "@/lib/eventCapacityPublic";
import { cn } from "@/lib/utils";

const badgeClass = "border-border/70 font-body text-[10px] uppercase tracking-wide";

type PublicEventCapacityBadgesProps = {
  remaining: number | null;
  soldOut: boolean;
};

/** Public listing: hide exact capacity until seats left are at or below {@link PUBLIC_CAPACITY_EXACT_COUNT_THRESHOLD}. */
export function PublicEventCapacityBadges({ remaining, soldOut }: PublicEventCapacityBadgesProps) {
  if (remaining == null) return null;
  if (soldOut) {
    return (
      <Badge variant="destructive" className={cn(badgeClass)}>
        Sold out
      </Badge>
    );
  }
  if (remaining > PUBLIC_CAPACITY_EXACT_COUNT_THRESHOLD) {
    return (
      <Badge variant="secondary" className={cn(badgeClass)}>
        Limited seats
      </Badge>
    );
  }
  return (
    <>
      <Badge variant="secondary" className={cn(badgeClass)}>
        {remaining} tickets left
      </Badge>
      <Badge variant="secondary" className={cn(badgeClass)}>
        Limited seats
      </Badge>
    </>
  );
}
