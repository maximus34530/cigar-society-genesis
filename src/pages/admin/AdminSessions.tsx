import SectionHeading from "@/components/SectionHeading";
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

type SessionCategory = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number | null;
  price: number | null;
  is_active: boolean;
  created_at: string;
};

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  durationMinutes: z
    .string()
    .optional()
    .refine((v) => !v || Number.isFinite(Number(v)), "Enter a number"),
  price: z
    .string()
    .optional()
    .refine((v) => !v || Number.isFinite(Number(v)), "Enter a number"),
});

type Values = z.infer<typeof schema>;

export default function AdminSessions() {
  const [rows, setRows] = useState<SessionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SessionCategory | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", durationMinutes: "", price: "" },
  });

  const title = useMemo(() => (editing ? "Edit session category" : "New session category"), [editing]);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("session_categories")
        .select("id,name,description,duration_minutes,price,is_active,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRows((data as SessionCategory[]) ?? []);
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
          <CardTitle className="font-heading">Sessions</CardTitle>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Manage session categories (services you offer).
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) {
              setEditing(null);
              form.reset({ name: "", description: "", durationMinutes: "", price: "" });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
              New session
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
                    description: values.description?.trim() ? values.description.trim() : null,
                    duration_minutes: values.durationMinutes ? Number(values.durationMinutes) : null,
                    price: values.price ? Number(values.price) : null,
                  };

                  const query = editing
                    ? supabase.from("session_categories").update(payload).eq("id", editing.id)
                    : supabase.from("session_categories").insert(payload);

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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} className="bg-card border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="numeric" className="bg-card border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="decimal" className="bg-card border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

      <CardContent className="space-y-4">
        <SectionHeading title="Session categories" subtitle="These define what customers can book." />

        {loading ? (
          <p className="font-body text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
            <p className="font-heading text-lg text-muted-foreground/90">No sessions yet</p>
            <p className="mt-2 font-body text-sm text-muted-foreground/70">
              Create your first session category to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/30 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-heading text-base text-foreground">{row.name}</p>
                  {row.description ? (
                    <p className="mt-1 font-body text-sm text-muted-foreground line-clamp-2">{row.description}</p>
                  ) : null}
                  <p className="mt-2 font-body text-xs text-muted-foreground/80">
                    {row.duration_minutes ? `${row.duration_minutes} min` : "No duration"}{" "}
                    {row.price != null ? `• $${row.price}` : ""}
                  </p>
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
                        description: row.description ?? "",
                        durationMinutes: row.duration_minutes?.toString() ?? "",
                        price: row.price?.toString() ?? "",
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
                      const { error } = await supabase.from("session_categories").delete().eq("id", row.id);
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

