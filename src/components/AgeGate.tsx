import { useEffect, useId, useState } from "react";
import loungeImg from "@/assets/lounge-seating.jpg";
import loungeWebp from "@/assets/lounge-seating.webp";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AgeGateProps = {
  onVerified: (remember: boolean) => void;
};

const btnClass =
  "h-12 rounded-[4px] border-0 bg-[hsl(var(--age-gate-button))] px-4 font-body text-sm font-bold uppercase tracking-wide text-[hsl(0_0%_100%)] shadow-none hover:bg-[hsl(var(--age-gate-button-hover))] hover:text-[hsl(0_0%_100%)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))] focus-visible:ring-offset-2 focus-visible:ring-offset-black";

export function AgeGate({ onVerified }: AgeGateProps) {
  const [remember, setRemember] = useState(true);
  const [showUnderage, setShowUnderage] = useState(false);
  const titleId = useId();
  const descId = useId();
  const errorId = useId();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleNo = () => {
    setShowUnderage(true);
  };

  const handleYes = () => {
    setShowUnderage(false);
    onVerified(remember);
  };

  return (
    <div className="fixed inset-0 z-[200] flex min-h-[100dvh] items-center justify-center">
      <picture className="absolute inset-0 block h-full w-full" aria-hidden>
        <source srcSet={loungeWebp} type="image/webp" />
        <img
          src={loungeImg}
          alt=""
          aria-hidden
          className="h-full w-full object-cover object-center"
          decoding="async"
          fetchPriority="high"
          loading="eager"
        />
      </picture>
      <div className="absolute inset-0 bg-[hsl(0_0%_0%_/0.45)]" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={showUnderage ? `${descId} ${errorId}` : descId}
        className="relative z-10 mx-4 w-full max-w-[34rem] bg-[hsl(var(--age-gate-modal))] px-8 py-9 text-[hsl(0_0%_100%)] shadow-[0_24px_80px_hsl(0_0%_0%_/0.65)] sm:px-12 sm:py-10"
      >
        <div className="flex flex-col items-center gap-7">
          <BrandLogo
            variant="nav"
            className="justify-center"
            imgClassName="!h-[3.5rem] !max-h-none w-auto object-contain brightness-0 invert sm:!h-[4rem] sm:!max-h-none"
          />

          <div className="space-y-6 text-center">
            <h1
              id={titleId}
              className="font-body text-base font-bold uppercase leading-tight tracking-wide text-[hsl(0_0%_100%)] sm:text-lg md:text-xl"
            >
              You must be at least 21 years of age to enter this site
            </h1>
            <p id={descId} className="font-body text-sm font-normal text-[hsl(0_0%_100%)] sm:text-[0.9375rem]">
              Are you over 21 years of age?
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
            <Button type="button" variant="ghost" className={btnClass} onClick={handleYes}>
              Yes
            </Button>
            <Button type="button" variant="ghost" className={btnClass} onClick={handleNo}>
              No
            </Button>
          </div>

          <div className="flex w-full items-center justify-center gap-2.5">
            <Checkbox
              id="age-gate-remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(v === true)}
              className="h-4 w-4 border-[hsl(0_0%_100%_/0.45)] data-[state=checked]:border-[hsl(var(--age-gate-checkbox))] data-[state=checked]:bg-[hsl(var(--age-gate-checkbox))] data-[state=checked]:text-[hsl(0_0%_100%)]"
            />
            <Label
              htmlFor="age-gate-remember"
              className="cursor-pointer font-body text-sm font-normal text-[hsl(0_0%_100%)]"
            >
              Remember me
            </Label>
          </div>

          <div
            className={cn(
              "min-h-[1.25rem] w-full text-center font-body text-xs font-normal leading-snug sm:text-sm",
              showUnderage ? "text-[hsl(var(--age-gate-underage))]" : "text-transparent",
            )}
            aria-live="polite"
            aria-hidden={!showUnderage}
          >
            <span id={errorId}>You are not old enough to view this content</span>
          </div>

          <div className="w-full border border-[hsl(var(--age-gate-modal))] bg-[hsl(0_0%_100%)] px-3 py-3 text-left font-body text-xs leading-relaxed text-[hsl(var(--age-gate-modal))] sm:px-4 sm:text-sm">
            <p>
              <span className="font-bold uppercase">Surgeon General Warning:</span>{" "}
              <span className="normal-case">Cigars are not a safe alternative to cigarettes.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
