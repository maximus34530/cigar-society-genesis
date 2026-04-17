import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "client" | "user";
  created_at: string;
};

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function AdminClients() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [activeView, setActiveView] = useState<"users" | "clients">("users");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", notes: "" },
  });

  const title = useMemo(() => (editing ? "Edit client" : "New client"), [editing]);

  const loadProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,full_name,avatar_url,role,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProfiles((data as ProfileRow[]) ?? []);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const loadClients = async () => {
    setLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id,name,email,phone,notes,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setClients((data as ClientRow[]) ?? []);
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    void loadProfiles();
    void loadClients();
  }, []);

  return (
    <Card className="bg-card/40 border-border/60">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="font-heading">Clients</CardTitle>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            View registered users (from Supabase Auth) and manage your manual client list.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            className={cn("border-border/70", activeView === "users" ? "text-primary border-primary/40" : "text-foreground/70")}
            onClick={() => setActiveView("users")}
          >
            Registered users ({profiles.length})
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "border-border/70",
              activeView === "clients" ? "text-primary border-primary/40" : "text-foreground/70",
            )}
            onClick={() => setActiveView("clients")}
          >
            Manual clients ({clients.length})
          </Button>

          {activeView === "clients" ? (
            <Dialog
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) {
                  setEditing(null);
                  form.reset({ name: "", email: "", phone: "", notes: "" });
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
                  New client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-heading">{title}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(async (values) => {
                      const payload = {
                        name: values.name,
                        email: values.email?.trim() ? values.email.trim() : null,
                        phone: values.phone?.trim() ? values.phone.trim() : null,
                        notes: values.notes?.trim() ? values.notes.trim() : null,
                      };

                      const query = editing
                        ? supabase.from("clients").update(payload).eq("id", editing.id)
                        : supabase.from("clients").insert(payload);

                      const { error } = await query;
                      if (error) {
                        form.setError("root", { message: error.message });
                        return;
                      }

                      await loadClients();
                      setOpen(false);
                    })}
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-card border-border" />
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
                          <FormLabel>Email (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" autoComplete="email" className="bg-card border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" autoComplete="tel" className="bg-card border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} className="bg-card border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.formState.errors.root?.message ? (
                      <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                    ) : null}

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
                        Save
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        {activeView === "users" ? (
          loadingProfiles ? (
            <p className="font-body text-sm text-muted-foreground">Loading users…</p>
          ) : profiles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
              <p className="font-heading text-lg text-muted-foreground/90">No users yet</p>
              <p className="mt-2 font-body text-sm text-muted-foreground/70">
                Once people sign up, they’ll appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/30 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-base text-foreground">
                        {row.full_name?.trim() ? row.full_name : "Unnamed user"}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-body ring-1",
                          row.role === "admin"
                            ? "bg-primary/10 text-primary ring-primary/20"
                            : row.role === "client"
                              ? "bg-muted/60 text-foreground/80 ring-border/60"
                              : "bg-background/40 text-muted-foreground ring-border/50",
                        )}
                      >
                        {row.role}
                      </span>
                    </div>
                    <p className="mt-1 font-body text-xs text-muted-foreground truncate">{row.id}</p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" className="border-border/70" onClick={() => void loadProfiles()}>
                      Refresh
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : loadingClients ? (
          <p className="font-body text-sm text-muted-foreground">Loading clients…</p>
        ) : clients.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
            <p className="font-heading text-lg text-muted-foreground/90">No manual clients yet</p>
            <p className="mt-2 font-body text-sm text-muted-foreground/70">Add a client to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/30 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-heading text-base text-foreground">{row.name}</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    {row.email ? row.email : "No email"} {row.phone ? `• ${row.phone}` : ""}
                  </p>
                  {row.notes ? (
                    <p className="mt-2 font-body text-xs text-muted-foreground/80 line-clamp-2">{row.notes}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border/70"
                    onClick={() => {
                      setEditing(row);
                      form.reset({
                        name: row.name,
                        email: row.email ?? "",
                        phone: row.phone ?? "",
                        notes: row.notes ?? "",
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={async () => {
                      const { error } = await supabase.from("clients").delete().eq("id", row.id);
                      if (!error) await loadClients();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

