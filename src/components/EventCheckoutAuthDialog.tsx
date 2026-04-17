import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { stashEmailSignupReturnPath, clearEmailSignupReturnPath } from "@/lib/authRouting";
import { EVENT_CHECKOUT_RESUME_PATH } from "@/lib/eventCheckoutDraft";
import { signInWithOAuthProvider } from "@/lib/oauthSignIn";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[0-9]/, "Include at least one number"),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

function isRateLimitError(message: string) {
  return message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("too many");
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticated: () => void;
  /** Persist ticket form + intent before OAuth redirect. */
  onBeforeOAuth: () => void;
};

export function EventCheckoutAuthDialog({ open, onOpenChange, onAuthenticated, onBeforeOAuth }: Props) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [oauthBusy, setOauthBusy] = useState<"google" | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupPhase, setSignupPhase] = useState<"form" | "check_email">("form");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [signupCooldownUntil, setSignupCooldownUntil] = useState<number | null>(null);
  const lastSignupAt = useRef(0);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const signupCooldownSeconds =
    signupCooldownUntil != null ? Math.max(0, Math.ceil((signupCooldownUntil - Date.now()) / 1000)) : 0;

  const resetInner = () => {
    setTab("login");
    setSignupPhase("form");
    setSubmittedEmail("");
    loginForm.reset({ email: "", password: "" });
    signupForm.reset({ fullName: "", email: "", password: "" });
    loginForm.clearErrors("root");
    signupForm.clearErrors("root");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        resetInner();
        onOpenChange(false);
      }}
    >
      <DialogContent className="z-[100] w-[calc(100vw-1.25rem)] max-w-md border-border/60 bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Sign in to continue</DialogTitle>
          <DialogDescription className="font-body text-sm text-muted-foreground">
            Log in or create an account to complete your ticket request.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <GoogleAuthButton
            mode={tab === "signup" ? "signup" : "login"}
            busy={oauthBusy === "google"}
            disabled={oauthBusy !== null || loginSubmitting || signupSubmitting}
            onClick={async () => {
              loginForm.clearErrors("root");
              signupForm.clearErrors("root");
              setOauthBusy("google");
              try {
                onBeforeOAuth();
                await signInWithOAuthProvider("google", EVENT_CHECKOUT_RESUME_PATH);
              } catch (e) {
                const msg = e instanceof Error ? e.message : "Google sign-in failed.";
                loginForm.setError("root", { message: msg });
              } finally {
                setOauthBusy(null);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-4">
          <Separator className="flex-1 bg-border/60" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">or</span>
          <Separator className="flex-1 bg-border/60" />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="font-body text-sm">
              Log in
            </TabsTrigger>
            <TabsTrigger value="signup" className="font-body text-sm">
              Create account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4 space-y-4">
            {loginForm.formState.errors.root?.message ? (
              <Alert variant="destructive">
                <AlertTitle>Sign-in</AlertTitle>
                <AlertDescription>{loginForm.formState.errors.root.message}</AlertDescription>
              </Alert>
            ) : null}
            <Form {...loginForm}>
              <form
                className="space-y-4"
                onSubmit={loginForm.handleSubmit(async (values) => {
                  setLoginSubmitting(true);
                  loginForm.clearErrors("root");
                  try {
                    onBeforeOAuth();
                    const { data, error } = await supabase.auth.signInWithPassword(values);
                    if (error || !data.user) {
                      loginForm.setError("root", { message: error?.message ?? "Login failed" });
                      return;
                    }
                    resetInner();
                    onAuthenticated();
                  } finally {
                    setLoginSubmitting(false);
                  }
                })}
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" autoComplete="email" className="bg-card border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showLoginPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className="bg-card border-border pr-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground"
                            aria-label={showLoginPassword ? "Hide password" : "Show password"}
                          >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-gold-gradient font-body text-sm uppercase tracking-wider text-primary-foreground shadow-gold hover:opacity-90"
                  disabled={loginSubmitting || oauthBusy !== null}
                >
                  {loginSubmitting ? "Logging in…" : "Log in"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4 space-y-4">
            {signupPhase === "form" ? (
              <Form {...signupForm}>
                <form
                  className="space-y-4"
                  onSubmit={signupForm.handleSubmit(async (values) => {
                    if (signupCooldownUntil != null && Date.now() < signupCooldownUntil) {
                      signupForm.setError("root", {
                        message: `Please wait ${signupCooldownSeconds}s before trying again.`,
                      });
                      return;
                    }
                    const now = Date.now();
                    if (now - lastSignupAt.current < 2000) return;
                    lastSignupAt.current = now;

                    setSignupSubmitting(true);
                    signupForm.clearErrors("root");
                    try {
                      onBeforeOAuth();
                      stashEmailSignupReturnPath(EVENT_CHECKOUT_RESUME_PATH, values.email);

                      const { data, error } = await supabase.auth.signUp({
                        email: values.email,
                        password: values.password,
                        options: { data: { full_name: values.fullName } },
                      });

                      if (error) {
                        clearEmailSignupReturnPath();
                        const msg = error.message ?? "Sign up failed";
                        if (isRateLimitError(msg)) {
                          setSignupCooldownUntil(Date.now() + 60_000);
                        }
                        signupForm.setError("root", { message: msg });
                        return;
                      }

                      if (data.session && data.user) {
                        clearEmailSignupReturnPath();
                        resetInner();
                        onAuthenticated();
                        return;
                      }

                      setSubmittedEmail(values.email);
                      setSignupPhase("check_email");
                    } finally {
                      setSignupSubmitting(false);
                    }
                  })}
                >
                  <FormField
                    control={signupForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="name" className="bg-card border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" autoComplete="email" className="bg-card border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <p className="-mt-1 text-xs text-muted-foreground">At least 8 characters, including a number.</p>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showSignupPassword ? "text" : "password"}
                              autoComplete="new-password"
                              className="bg-card border-border pr-11"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword((v) => !v)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground"
                              aria-label={showSignupPassword ? "Hide password" : "Show password"}
                            >
                              {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {signupForm.formState.errors.root?.message ? (
                    <Alert variant="destructive">
                      <AlertTitle>Sign up</AlertTitle>
                      <AlertDescription>{signupForm.formState.errors.root.message}</AlertDescription>
                    </Alert>
                  ) : null}

                  {signupCooldownUntil != null && signupCooldownSeconds > 0 ? (
                    <p className="text-center font-body text-sm text-muted-foreground">
                      You can try again in {signupCooldownSeconds}s.
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    className="w-full bg-gold-gradient font-body text-sm uppercase tracking-wider text-primary-foreground shadow-gold hover:opacity-90"
                    disabled={
                      signupSubmitting ||
                      oauthBusy !== null ||
                      (signupCooldownUntil != null && Date.now() < signupCooldownUntil)
                    }
                  >
                    {signupSubmitting ? "Creating…" : "Sign up"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Alert>
                <AlertTitle>Check your email</AlertTitle>
                <AlertDescription className="space-y-3 pt-1 font-body text-sm">
                  <p>
                    We sent a confirmation link to <span className="font-medium text-foreground">{submittedEmail}</span>.
                    After you confirm, you’ll return to Events to finish your ticket request.
                  </p>
                  <p className="text-muted-foreground">
                    Didn’t get it? Wait a minute, check spam, then try again — if you click too fast, email providers may slow
                    things down.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
