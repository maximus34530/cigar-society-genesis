import Layout from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { MembershipRow } from "@/components/account/MembershipRow";
import { normalizePhoneE164Like } from "@/lib/phone";
import { markRecentReauth, hasRecentReauth } from "@/lib/reAuth";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@supabase/supabase-js";
import { Shield, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
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

const changePasswordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string().min(8, "Use at least 8 characters"),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

function getPrimaryProvider(user: User | null): string {
  return user?.app_metadata?.provider ?? "email";
}

function pickString(meta: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = meta[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function extractNameParts(user: User, profileFullName: string | null | undefined): { first: string; last: string } | null {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  let first = pickString(meta, ["given_name"]);
  let last = pickString(meta, ["family_name"]);
  if (!first && !last) {
    const combined = pickString(meta, ["full_name", "name"]);
    if (combined) {
      const parts = combined.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        first = parts[0] ?? "";
        last = parts.slice(1).join(" ");
      } else if (parts.length === 1) {
        first = parts[0] ?? "";
        last = "";
      }
    }
  }
  if (!first && !last && profileFullName?.trim()) {
    const parts = profileFullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      first = parts[0] ?? "";
      last = parts.slice(1).join(" ");
    } else if (parts.length === 1) {
      first = parts[0] ?? "";
      last = "";
    }
  }
  if (!first && !last) return null;
  return { first, last };
}

function extractPhoneFromMeta(user: User): string | null {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const raw = pickString(meta, ["phone", "phone_number"]);
  if (!raw) return null;
  return normalizePhoneE164Like(raw);
}

function initialsForUser(
  first: string | null | undefined,
  last: string | null | undefined,
  full: string | null | undefined,
  email: string | null | undefined,
): string {
  const f = first?.trim() ?? "";
  const l = last?.trim() ?? "";
  if (f && l) return `${f[0] ?? ""}${l[0] ?? ""}`.toUpperCase();
  const fullT = full?.trim() ?? "";
  if (fullT) {
    const parts = fullT.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
    if (parts.length === 1) return `${parts[0][0] ?? "U"}`.toUpperCase();
  }
  const e = email?.trim() ?? "";
  if (e.length >= 2) return e.slice(0, 2).toUpperCase();
  return "U";
}

export default function Account() {
  const { user, profile, refreshProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [savingPersonal, setSavingPersonal] = useState(false);
  const [busySecurity, setBusySecurity] = useState<null | "reauth" | "password">(null);
  const [reauthOpen, setReauthOpen] = useState(false);
  const profileSyncDoneKeyRef = useRef<string | null>(null);

  const provider = useMemo(() => getPrimaryProvider(user), [user]);
  const isGoogleOAuth = provider === "google";

  useEffect(() => {
    if (searchParams.get("reauth") !== "1") return;
    markRecentReauth();
    const next = new URLSearchParams(searchParams);
    next.delete("reauth");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!user?.id || !profile) return;
    const key = `${user.id}:${profile.id}`;
    if (profileSyncDoneKeyRef.current === key) return;

    void (async () => {
      const updates: {
        first_name?: string | null;
        last_name?: string | null;
        full_name?: string | null;
        phone?: string | null;
      } = {};

      const missingStructuredName = !profile.first_name?.trim() && !profile.last_name?.trim();
      if (missingStructuredName) {
        const parts = extractNameParts(user, profile.full_name);
        if (parts && (parts.first || parts.last)) {
          updates.first_name = parts.first || null;
          updates.last_name = parts.last || null;
          updates.full_name = `${parts.first} ${parts.last}`.trim() || profile.full_name;
        }
      }

      if (!profile.phone?.trim()) {
        const fromMeta = extractPhoneFromMeta(user);
        if (fromMeta) updates.phone = fromMeta;
      }

      if (Object.keys(updates).length === 0) {
        profileSyncDoneKeyRef.current = key;
        return;
      }

      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) return;
      profileSyncDoneKeyRef.current = key;
      await refreshProfile();
    })();
  }, [user, profile, refreshProfile]);

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

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const signInMethodLabel = useMemo(() => {
    if (isGoogleOAuth) return "Google";
    if (provider === "email") return "Email + password";
    return provider;
  }, [isGoogleOAuth, provider]);

  const displayEmail = user?.email ?? "";
  const displayName =
    profile?.full_name?.trim() ||
    `${profile?.first_name?.trim() ?? ""} ${profile?.last_name?.trim() ?? ""}`.trim() ||
    displayEmail ||
    "Member";

  const avatarInitials = initialsForUser(profile?.first_name, profile?.last_name, profile?.full_name, displayEmail);

  const ensurePasswordReauth = (): boolean => {
    if (hasRecentReauth()) return true;
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
                  <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/30 p-4">
                    <Avatar className="h-14 w-14 border border-border/60 shrink-0">
                      <AvatarFallback className="bg-muted font-heading text-lg text-foreground/90">{avatarInitials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">Signed in as</p>
                      <p className="mt-1 font-heading text-base text-foreground truncate">{displayName}</p>
                      <p className="mt-0.5 font-body text-sm text-muted-foreground truncate">{displayEmail}</p>
                      <p className="mt-2 font-body text-xs text-muted-foreground/80">Email is tied to your sign-in and can’t be changed here.</p>
                    </div>
                  </div>

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
                  <div className="rounded-xl border border-border/60 bg-card/30 p-4 space-y-2">
                    <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">Sign-in method</p>
                    <p className="font-heading text-base text-foreground">{signInMethodLabel}</p>
                    <p className="font-body text-sm text-muted-foreground">
                      <span className="text-foreground/85">Email:</span> {displayEmail || "—"}
                    </p>
                  </div>

                  {isGoogleOAuth ? (
                    <p className="rounded-xl border border-border/60 bg-card/30 p-4 font-body text-sm text-muted-foreground">
                      You signed in with Google. Password changes are not available for this account—use your Google account to manage access.
                    </p>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-between border-border/70">
                          <span>Change password</span>
                          <span className="text-xs text-muted-foreground">Email sign-in</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Change password</DialogTitle>
                        </DialogHeader>
                        <Form {...passwordForm}>
                          <form
                            className="space-y-4"
                            onSubmit={passwordForm.handleSubmit(async (values) => {
                              if (!ensurePasswordReauth()) {
                                toast({
                                  title: "Confirm it’s you",
                                  description: "Enter your current password in the dialog, then try again.",
                                });
                                return;
                              }

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
                              <Button
                                type="submit"
                                disabled={busySecurity !== null}
                                className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
                              >
                                {busySecurity === "password" ? "Updating…" : "Update password"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>

              <MembershipRow />
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
                    toast({ title: "Confirmed", description: "You can update your password." });
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
                      <FormLabel>Current password</FormLabel>
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
