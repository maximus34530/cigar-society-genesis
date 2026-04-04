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
    <span className={cn(variant === "footer" ? "flex shrink-0" : "inline-flex shrink-0", className)}>
      <img
        src={logo}
        alt={business.shortName}
        className={cn(
          variant === "footer"
            ? "h-10 w-auto max-h-10"
            : "h-16 w-auto max-h-16 object-contain sm:h-[4.5rem] sm:max-h-[4.5rem] md:h-[4.75rem] md:max-h-[4.75rem]",
          "drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)]",
          imgClassName,
        )}
        decoding="async"
        fetchPriority={variant === "footer" ? "low" : "high"}
        loading={variant === "footer" ? "lazy" : "eager"}
      />
    </span>
  );
}
