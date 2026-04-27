import type { CSSProperties } from "react";

export const DEFAULT_EVENT_IMAGE_OBJECT_POSITION = "50% 50%";

/** Narrow frame + taller image so focal preview matches the admin “Home (featured)” modal. */
export const HOME_FEATURED_EVENT_IMAGE_FRAME =
  "relative mx-auto w-full max-w-xl overflow-hidden sm:max-w-2xl";

/** Taller than the old `h-72` strip so posters read better at the same crop. `block` avoids a sub-pixel gap under the img that can look like clipping. `!max-w-none` beats Tailwind preflight `img { max-width: 100% }`, which can shrink the box and make `object-position` appear to do nothing. */
export const HOME_FEATURED_EVENT_IMAGE_IMG =
  "block h-80 w-full !max-w-none object-cover sm:h-[26rem] md:h-[30rem]";

/** Square tile like the admin “Events (card)” preview. */
export const EVENTS_PAGE_CARD_IMAGE_FRAME = "relative aspect-square w-full shrink-0 overflow-hidden bg-muted";

export const EVENTS_PAGE_CARD_IMAGE_IMG =
  "absolute inset-0 h-full w-full !max-w-none object-cover";

/** Admin Preview: outer width so the featured crop uses the same max width as the public home hero (not squeezed in a two-column grid). */
export const ADMIN_PREVIEW_HOME_OUTER = "mx-auto w-full max-w-2xl";

/** Admin Preview: width in the ballpark of one `/events` card in the desktop 3-column grid. */
export const ADMIN_PREVIEW_EVENTS_CARD_OUTER = "mx-auto w-full max-w-[22rem]";

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

/** True when PostgREST reports the `events.starts_at` column is missing (migration not applied yet). */
export function isMissingEventsStartsAtError(error: { message?: string } | null | undefined): boolean {
  const msg = (error?.message ?? "").toLowerCase();
  return msg.includes("starts_at") && (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("could not find"));
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
