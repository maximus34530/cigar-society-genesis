import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import {
  clearEmailSignupReturnPath,
  DEFAULT_POST_AUTH_PATH,
  resolvePostLoginPathForUser,
  stashEmailSignupReturnPath,
} from "@/lib/authRouting";
import { signInWithOAuthProvider } from "@/lib/oauthSignIn";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[0-9]/, "Include at least one number"),
});

type Values = z.infer<typeof schema>;

function isRateLimitError(message: string) {
  return message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("too many");
}

const Signup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<"google" | "apple" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState<"form" | "check_email">("form");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const lastSubmitAt = useRef(0);

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? DEFAULT_POST_AUTH_PATH;
  }, [location.state]);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  if (user) return <Navigate to={from} replace />;

  const cooldownSeconds =
    cooldownUntil != null ? Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000)) : 0;

  return (
    <Layout>
      <Seo title="Sign Up" description="Create your Cigar Society account." path="/signup" noIndex />
      <section className="section-padding">
        <div className="container mx-auto max-w-lg">
          <SectionHeading title="Create your account" subtitle="Sign up to view your profile and event bookings." />
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 md:p-8 space-y-6">
            {phase === "form" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-border/80 bg-background/50 font-body text-sm"
                    disabled={oauthBusy !== null || submitting}
                    aria-busy={oauthBusy === "google"}
                    onClick={async () => {
                      form.clearErrors("root");
                      setOauthBusy("google");
                      try {
                        await signInWithOAuthProvider("google", from);
                      } catch (e) {
                        const msg = e instanceof Error ? e.message : "Google sign-in failed.";
                        form.setError("root", { message: msg });
                      } finally {
                        setOauthBusy(null);
                      }
                    }}
                  >
                    {oauthBusy === "google" ? "Redirecting…" : "Continue with Google"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-border/80 bg-background/50 font-body text-sm"
                    disabled={oauthBusy !== null || submitting}
                    aria-busy={oauthBusy === "apple"}
                    onClick={async () => {
                      form.clearErrors("root");
                      setOauthBusy("apple");
                      try {
                        await signInWithOAuthProvider("apple", from);
                      } catch (e) {
                        const msg = e instanceof Error ? e.message : "Apple sign-in failed.";
                        form.setError("root", { message: msg });
                      } finally {
                        setOauthBusy(null);
                      }
                    }}
                  >
                    {oauthBusy === "apple" ? "Redirecting…" : "Continue with Apple"}
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <Separator className="flex-1 bg-border/60" />
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">or</span>
                  <Separator className="flex-1 bg-border/60" />
                </div>

                <Form {...form}>
                  <form
                    className="space-y-5"
                    onSubmit={form.handleSubmit(async (values) => {
                      if (cooldownUntil != null && Date.now() < cooldownUntil) {
                        form.setError("root", {
                          message: `Please wait ${cooldownSeconds}s before trying again.`,
                        });
                        return;
                      }
                      const now = Date.now();
                      if (now - lastSubmitAt.current < 2000) {
                        return;
                      }
                      lastSubmitAt.current = now;

                      setSubmitting(true);
                      form.clearErrors("root");
                      try {
                        stashEmailSignupReturnPath(from, values.email);

                        const { data, error } = await supabase.auth.signUp({
                          email: values.email,
                          password: values.password,
                          options: { data: { full_name: values.fullName } },
                        });

                        if (error) {
                          clearEmailSignupReturnPath();
                          const msg = error.message ?? "Sign up failed";
                          if (isRateLimitError(msg)) {
                            setCooldownUntil(Date.now() + 60_000);
                          }
                          form.setError("root", { message: msg });
                          return;
                        }

                        if (data.session && data.user) {
                          clearEmailSignupReturnPath();
                          const destination = await resolvePostLoginPathForUser(from, data.user.id);
                          navigate(destination, { replace: true });
                          return;
                        }

                        setSubmittedEmail(values.email);
                        setPhase("check_email");
                      } finally {
                        setSubmitting(false);
                      }
                    })}
                  >
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <p className="text-xs text-muted-foreground -mt-1">At least 8 characters, including a number.</p>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                className="bg-card border-border pr-11"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.formState.errors.root?.message ? (
                      <Alert variant="destructive">
                        <AlertTitle>Sign up</AlertTitle>
                        <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                      </Alert>
                    ) : null}

                    {cooldownUntil != null && cooldownSeconds > 0 ? (
                      <p className="text-sm text-muted-foreground font-body text-center">
                        You can try again in {cooldownSeconds}s.
                      </p>
                    ) : null}

                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting || oauthBusy !== null || (cooldownUntil != null && Date.now() < cooldownUntil)}
                      aria-busy={submitting}
                      className="w-full bg-gold-gradient text-primary-foreground font-body tracking-wider uppercase text-sm shadow-gold hover:opacity-90"
                    >
                      {submitting ? "Creating…" : "Sign up"}
                    </Button>

                    <p className="text-sm text-muted-foreground font-body text-center">
                      Already have an account?{" "}
                      <Link to="/login" state={{ from }} className="text-primary underline underline-offset-4 hover:text-primary/90">
                        Log in
                      </Link>
                    </p>
                  </form>
                </Form>
              </>
            ) : (
              <div className="space-y-5">
                <Alert>
                  <AlertTitle>Check your email</AlertTitle>
                  <AlertDescription className="space-y-3 pt-1">
                    <p>
                      We sent a confirmation link to <span className="font-medium text-foreground">{submittedEmail}</span>.
                      After you confirm, you’ll be signed in and we’ll take you back to what you were doing (for example, event
                      tickets).
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Didn’t get it? Wait a minute, check spam, then try signing up again — if you click too fast, email
                      providers may slow things down.
                    </p>
                  </AlertDescription>
                </Alert>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button variant="outline" asChild>
                    <Link to="/login" state={{ from }}>
                      Go to log in
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/">Back to home</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Signup;
