import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(120),
  avatar_url: z
    .string()
    .max(2000)
    .refine((v) => !v.trim() || /^https?:\/\//i.test(v.trim()), {
      message: "Use a full http(s) image URL, or leave blank",
    }),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function AccountProfilePage() {
  const { user, profile, isAdmin, refreshProfile } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name?.trim() ?? "",
      avatar_url: profile?.avatar_url?.trim() ?? "",
    },
  });

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="md:col-span-1 bg-card/40 border-border/60">
        <CardHeader>
          <CardTitle className="font-heading">Signed in as</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-border/60">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
              <AvatarFallback className="bg-muted text-foreground/80">
                {(profile?.full_name?.trim()?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-body text-sm text-foreground truncate">{user?.email}</p>
              <p className="mt-1 inline-flex rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-xs font-body text-foreground/70">
                Role: {profile?.role ?? "user"}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full border-border/70">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          {isAdmin ? (
            <Button asChild className="w-full bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
              <Link to="/admin">Admin</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 bg-card/40 border-border/60">
        <CardHeader>
          <CardTitle className="font-heading">Profile & security</CardTitle>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Updates apply to your member profile. Use a public image URL for your avatar, or leave it blank.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit(async (values) => {
                if (!user) return;
                setSavingProfile(true);
                try {
                  const { error } = await supabase
                    .from("profiles")
                    .update({
                      full_name: values.full_name.trim(),
                      avatar_url: values.avatar_url.trim() || null,
                    })
                    .eq("id", user.id);
                  if (error) throw error;
                  await refreshProfile();
                  toast({ title: "Profile saved", description: "Your details were updated." });
                } catch (e) {
                  toast({
                    title: "Couldn’t save profile",
                    description: e instanceof Error ? e.message : "Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setSavingProfile(false);
                }
              })}
            >
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="name" className="bg-card border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar image URL (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" placeholder="https://…" className="bg-card border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={savingProfile}
                className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
              >
                {savingProfile ? "Saving…" : "Save profile"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 rounded-xl border border-border/60 bg-card/30 p-4 space-y-4">
            <p className="font-heading text-sm text-foreground">Change password</p>
            <p className="font-body text-xs text-muted-foreground">Leave blank to keep your current password.</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium leading-none" htmlFor="acct-new-password">
                  New password
                </label>
                <Input
                  id="acct-new-password"
                  type="password"
                  autoComplete="new-password"
                  className="mt-2 bg-card border-border"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium leading-none" htmlFor="acct-confirm-password">
                  Confirm new password
                </label>
                <Input
                  id="acct-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  className="mt-2 bg-card border-border"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={savingPassword}
              onClick={async () => {
                const np = newPassword.trim();
                const cp = confirmPassword.trim();
                if (!np) {
                  toast({ title: "Nothing to change", description: "Enter a new password first.", variant: "destructive" });
                  return;
                }
                if (np.length < 8) {
                  toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
                  return;
                }
                if (np !== cp) {
                  toast({ title: "Passwords do not match", variant: "destructive" });
                  return;
                }
                setSavingPassword(true);
                try {
                  const { error } = await supabase.auth.updateUser({ password: np });
                  if (error) throw error;
                  setNewPassword("");
                  setConfirmPassword("");
                  toast({ title: "Password updated", description: "Your password was changed." });
                } catch (e) {
                  toast({
                    title: "Couldn’t update password",
                    description: e instanceof Error ? e.message : "Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setSavingPassword(false);
                }
              }}
            >
              {savingPassword ? "Updating…" : "Update password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
