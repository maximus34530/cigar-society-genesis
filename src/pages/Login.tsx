import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_POST_AUTH_PATH, resolvePostLoginPath } from "@/lib/authRouting";
import { signInWithOAuthProvider } from "@/lib/oauthSignIn";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type Values = z.infer<typeof schema>;

const magicSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type MagicValues = z.infer<typeof magicSchema>;

const MAGIC_COOLDOWN_SEC = 45;

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<"google" | "apple" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [signInTab, setSignInTab] = useState<"password" | "magic">("password");
  const [magicSent, setMagicSent] = useState(false);
  const [magicCooldown, setMagicCooldown] = useState(0);

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? DEFAULT_POST_AUTH_PATH;
  }, [location.state]);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const magicForm = useForm<MagicValues>({
    resolver: zodResolver(magicSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (magicCooldown <= 0) return;
    const t = window.setInterval(() => setMagicCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [magicCooldown]);

  if (user) return <Navigate to={from} replace />;

  return (
    <Layout>
      <Seo title="Log In" description="Log in to your Cigar Society account." path="/login" noIndex />
      <section className="section-padding">
        <div className="container mx-auto max-w-lg">
          <SectionHeading title="Log in" subtitle="Access your profile and bookings." />
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 md:p-8 space-y-6">
            <Tabs value={signInTab} onValueChange={(v) => setSignInTab(v as "password" | "magic")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/80">
                <TabsTrigger value="password" className="font-body text-xs sm:text-sm">
                  Password
                </TabsTrigger>
                <TabsTrigger value="magic" className="font-body text-xs sm:text-sm">
                  Magic link (demo)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="mt-6 space-y-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-border/80 bg-background/50 font-body text-sm"
                    disabled={oauthBusy !== null}
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
                    disabled={oauthBusy !== null}
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
                      size="lg"
                      disabled={submitting || oauthBusy !== null}
                      aria-busy={submitting}
                      className="w-full bg-gold-gradient text-primary-foreground font-body tracking-wider uppercase text-sm shadow-gold hover:opacity-90"
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
              </TabsContent>

              <TabsContent value="magic" className="mt-6 space-y-5">
                <Alert className="border-primary/25 bg-primary/5">
                  <AlertTitle className="font-heading text-sm">Demo only</AlertTitle>
                  <AlertDescription className="font-body text-sm text-muted-foreground">
                    This flow shows the UX for email magic links. We do not call <code className="text-xs">signInWithOtp</code> here until the
                    product enables passwordless sign-in.
                  </AlertDescription>
                </Alert>

                {magicSent ? (
                  <div className="rounded-xl border border-border/60 bg-card/30 p-5 space-y-3">
                    <p className="font-heading text-base text-foreground">Check your email</p>
                    <p className="font-body text-sm text-muted-foreground">
                      If magic links were enabled, we would send a sign-in link to{" "}
                      <span className="text-foreground font-medium">{magicForm.getValues("email")}</span>. Nothing was sent in this demo.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border/70"
                      disabled={magicCooldown > 0}
                      onClick={() => {
                        setMagicSent(false);
                        magicForm.reset();
                      }}
                    >
                      {magicCooldown > 0 ? `Try again in ${magicCooldown}s` : "Use a different email"}
                    </Button>
                  </div>
                ) : (
                  <Form {...magicForm}>
                    <form
                      className="space-y-5"
                      onSubmit={magicForm.handleSubmit(() => {
                        setMagicSent(true);
                        setMagicCooldown(MAGIC_COOLDOWN_SEC);
                      })}
                    >
                      <FormField
                        control={magicForm.control}
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
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-gold-gradient text-primary-foreground font-body tracking-wider uppercase text-sm shadow-gold hover:opacity-90"
                      >
                        Continue with email
                      </Button>
                    </form>
                  </Form>
                )}

                <p className="text-sm text-muted-foreground font-body text-center">
                  Prefer a password?{" "}
                  <button
                    type="button"
                    className="text-primary underline underline-offset-4 hover:text-primary/90"
                    onClick={() => setSignInTab("password")}
                  >
                    Password sign-in
                  </button>
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
