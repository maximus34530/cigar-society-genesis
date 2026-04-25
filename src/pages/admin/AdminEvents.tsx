import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  formatEventImageFocal,
  parseEventImageFocal,
  eventImageObjectStyle,
  isMissingEventsImageObjectPositionError,
  ADMIN_PREVIEW_EVENTS_CARD_OUTER,
  ADMIN_PREVIEW_HOME_OUTER,
  HOME_FEATURED_EVENT_IMAGE_FRAME,
  HOME_FEATURED_EVENT_IMAGE_IMG,
  EVENTS_PAGE_CARD_IMAGE_FRAME,
  EVENTS_PAGE_CARD_IMAGE_IMG,
} from "@/lib/eventImagePosition";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { CloudUpload, Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type EventRow = {
  id: string;
  name: string;
  date: string;
  time: string;
  price: number | null;
  capacity_total: number | null;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  image_object_position: string | null;
  is_active: boolean | null;
  created_at: string | null;
  deleted_at?: string | null;
};

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  price: z
    .string()
    .optional()
    .refine((v) => !v || Number.isFinite(Number(v)), "Enter a number"),
  capacityTotal: z
    .string()
    .optional()
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0), "Enter a whole number (0 or higher)"),
  description: z.string().optional(),
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
  const [archiving, setArchiving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEventId, setPreviewEventId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [imageFocal, setImageFocal] = useState({ x: 50, y: 50 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmingPermanentDelete, setConfirmingPermanentDelete] = useState<EventRow | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const imageFocalRef = useRef(imageFocal);
  imageFocalRef.current = imageFocal;
  const previewEventIdRef = useRef(previewEventId);
  previewEventIdRef.current = previewEventId;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      date: "",
      time: "",
      price: "",
      capacityTotal: "",
      description: "",
    },
  });

  const title = useMemo(() => (editing ? "Edit event" : "New event"), [editing]);

  const previewEvent = useMemo(() => {
    if (!previewEventId) return null;
    return rows.find((r) => r.id === previewEventId) ?? null;
  }, [rows, previewEventId]);

  const previewSessionRef = useRef<{ open: boolean; id: string | null }>({ open: false, id: null });

  useEffect(() => {
    if (open && !editing) {
      setImageFocal({ x: 50, y: 50 });
    }
  }, [open, editing]);

  useEffect(() => {
    if (!previewOpen || !previewEventId) {
      previewSessionRef.current = { open: previewOpen, id: null };
      return;
    }

    const prev = previewSessionRef.current;
    const openedNow = !prev.open && previewOpen;
    const idChanged = previewEventId !== prev.id;
    previewSessionRef.current = { open: previewOpen, id: previewEventId };

    if (!openedNow && !idChanged) return;

    const row = rows.find((r) => r.id === previewEventId);
    if (row) setImageFocal(parseEventImageFocal(row.image_object_position));
  }, [previewOpen, previewEventId, rows]);

  const setFocalFromPointer = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setImageFocal({
      x: Math.round(Math.min(100, Math.max(0, x))),
      y: Math.round(Math.min(100, Math.max(0, y))),
    });
  };

  const load = async () => {
    setLoading(true);
    try {
      const selectWithFocal =
        "id,name,date,time,price,capacity_total,description,image_url,image_path,image_object_position,is_active,created_at,deleted_at";
      const selectLegacy =
        "id,name,date,time,price,capacity_total,description,image_url,image_path,is_active,created_at,deleted_at";

      const runListQuery = (cols: string) => {
        const q = supabase
          .from("events")
          .select(cols)
          .order("date", { ascending: true })
          .order("time", { ascending: true });
        return showTrash ? q.not("deleted_at", "is", null) : q.is("deleted_at", null);
      };

      let { data, error } = await runListQuery(selectWithFocal);
      if (error && isMissingEventsImageObjectPositionError(error)) {
        ({ data, error } = await runListQuery(selectLegacy));
        if (!error && data) {
          data = data.map((r) => ({ ...r, image_object_position: null }));
        }
      }
      if (error) throw error;
      setRows((data as EventRow[]) ?? []);
    } finally {
      setLoading(false);
    }
  };

  const flushPreviewFocalToDb = useCallback(async () => {
    const id = previewEventIdRef.current;
    const { x, y } = imageFocalRef.current;
    if (!id) return;
    const focal = formatEventImageFocal(x, y);
    const { error } = await supabase.from("events").update({ image_object_position: focal }).eq("id", id);
    if (error) {
      form.setError("root", { message: `Could not save image framing: ${error.message}` });
      const missingCol = isMissingEventsImageObjectPositionError(error);
      toast({
        variant: "destructive",
        title: missingCol ? "Add the image framing column in Supabase" : "Could not save image framing",
        description: missingCol
          ? "Run the SQL from repo file supabase/migrations/20260416180000_event_image_object_position.sql in Dashboard → SQL Editor (or supabase db push). PostgREST refreshes the schema cache within about a minute."
          : error.message,
      });
    }
  }, [form]);

  useEffect(() => {
    if (!previewOpen || !previewEventId) return;
    const t = window.setTimeout(() => {
      void flushPreviewFocalToDb();
    }, 450);
    return () => window.clearTimeout(t);
  }, [previewOpen, previewEventId, imageFocal.x, imageFocal.y, flushPreviewFocalToDb]);

  const resetEditor = () => {
    void flushPreviewFocalToDb();
    setEditing(null);
    setPreviewOpen(false);
    setPreviewEventId(null);
    setImageFocal({ x: 50, y: 50 });
    setImageFile(null);
    setRemoveImage(false);
    setDragOver(false);
    form.reset({
      name: "",
      date: "",
      time: "",
      price: "",
      capacityTotal: "",
      description: "",
    });
  };

  const upsertDraft = async (values: Values) => {
    // New events start unpublished; editing keeps the current live/draft state. Publishing is explicit from Preview (Upload).
    const basePayload = {
      name: values.name,
      date: values.date,
      time: values.time,
      price: values.price ? Number(values.price) : null,
      capacity_total: values.capacityTotal?.trim() ? Number(values.capacityTotal) : null,
      description: values.description?.trim() ? values.description.trim() : null,
      is_active: editing ? Boolean(editing.is_active) : false,
      deleted_at: editing?.deleted_at ?? null,
    };

    const { data: saved, error: saveError } = editing
      ? await supabase.from("events").update(basePayload).eq("id", editing.id).select("id,image_path").single()
      : await supabase.from("events").insert(basePayload).select("id,image_path").single();

    if (saveError || !saved) {
      form.setError("root", { message: saveError?.message ?? "Failed to save event" });
      return null;
    }

    const eventId = saved.id as string;

    const focalCss = formatEventImageFocal(imageFocal.x, imageFocal.y);
    await supabase.from("events").update({ image_object_position: focalCss }).eq("id", eventId);
    const previousImagePath = (saved.image_path as string | null) ?? null;

    if (removeImage && previousImagePath) {
      await supabase.storage.from("event-images").remove([previousImagePath]);
      await supabase.from("events").update({ image_path: null }).eq("id", eventId);
    }

    if (imageFile) {
      if (!ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
        form.setError("root", { message: "Please upload a JPG, PNG, or WebP image." });
        return null;
      }
      if (imageFile.size > MAX_IMAGE_BYTES) {
        form.setError("root", { message: "Image must be 25MB or smaller." });
        return null;
      }

      const ext = extFromFile(imageFile);
      const objectPath = `events/${eventId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("event-images").upload(objectPath, imageFile, {
        upsert: true,
        contentType: imageFile.type,
      });

      if (uploadError) {
        form.setError("root", { message: uploadError.message });
        return null;
      }

      if (previousImagePath && previousImagePath !== objectPath) {
        await supabase.storage.from("event-images").remove([previousImagePath]);
      }

      await supabase.from("events").update({ image_path: objectPath }).eq("id", eventId);
    }

    await load();
    return eventId;
  };

  const archiveEventById = async (eventId: string) => {
    const { error: archiveError } = await supabase
      .from("events")
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq("id", eventId);
    if (archiveError) {
      form.setError("root", { message: archiveError.message });
      return false;
    }
    await load();
    return true;
  };

  const publishEventById = async (eventId: string) => {
    const { error } = await supabase.from("events").update({ is_active: true, deleted_at: null }).eq("id", eventId);
    if (error) {
      form.setError("root", { message: error.message });
      return false;
    }
    await load();
    return true;
  };

  useEffect(() => {
    void load();
  }, [showTrash]);

  useEffect(() => {
    if (imageFile) setImageFocal({ x: 50, y: 50 });
  }, [imageFile]);

  return (
    <Card className="bg-card/40 border-border/60">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="font-heading">Events</CardTitle>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            {showTrash ? "Archive — events are kept for 30 days." : "Create and manage public event listings."}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) {
                resetEditor();
              }
            }}
          >
            {!showTrash ? (
              <DialogTrigger asChild>
                <Button className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
                  New event
                </Button>
              </DialogTrigger>
            ) : null}
            <DialogContent className="w-[calc(100vw-1.25rem)] max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain border-border/60 bg-background sm:w-full">
              <DialogHeader>
                <DialogTitle className="font-heading">{title}</DialogTitle>
              </DialogHeader>

            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(async (values) => {
                  if (archiving || publishing) return;
                  const eventId = await upsertDraft(values);
                  if (!eventId) return;

                  // Archive edit: save in-place and stay in Archive (no preview/publish flow).
                  if (showTrash) {
                    setOpen(false);
                    return;
                  }

                  // Active edit/create: open preview before publishing.
                  setPreviewEventId(eventId);
                  setPreviewOpen(true);
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

                <FormField
                  control={form.control}
                  name="capacityTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity cap</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode="numeric"
                          className="bg-card border-border"
                          placeholder="Leave blank for unlimited"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {showTrash && editing ? (
                    <Button
                      type="button"
                      variant="destructive"
                      className="sm:mr-auto"
                      onClick={() => {
                        setConfirmingPermanentDelete(editing);
                        setOpen(false);
                      }}
                    >
                      Delete
                    </Button>
                  ) : (
                    <span />
                  )}

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    {!showTrash ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-border/70"
                        disabled={archiving}
                        onClick={() => {
                          setArchiving(true);
                          void form.handleSubmit(async (values) => {
                            try {
                              const eventId = await upsertDraft(values);
                              if (!eventId) return;
                              const ok = await archiveEventById(eventId);
                              if (!ok) return;
                              await flushPreviewFocalToDb();
                              setPreviewOpen(false);
                              setPreviewEventId(null);
                              setOpen(false);
                              setShowTrash(true);
                            } finally {
                              setArchiving(false);
                            }
                          })();
                        }}
                      >
                        Save later
                      </Button>
                    ) : null}
                    <Button type="submit" className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90">
                      Save
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={previewOpen}
            onOpenChange={(next) => {
              if (!next) {
                void flushPreviewFocalToDb().then(() => void load());
              }
              setPreviewOpen(next);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">Preview</DialogTitle>
              </DialogHeader>

              {previewEvent ? (
                <div className="space-y-5">
                  <p className="font-body text-sm text-muted-foreground">
                    Drag a preview or use the sliders. Boxes below use the same crop classes as the public site (wide hero and
                    square card).
                  </p>

                  <Alert className="border-border/60 bg-card/40">
                    <Info className="h-4 w-4" aria-hidden />
                    <AlertDescription className="font-body text-muted-foreground">
                      {previewEvent.is_active ? (
                        <>
                          This event is <strong className="text-foreground">live</strong>. Framing saves to the database—switch
                          to the home or events tab and refocus the window if the image looks cached. The large home hero is the{" "}
                          <strong className="text-foreground">soonest upcoming</strong> published event; if another event is
                          earlier by date, find this one in the smaller “Also coming up” strip or on{" "}
                          <strong className="text-foreground">/events</strong>.
                        </>
                      ) : (
                        <>
                          This listing is still a <strong className="text-foreground">draft</strong>. The public home and
                          events pages only show published events—click <strong className="text-foreground">Upload</strong> to
                          publish, then framing matches what visitors see.
                        </>
                      )}
                    </AlertDescription>
                  </Alert>

                  {previewEvent.image_path || previewEvent.image_url ? (
                    <div className="space-y-8">
                      <div className={ADMIN_PREVIEW_HOME_OUTER}>
                        <p className="mb-2 font-body text-xs uppercase tracking-widest text-muted-foreground">
                          Home (featured strip — same max width as the site)
                        </p>
                        <div
                          className={cn(
                            HOME_FEATURED_EVENT_IMAGE_FRAME,
                            "cursor-crosshair rounded-t-2xl border border-border/60 bg-muted",
                          )}
                          onPointerDown={(e) => setFocalFromPointer(e)}
                        >
                          <img
                            src={
                              previewEvent.image_path
                                ? getPublicEventImageUrl(previewEvent.image_path)
                                : previewEvent.image_url ?? undefined
                            }
                            alt=""
                            className={HOME_FEATURED_EVENT_IMAGE_IMG}
                            style={eventImageObjectStyle(formatEventImageFocal(imageFocal.x, imageFocal.y))}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </div>
                      <div className={ADMIN_PREVIEW_EVENTS_CARD_OUTER}>
                        <p className="mb-2 font-body text-xs uppercase tracking-widest text-muted-foreground">
                          Events page (card tile)
                        </p>
                        <div
                          className={cn(
                            EVENTS_PAGE_CARD_IMAGE_FRAME,
                            "cursor-crosshair rounded-t-xl border border-border/60 bg-muted",
                          )}
                          onPointerDown={(e) => setFocalFromPointer(e)}
                        >
                          <img
                            src={
                              previewEvent.image_path
                                ? getPublicEventImageUrl(previewEvent.image_path)
                                : previewEvent.image_url ?? undefined
                            }
                            alt=""
                            className={EVENTS_PAGE_CARD_IMAGE_IMG}
                            style={eventImageObjectStyle(formatEventImageFocal(imageFocal.x, imageFocal.y))}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="font-body text-sm text-muted-foreground">Add an event image in the form to preview crops.</p>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-body text-sm">Horizontal</Label>
                        <span className="font-body text-xs text-muted-foreground">{imageFocal.x}%</span>
                      </div>
                      <Slider
                        value={[imageFocal.x]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(v) => setImageFocal((prev) => ({ ...prev, x: v[0] ?? prev.x }))}
                        onValueCommit={() => {
                          void flushPreviewFocalToDb();
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="font-body text-sm">Vertical</Label>
                        <span className="font-body text-xs text-muted-foreground">{imageFocal.y}%</span>
                      </div>
                      <Slider
                        value={[imageFocal.y]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(v) => setImageFocal((prev) => ({ ...prev, y: v[0] ?? prev.y }))}
                        onValueCommit={() => {
                          void flushPreviewFocalToDb();
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-card/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-heading text-base text-foreground">{previewEvent.name}</p>
                      <Badge variant="outline" className="border-border/60 text-muted-foreground font-body">
                        {previewEvent.is_active ? "Live" : "Draft"}
                      </Badge>
                    </div>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                      {previewEvent.date} • {previewEvent.time} {previewEvent.price != null ? `• $${previewEvent.price}` : ""}
                    </p>
                    {previewEvent.description ? (
                      <p className="mt-3 font-body text-sm text-muted-foreground">{previewEvent.description}</p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="font-body text-sm text-muted-foreground">Loading preview…</p>
              )}

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-border/70"
                  disabled={publishing}
                  onClick={() => {
                    void flushPreviewFocalToDb().then(() => void load());
                    setPreviewOpen(false);
                  }}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
                  disabled={publishing || !previewEventId}
                  onClick={async () => {
                    if (!previewEventId) return;
                    setPublishing(true);
                    try {
                      await flushPreviewFocalToDb();
                      const ok = await publishEventById(previewEventId);
                      if (!ok) return;
                      setPreviewOpen(false);
                      setOpen(false);
                      setPreviewEventId(null);
                      setShowTrash(false);
                    } finally {
                      setPublishing(false);
                    }
                  }}
                >
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-border/60 font-body",
                        row.is_active ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {row.is_active ? "Published" : "Draft"}
                    </Badge>
                    {row.capacity_total != null ? (
                      <Badge variant="outline" className="border-border/60 text-muted-foreground font-body">
                        Cap: {row.capacity_total}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {showTrash ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-border/70"
                        onClick={() => {
                          setEditing(row);
                          setImageFile(null);
                          setRemoveImage(false);
                          setImageFocal(parseEventImageFocal(row.image_object_position));
                          form.reset({
                            name: row.name,
                            date: row.date,
                            time: row.time,
                            price: row.price?.toString() ?? "",
                            capacityTotal: row.capacity_total != null ? String(row.capacity_total) : "",
                            description: row.description ?? "",
                          });
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
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
                          setImageFocal(parseEventImageFocal(row.image_object_position));
                          form.reset({
                            name: row.name,
                            date: row.date,
                            time: row.time,
                            price: row.price?.toString() ?? "",
                            capacityTotal: row.capacity_total != null ? String(row.capacity_total) : "",
                            description: row.description ?? "",
                          });
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className={cn("border-border/70", showTrash ? "text-primary border-primary/40" : "text-foreground/70")}
            onClick={() => setShowTrash((v) => !v)}
          >
            {showTrash ? "Back to events" : "Archive"}
          </Button>
        </div>
      </CardContent>

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

