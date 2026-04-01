import logo from "@/assets/logo.png";
import { business } from "@/lib/business";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imgClassName?: string;
  variant?: "nav" | "footer";
};

export function BrandLogo({ className, imgClassName, variant = "nav" }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <img
        src={logo}
        alt={business.shortName}
        className={cn(
          variant === "footer" ? "h-10 w-auto max-h-10" : "h-14 w-auto max-h-[3.5rem]",
          "brightness-[1.06] contrast-[1.05]",
          "drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)]",
          imgClassName
        )}
        decoding="async"
        fetchPriority={variant === "footer" ? "low" : "high"}
        loading={variant === "footer" ? "lazy" : "eager"}
      />
    </span>
  );
}
