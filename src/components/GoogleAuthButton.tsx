import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "signup" | "login";

function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={cn("h-5 w-5", className)}
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.64 1.22 9.1 3.62l6.2-6.2C35.48 3.25 30.15 1 24 1 14.62 1 6.52 6.38 2.57 14.22l7.22 5.6C11.55 13.1 17.26 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.57-.14-3.08-.4-4.5H24v9h12.7c-.55 2.96-2.22 5.47-4.73 7.16l7.23 5.6C43.7 37.7 46.5 31.6 46.5 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M9.79 28.18c-.5-1.5-.79-3.1-.79-4.68s.29-3.18.79-4.68l-7.22-5.6C1.57 16.08 1 19.01 1 23.5s.57 7.42 1.57 10.28l7.22-5.6z"
      />
      <path
        fill="#34A853"
        d="M24 46c6.15 0 11.48-2.03 15.3-5.52l-7.23-5.6c-2.01 1.35-4.58 2.14-8.07 2.14-6.74 0-12.45-3.6-14.21-10.32l-7.22 5.6C6.52 40.62 14.62 46 24 46z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

type Props = {
  mode: Mode;
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void | Promise<void>;
  className?: string;
};

export function GoogleAuthButton({ mode, busy, disabled, onClick, className }: Props) {
  const label = mode === "signup" ? "Sign up with Google" : "Sign in with Google";

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "w-full justify-center gap-3 rounded-full border border-border/70 bg-white text-black",
        "font-body text-base h-12 px-6 shadow-none hover:bg-white/95 hover:text-black",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      disabled={disabled}
      aria-busy={busy}
      onClick={onClick}
    >
      <GoogleGIcon />
      <span>{busy ? "Redirecting…" : label}</span>
    </Button>
  );
}

