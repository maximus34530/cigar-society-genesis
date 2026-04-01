export const PageLoadingFallback = () => (
  <div
    className="min-h-[60vh] flex flex-col items-center justify-center gap-4 pt-20"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div
      className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin motion-reduce:animate-none"
      aria-hidden
    />
    <p className="text-sm text-muted-foreground font-body">Loading…</p>
  </div>
);
