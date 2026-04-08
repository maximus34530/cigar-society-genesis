import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { CloudUpload, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type EventRow = {
  id: string;
  name: string;
  date: string;
  time: string;
  price: number | null;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  price: z
    .string()
    .optional()
    .refine((v) => !v || Number.isFinite(Number(v)), "Enter a number"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type Values = z.infer<typeof schema>;

const MAX_IMAGE_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getPublicEventImageUrl(path: string) {
  return supabase.storage.from("event-images").getPublicUrl(path).data.publicUrl;
}

function extFromFile(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp"].includes(fromName)) return fromName === "jpeg" ? "jpg" : fromName;
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export default function AdminEvents() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<EventRow | null>(null);
  const [confirmingPermanentDelete, setConfirmingPermanentDelete] = useState<EventRow | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      date: "",
      time: "",
      price: "",
      description: "",
      isActive: true,
    },
  });

  const title = useMemo(() => (editing ? "Edit event" : "New event"), [editing]);

  const load = async () => {
    setLoading(true);
    try {
      const base = supabase
        .from("events")
        .select("id,name,date,time,price,description,image_url,image_path,is_active,created_at,deleted_at")
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      const { data, error } = showTrash
        ? await base.not("deleted_at", "is", null)
        : await base.is("deleted_at", null);
      if (error) throw error;
      setRows((data as EventRow[]) ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [showTrash]);

  return (
    <Card className="bg-card/40 border-border/60">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="font-heading">Events</CardTitle>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            {showTrash ? "Trash — events are kept for 30 days." : "Create and manage public event listings."}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            className={cn("border-border/70", showTrash ? "text-foreground/70" : "text-primary border-primary/40")}
            onClick={() => setShowTrash(false)}
          >
            Active
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn("border-border/70", showTrash ? "text-primary border-primary/40" : "text-foreground/70")}
            onClick={() => setShowTrash(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Trash
          </Button>

          {!showTrash ? (
            <Dialog
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) {
                  setEditing(null);
                  setImageFile(null);
                  setRemoveImage(false);
                  setDragOver(false);
                  form.reset({
                    name: "",
                    date: "",
                    time: "",
                    price: "",
                    description: "",
                    isActive: true,
                  });
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="btn-gold-shimmer bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
                  New event
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
                  const basePayload = {
                    name: values.name,
                    date: values.date,
                    time: values.time,
                    price: values.price ? Number(values.price) : null,
                    description: values.description?.trim() ? values.description.trim() : null,
                    is_active: values.isActive,
                  };

                  // 1) Create/update event row (without touching image_path yet)
                  const { data: saved, error: saveError } = editing
                    ? await supabase.from("events").update(basePayload).eq("id", editing.id).select("id,image_path").single()
                    : await supabase.from("events").insert(basePayload).select("id,image_path").single();

                  if (saveError || !saved) {
                    form.setError("root", { message: saveError?.message ?? "Failed to save event" });
                    return;
                  }

                  const eventId = saved.id as string;
                  const previousImagePath = (saved.image_path as string | null) ?? null;

                  // 2) Handle image removal/replacement
                  if (removeImage && previousImagePath) {
                    await supabase.storage.from("event-images").remove([previousImagePath]);
                    await supabase.from("events").update({ image_path: null }).eq("id", eventId);
                  }

                  if (imageFile) {
                    if (!ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
                      form.setError("root", { message: "Please upload a JPG, PNG, or WebP image." });
                      return;
                    }
                    if (imageFile.size > MAX_IMAGE_BYTES) {
                      form.setError("root", { message: "Image must be 25MB or smaller." });
                      return;
                    }

                    const ext = extFromFile(imageFile);
                    const objectPath = `events/${eventId}/${Date.now()}.${ext}`;

                    const { error: uploadError } = await supabase.storage
                      .from("event-images")
                      .upload(objectPath, imageFile, {
                        upsert: true,
                        contentType: imageFile.type,
                      });

                    if (uploadError) {
                      form.setError("root", { message: uploadError.message });
                      return;
                    }

                    if (previousImagePath && previousImagePath !== objectPath) {
                      await supabase.storage.from("event-images").remove([previousImagePath]);
                    }

                    await supabase.from("events").update({ image_path: objectPath }).eq("id", eventId);
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" className="bg-card border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. 8:00 PM" className="bg-card border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <div className="space-y-2">
                    <p className="text-sm font-body text-muted-foreground">Event image</p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setImageFile(file);
                        if (file) setRemoveImage(false);
                      }}
                    />

                    <button
                      type="button"
                      className={cn(
                        "w-full rounded-xl border border-dashed bg-card/30 px-4 py-6 text-left transition-colors",
                        dragOver
                          ? "border-primary/60 ring-2 ring-primary/20"
                          : "border-border/70 hover:border-primary/40",
                      )}
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOver(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOver(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOver(false);
                        const file = e.dataTransfer.files?.[0] ?? null;
                        setImageFile(file);
                        if (file) setRemoveImage(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 ring-1 ring-border/60">
                          <CloudUpload className="h-5 w-5 text-foreground/70" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-body text-sm text-foreground/80">
                            Drag & drop an image, or{" "}
                            <span className="text-primary underline underline-offset-4">browse</span>
                          </p>
                          <p className="mt-1 font-body text-xs text-muted-foreground/80">
                            JPG/PNG/WebP up to 25MB
                          </p>
                        </div>
                      </div>

                      {imageFile ? (
                        <div className="mt-4 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                          <p className="font-body text-xs text-foreground/80 truncate">{imageFile.name}</p>
                          <p className="mt-0.5 font-body text-[11px] text-muted-foreground/80">
                            {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ) : null}
                    </button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
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
                  <Button type="submit" className="btn-gold-shimmer bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
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
        {loading ? (
          <p className="font-body text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
            <p className="font-heading text-lg text-muted-foreground/90">
              {showTrash ? "Trash is empty" : "No events yet"}
            </p>
            <p className="mt-2 font-body text-sm text-muted-foreground/70">
              {showTrash ? "Deleted events will appear here for 30 days." : "Create your first event to publish it."}
            </p>
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
                    {row.date} • {row.time} {row.price != null ? `• $${row.price}` : ""}
                  </p>
                  {row.image_path ? (
                    <p className="mt-2 font-body text-xs text-muted-foreground/80 truncate">
                      Image: {getPublicEventImageUrl(row.image_path)}
                    </p>
                  ) : null}
                  {row.description ? (
                    <p className="mt-2 font-body text-xs text-muted-foreground/80 line-clamp-2">{row.description}</p>
                  ) : null}
                  <p className="mt-2 font-body text-xs text-muted-foreground/80">
                    Status: {row.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {showTrash ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-border/70"
                        onClick={async () => {
                          await supabase.from("events").update({ deleted_at: null }).eq("id", row.id);
                          await load();
                        }}
                      >
                        Restore
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setConfirmingPermanentDelete(row)}
                      >
                        Delete permanently
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-border/70"
                        onClick={() => {
                          setEditing(row);
                          setImageFile(null);
                          setRemoveImage(false);
                          form.reset({
                            name: row.name,
                            date: row.date,
                            time: row.time,
                            price: row.price?.toString() ?? "",
                            description: row.description ?? "",
                            isActive: row.is_active ?? true,
                          });
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      {row.image_path ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-border/70"
                          onClick={async () => {
                            const { error } = await supabase.from("events").update({ image_path: null }).eq("id", row.id);
                            if (!error) {
                              await supabase.storage.from("event-images").remove([row.image_path]);
                              await load();
                            }
                          }}
                        >
                          Remove image
                        </Button>
                      ) : null}
                      <Button type="button" variant="destructive" onClick={() => setConfirmingDelete(row)}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!confirmingDelete} onOpenChange={(next) => (!next ? setConfirmingDelete(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the event to Trash. You can restore it for 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                const row = confirmingDelete;
                setConfirmingDelete(null);
                if (!row) return;
                await supabase.from("events").update({ deleted_at: new Date().toISOString() }).eq("id", row.id);
                await load();
              }}
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmingPermanentDelete}
        onOpenChange={(next) => (!next ? setConfirmingPermanentDelete(null) : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The event and its image will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                const row = confirmingPermanentDelete;
                setConfirmingPermanentDelete(null);
                if (!row) return;
                if (row.image_path) {
                  await supabase.storage.from("event-images").remove([row.image_path]);
                }
                await supabase.from("events").delete().eq("id", row.id);
                await load();
              }}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

