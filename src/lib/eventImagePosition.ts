import type { CSSProperties } from "react";

export const DEFAULT_EVENT_IMAGE_OBJECT_POSITION = "50% 50%";

/** Narrow frame + taller image so focal preview matches the admin “Home (featured)” modal. */
export const HOME_FEATURED_EVENT_IMAGE_FRAME =
  "relative mx-auto w-full max-w-xl overflow-hidden sm:max-w-2xl";

/** Taller than the old `h-72` strip so posters read better at the same crop. */
export const HOME_FEATURED_EVENT_IMAGE_IMG =
  "h-80 w-full sm:h-[26rem] md:h-[30rem]";

/** Square tile like the admin “Events (card)” preview. */
export const EVENTS_PAGE_CARD_IMAGE_FRAME = "relative aspect-square w-full shrink-0 overflow-hidden bg-muted";

export const EVENTS_PAGE_CARD_IMAGE_IMG = "absolute inset-0 h-full w-full";

/** True when PostgREST reports the `events.image_object_position` column is missing (migration not applied yet). */
export function isMissingEventsImageObjectPositionError(
  error: { message?: string } | null | undefined,
): boolean {
  const msg = (error?.message ?? "").toLowerCase();
  return (
    msg.includes("image_object_position") &&
    (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("could not find"))
  );
}

/** Parse stored CSS object-position "x% y%" into focal percentages. */
export function parseEventImageFocal(css: string | null | undefined): { x: number; y: number } {
  if (!css?.trim()) return { x: 50, y: 50 };
  const parts = css.trim().split(/\s+/);
  if (parts.length < 2) return { x: 50, y: 50 };
  const x = Number.parseFloat(parts[0].replace("%", ""));
  const y = Number.parseFloat(parts[1].replace("%", ""));
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { x: 50, y: 50 };
  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
  };
}

export function formatEventImageFocal(x: number, y: number): string {
  const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)));
  return `${clamp(x)}% ${clamp(y)}%`;
}

/** Use for `<img className="… h-full w-full …">` heroes so focal point always wins over any `object-*` utilities. */
export function eventImageObjectStyle(css: string | null | undefined): CSSProperties {
  const pos = css?.trim() ? css.trim() : DEFAULT_EVENT_IMAGE_OBJECT_POSITION;
  return { objectFit: "cover", objectPosition: pos };
}
