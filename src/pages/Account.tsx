import Layout from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { normalizePhoneE164Like } from "@/lib/phone";
import { markRecentReauth, hasRecentReauth } from "@/lib/reAuth";
import { signInWithOAuthProvider } from "@/lib/oauthSignIn";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Shield, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

const personalInfoSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || normalizePhoneE164Like(v) !== null, "Enter a valid phone number"),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

const reauthSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type ReauthValues = z.infer<typeof reauthSchema>;

const changeEmailSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

const changePasswordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string().min(8, "Use at least 8 characters"),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

function getPrimaryProvider(user: { app_metadata?: { provider?: string } } | null): string {
  return user?.app_metadata?.provider ?? "email";
}

export default function Account() {
  const { user, profile, refreshProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [savingPersonal, setSavingPersonal] = useState(false);
  const [busySecurity, setBusySecurity] = useState<null | "reauth" | "email" | "password">(null);
  const [reauthOpen, setReauthOpen] = useState(false);

  const provider = useMemo(() => getPrimaryProvider(user), [user]);

  useEffect(() => {
    if (searchParams.get("reauth") !== "1") return;
    markRecentReauth();
    const next = new URLSearchParams(searchParams);
    next.delete("reauth");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const personalForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    values: {
      firstName: profile?.first_name?.trim() ?? "",
      lastName: profile?.last_name?.trim() ?? "",
      phone: profile?.phone?.trim() ?? "",
    },
  });

  const reauthForm = useForm<ReauthValues>({
    resolver: zodResolver(reauthSchema),
    defaultValues: { password: "" },
  });

  const emailForm = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    values: { email: user?.email ?? "" },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const signInMethodLabel = useMemo(() => {
    if (provider === "google") return "Google";
    if (provider === "email") return "Email + password";
    return provider;
  }, [provider]);

  const displayEmail = user?.email ?? "";

  const ensureRecentReauth = async (after: "email" | "password"): Promise<boolean> => {
    if (hasRecentReauth()) return true;

    if (provider === "google") {
      try {
        setBusySecurity("reauth");
        const base = `${location.pathname}${location.search}`;
        const sep = base.includes("?") ? "&" : "?";
        await signInWithOAuthProvider("google", `${base}${sep}reauth=1`);
        return false;
      } catch (e) {
        toast({
          title: "Couldn’t confirm it’s you",
          description: e instanceof Error ? e.message : "Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setBusySecurity(null);
      }
    }

    setReauthOpen(true);
    return false;
  };

  return (
    <RequireAuth>
      <Layout>
        <Seo title="Manage account" description="Manage your Cigar Society account." path="/account" noIndex />
        <section className="section-padding">
          <div className="container mx-auto max-w-5xl">
            <SectionHeading
              title="Manage account"
              subtitle="Update your personal info and keep your sign-in secure."
              className="!mb-8 md:!mb-10"
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="bg-card/40 border-border/60">
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-primary" aria-hidden />
                    Personal info
                  </CardTitle>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    Keep your details up to date for tickets and lounge communications.
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <Form {...personalForm}>
                    <form
                      className="space-y-5"
                      onSubmit={personalForm.handleSubmit(async (values) => {
                        if (!user) return;
                        setSavingPersonal(true);
                        try {
                          const phoneNormalized = values.phone?.trim() ? normalizePhoneE164Like(values.phone) : null;
                          if (values.phone?.trim() && !phoneNormalized) {
                            personalForm.setError("phone", { message: "Enter a valid phone number" });
                            return;
                          }

                          const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
                          const { error } = await supabase
                            .from("profiles")
                            .update({
                              first_name: values.firstName.trim(),
                              last_name: values.lastName.trim(),
                              phone: phoneNormalized,
                              full_name: fullName || null,
                            })
                            .eq("id", user.id);
                          if (error) throw error;
                          await refreshProfile();
                          toast({ title: "Saved", description: "Your personal info was updated." });
                        } catch (e) {
                          toast({
                            title: "Couldn’t save changes",
                            description: e instanceof Error ? e.message : "Please try again.",
                            variant: "destructive",
                          });
                        } finally {
                          setSavingPersonal(false);
                        }
                      })}
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={personalForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First name</FormLabel>
                              <FormControl>
                                <Input {...field} autoComplete="given-name" className="bg-card border-border" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={personalForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last name</FormLabel>
                              <FormControl>
                                <Input {...field} autoComplete="family-name" className="bg-card border-border" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={personalForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="(956) 555-1234" autoComplete="tel" className="bg-card border-border" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        variant="luxury"
                        disabled={savingPersonal}
                        aria-busy={savingPersonal}
                        className="font-body text-sm uppercase tracking-wider"
                      >
                        {savingPersonal ? "Saving…" : "Save personal info"}
                      </Button>
                    </form>
                  </Form>

                  <Separator className="bg-border/60" />

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button variant="outline" className="border-border/70" onClick={() => navigate("/dashboard")}>
                      Go to dashboard
                    </Button>
                    {isAdmin ? (
                      <Button className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90" onClick={() => navigate("/admin")}>
                        Admin
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/60">
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" aria-hidden />
                    Security & sign-in
                  </CardTitle>
                  <p className="mt-1 font-body text-sm text-muted-foreground">Protect your account and keep sign-in details current.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-xl border border-border/60 bg-card/30 p-4">
                    <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">Sign-in method</p>
                    <p className="mt-2 font-heading text-base text-foreground">{signInMethodLabel}</p>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between border-border/70">
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" aria-hidden />
                          Change email
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[11rem]">{displayEmail}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Change email</DialogTitle>
                      </DialogHeader>
                      <Form {...emailForm}>
                        <form
                          className="space-y-4"
                          onSubmit={emailForm.handleSubmit(async (values) => {
                            if (!user) return;
                            const ok = await ensureRecentReauth("email");
                            if (!ok) return;

                            setBusySecurity("email");
                            try {
                              const { error } = await supabase.auth.updateUser({ email: values.email.trim().toLowerCase() });
                              if (error) throw error;
                              toast({
                                title: "Check your inbox",
                                description: "We sent a confirmation link to complete your email change.",
                              });
                            } catch (e) {
                              toast({
                                title: "Couldn’t change email",
                                description: e instanceof Error ? e.message : "Please try again.",
                                variant: "destructive",
                              });
                            } finally {
                              setBusySecurity(null);
                            }
                          })}
                        >
                          <FormField
                            control={emailForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" autoComplete="email" className="bg-card border-border" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit" disabled={busySecurity !== null} className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
                              {busySecurity === "email" ? "Sending…" : "Send confirmation"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between border-border/70">
                        <span>Set / change password</span>
                        <span className="text-xs text-muted-foreground">Recommended</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Set / change password</DialogTitle>
                      </DialogHeader>
                      <Form {...passwordForm}>
                        <form
                          className="space-y-4"
                          onSubmit={passwordForm.handleSubmit(async (values) => {
                            const ok = await ensureRecentReauth("password");
                            if (!ok) return;

                            setBusySecurity("password");
                            try {
                              const { error } = await supabase.auth.updateUser({ password: values.password.trim() });
                              if (error) throw error;
                              passwordForm.reset({ password: "", confirm: "" });
                              toast({ title: "Password updated", description: "Your password was changed." });
                            } catch (e) {
                              toast({
                                title: "Couldn’t update password",
                                description: e instanceof Error ? e.message : "Please try again.",
                                variant: "destructive",
                              });
                            } finally {
                              setBusySecurity(null);
                            }
                          })}
                        >
                          <FormField
                            control={passwordForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" autoComplete="new-password" className="bg-card border-border" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="confirm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" autoComplete="new-password" className="bg-card border-border" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit" disabled={busySecurity !== null} className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
                              {busySecurity === "password" ? "Updating…" : "Update password"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Dialog open={reauthOpen} onOpenChange={setReauthOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm it’s you</DialogTitle>
            </DialogHeader>
            <Form {...reauthForm}>
              <form
                className="space-y-4"
                onSubmit={reauthForm.handleSubmit(async (values) => {
                  const email = user?.email;
                  if (!email) return;
                  setBusySecurity("reauth");
                  try {
                    const { error } = await supabase.auth.signInWithPassword({ email, password: values.password });
                    if (error) throw error;
                    markRecentReauth();
                    setReauthOpen(false);
                    reauthForm.reset({ password: "" });
                    toast({ title: "Confirmed", description: "You can continue your security change." });
                  } catch (e) {
                    toast({
                      title: "Couldn’t confirm",
                      description: e instanceof Error ? e.message : "Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setBusySecurity(null);
                  }
                })}
              >
                <FormField
                  control={reauthForm.control}
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
                <DialogFooter>
                  <Button type="submit" disabled={busySecurity !== null} className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
                    {busySecurity === "reauth" ? "Confirming…" : "Confirm"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </Layout>
    </RequireAuth>
  );
}

