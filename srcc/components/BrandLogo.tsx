import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  /** Kept for call-site compatibility; merged into the root span className. */
  imgClassName?: string;
  variant?: "nav" | "footer";
};

export function BrandLogo({ className, imgClassName, variant = "nav" }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-baseline gap-x-1.5 font-body font-semibold uppercase tracking-widest",
        variant === "footer" ? "text-sm sm:text-base" : "text-base sm:text-lg md:text-xl",
        className,
        imgClassName,
      )}
    >
      <span className="text-primary">Cigar</span>
      <span className="text-foreground/70">Society</span>
    </span>
  );
}
