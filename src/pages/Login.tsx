import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type Values = z.infer<typeof schema>;

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/profile";
  }, [location.state]);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  if (user) return <Navigate to="/profile" replace />;

  return (
    <Layout>
      <Seo title="Log In" description="Log in to your Cigar Society account." path="/login" />
      <section className="section-padding">
        <div className="container mx-auto max-w-lg">
          <SectionHeading title="Log in" subtitle="Access your profile and bookings." />
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 md:p-8">
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

                    // If they were navigating to a specific page, keep that.
                    // Otherwise route admins directly to the admin dashboard.
                    const destination = from === "/profile" && isAdmin ? "/admin" : from;
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
                        <Input {...field} type="password" autoComplete="current-password" className="bg-card border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root?.message ? (
                  <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full bg-gold-gradient text-primary-foreground font-body tracking-wider uppercase text-sm shadow-gold hover:opacity-90"
                >
                  {submitting ? "Logging in..." : "Log in"}
                </Button>

                <p className="text-sm text-muted-foreground font-body text-center">
                  Don’t have an account?{" "}
                  <Link to="/signup" className="text-primary underline underline-offset-4 hover:text-primary/90">
                    Sign up
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;

