import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type Values = z.infer<typeof schema>;

const Signup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  if (user) return <Navigate to="/profile" replace />;

  return (
    <Layout>
      <Seo title="Sign Up" description="Create your Cigar Society account." path="/signup" />
      <section className="section-padding">
        <div className="container mx-auto max-w-lg">
          <SectionHeading title="Create your account" subtitle="Sign up to view your profile and event bookings." />
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 md:p-8">
            <Form {...form}>
              <form
                className="space-y-5"
                onSubmit={form.handleSubmit(async (values) => {
                  setSubmitting(true);
                  try {
                    const { error } = await supabase.auth.signUp({
                      email: values.email,
                      password: values.password,
                      options: { data: { full_name: values.fullName } },
                    });
                    if (error) {
                      form.setError("root", { message: error.message });
                      return;
                    }
                    navigate("/profile", { replace: true });
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
                      <FormControl>
                        <Input {...field} type="password" autoComplete="new-password" className="bg-card border-border" />
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
                  {submitting ? "Creating..." : "Sign up"}
                </Button>

                <p className="text-sm text-muted-foreground font-body text-center">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary underline underline-offset-4 hover:text-primary/90">
                    Log in
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

export default Signup;

