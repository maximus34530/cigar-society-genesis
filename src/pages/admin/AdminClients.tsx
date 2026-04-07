import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", notes: "" },
  });

  const title = useMemo(() => (editing ? "Edit client" : "New client"), [editing]);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id,name,email,phone,notes,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRows((data as ClientRow[]) ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <Card className="bg-card/40 border-border/60">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="font-heading">Clients</CardTitle>
          <p className="mt-1 font-body text-sm text-muted-foreground">Manage your client list.</p>
        </div>

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

                  await load();
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
      </CardHeader>

      <CardContent>
        {loading ? (
          <p className="font-body text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
            <p className="font-heading text-lg text-muted-foreground/90">No clients yet</p>
            <p className="mt-2 font-body text-sm text-muted-foreground/70">Add a client to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
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
                      if (!error) await load();
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

