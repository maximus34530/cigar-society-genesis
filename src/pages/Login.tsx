import Layout from "@/components/Layout";
import { FadeUp } from "@/components/FadeUp";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_POST_AUTH_PATH, resolvePostLoginPath, sanitizeOAuthReturnPath } from "@/lib/authRouting";
import { EVENT_CHECKOUT_RESUME_PATH, peekEventCheckoutDraft } from "@/lib/eventCheckoutDraft";
import { signInWithOAuthProvider } from "@/lib/oauthSignIn";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type Values = z.infer<typeof schema>;

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<"google" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const from = useMemo(() => {
    const state = location.state as { from?: string; error?: string } | null;
    const candidate = state?.from
      ? state.from
      : peekEventCheckoutDraft()
        ? EVENT_CHECKOUT_RESUME_PATH
        : DEFAULT_POST_AUTH_PATH;
    return sanitizeOAuthReturnPath(candidate);
  }, [location.state]);

  const oauthError = useMemo(() => {
    const state = location.state as { error?: string } | null;
    return state?.error ?? null;
  }, [location.state]);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  if (user) return <Navigate to={from} replace />;

  return (
    <Layout>
      <Seo title="Log In" description="Log in to your Cigar Society account." path="/login" noIndex />
      <section className="section-padding">
        <FadeUp className="container mx-auto max-w-lg">
          <SectionHeading title="Log in" subtitle="Access your tickets and account." />
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 md:p-8 space-y-6">
            <GoogleAuthButton
              mode="login"
              busy={oauthBusy === "google"}
              disabled={oauthBusy !== null}
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
            />

            <div className="flex items-center gap-4">
              <Separator className="flex-1 bg-border/60" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">or</span>
              <Separator className="flex-1 bg-border/60" />
            </div>

            {oauthError ? (
              <Alert variant="destructive">
                <AlertTitle>Sign-in</AlertTitle>
                <AlertDescription>{oauthError}</AlertDescription>
              </Alert>
            ) : null}

            <Form {...form}>
              <form
                className="space-y-5"
                onSubmit={form.handleSubmit(async (values) => {
                  setSubmitting(true);
                  try {
                    const { data, error } = await supabase.auth.signInWithPassword(values);
                    if (error || !data.user) {
                      form.setError("root", { message: error?.message ?? "Login failed" });
                      return;
                    }

                    const { data: profile, error: profileError } = await supabase
                      .from("profiles")
                      .select("role")
                      .eq("id", data.user.id)
                      .maybeSingle();

                    if (profileError) {
                      form.setError("root", { message: profileError.message });
                      return;
                    }

                    const role = (profile as { role?: string } | null)?.role;
                    const isAdmin = role === "admin";
                    const destination = resolvePostLoginPath(from, isAdmin);
                    navigate(destination, { replace: true });
                  } finally {
                    setSubmitting(false);
                  }
                })}
              >
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
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
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
                    <AlertTitle>Sign-in</AlertTitle>
                    <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  variant="luxury"
                  size="lg"
                  disabled={submitting || oauthBusy !== null}
                  aria-busy={submitting}
                  className="w-full font-body text-sm uppercase tracking-wider"
                >
                  {submitting ? "Logging in…" : "Log in"}
                </Button>

                <p className="text-sm text-muted-foreground font-body text-center">
                  Don’t have an account?{" "}
                  <Link to="/signup" state={{ from }} className="text-primary underline underline-offset-4 hover:text-primary/90">
                    Sign up
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </FadeUp>
      </section>
    </Layout>
  );
};

export default Login;
