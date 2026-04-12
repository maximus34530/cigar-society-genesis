import { Loader2 } from "lucide-react";

export function AuthLoadingFallback() {
  return (
    <div
      className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary motion-reduce:animate-none" aria-hidden />
      <div className="text-center space-y-1">
        <p className="font-heading text-sm tracking-wide text-foreground/90">Cigar Society</p>
        <p className="text-sm text-muted-foreground font-body">Checking your session…</p>
      </div>
    </div>
  );
}
