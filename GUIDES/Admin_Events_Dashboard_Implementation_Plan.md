# Admin Events Dashboard — Implementation Plan (Phase 2)

Issue: **[#142](https://github.com/maximus34530/cigar-society-genesis/issues/142)**  
Scope: **Admin Events** UX only (no coding in this document).  
Goal: A **smooth, modern** admin flow for creating, previewing, publishing, archiving, and deleting events.

**This document is the spec** for implementation issue **[#143](https://github.com/maximus34530/cigar-society-genesis/issues/143)**.

---

## Desired admin experience (what you described)

### Entry + navigation
- Admin logs in → **goes directly to `/admin`** (not profile/settings).
- In admin sidebar, admin clicks **Events**.

### Creating an event
1. Admin clicks yellow **New event** button.
2. Admin fills in the form (at minimum: **name**, **date/time**, **price**, **description**, optional image and capacity cap).
3. Footer has three actions:
   - **Save later** (bottom-left): moves the event to **Archive**
   - **Cancel** (left of Save): discards changes and closes modal
   - **Save** (bottom-right, yellow): saves and opens a **Preview modal**

### Preview → Publish (“Upload”)
4. After Save, show a **Preview** pop-out that looks like the live event card (name/date/time/price/description/image).
5. Preview has actions:
   - **Back**: returns to editing form (lets admin change description etc.)
   - **Upload**: publishes the event so it appears on the public Events page and users can buy tickets.

### Archive
6. If admin presses **Save later**, they are taken to **Archive** view.
7. Archive shows events in a similar list/card layout, but adds the ability to:
   - **Edit** archived events
   - **Delete** archived events (with confirmation)
   - Optionally: **Restore** (move back to active)

---

## Data model (functional CRUD)

### Event “lifecycle” states
We need explicit states so the UI can behave predictably:

- **Draft**: editable, not visible to public
- **Published**: visible to public events list
- **Archived**: hidden from public, stored for later restore/edit, deletable

### Recommended representation (Supabase)
Use the existing pattern in this project (soft delete via `deleted_at`) plus a publish flag:

- `events.is_active` (boolean): **Published** gate (public sees only `is_active = true`)
- `events.deleted_at` (timestamptz nullable): **Archived** when non-null

Mapping:
- **Draft**: `is_active = false` and `deleted_at is null`
- **Published**: `is_active = true` and `deleted_at is null`
- **Archived**: `deleted_at is not null` (regardless of `is_active`)

**Naming note (avoid confusion)**
- “Upload” = “Publish” (set `is_active=true`). We keep the UI label “Upload” because that’s the desired admin wording.

**Why this mapping**
- Public Events page can query: `is_active = true AND deleted_at is null`.
- Archive can query: `deleted_at is not null`.
- Drafts stay in “Active list” but clearly marked as **Draft** (badge).

### Fields (minimum)
- `name` (required)
- `date`, `time` (required)
- `price` (number, >= 0; 0 = free)
- `description` (optional but recommended for publish)
- `image_path` / `image_url` (optional)
- `capacity_total` (optional; for ticket caps)
- `is_active` (publish flag)
- `deleted_at` (archive flag)

---

## UI screens (step-by-step)

### Screen A — `/admin/events` list (Active)
**Shows**:
- Cards or rows for events where `deleted_at is null`
- Each row shows: name, date/time, price, status badge:
  - **Published** if `is_active = true`
  - **Draft** if `is_active = false`

**Actions**:
- **New event** (yellow) → opens “Create event” modal
- **Edit** on an event → opens “Edit event” modal
- **Archive** toggle button (text-only) → navigates to Archive list

### Screen B — Create/Edit modal (Draft-first)
**Header**: “New event” or “Edit event”  
**Body**: form fields  
**Footer (exact layout)**:
- Left: **Save later** (archives event)
- Right: **Cancel** then **Save** (yellow)

**Behavior**:
- **Cancel**: close modal, discard form edits
- **Save later**:
  - Save current values as a **Draft** (if brand-new) OR update existing row
  - Move it to **Archived** (`deleted_at = now()`)
  - Navigate admin to Archive view (or flip the view automatically)
- **Save**:
  - Save current values as a **Draft** (not published yet)
  - Open Preview modal (Screen C)

### Screen C — Preview modal (Draft preview)
**Purpose**: show a “draft product” preview of the live card.

**Content**:
- Use the same layout as public event cards (image, name, date/time, price, description).
- Include badges: Draft/Published.

**Actions**:
- **Back**: closes preview, returns to edit modal with the same form state
- **Upload**: publishes the event

**Behavior on Upload**:
- Set `is_active = true` (publish)
- Ensure `deleted_at is null` (must be active)
- Close preview
- Refresh the Active events list
- Show toast: “Event is live”

---

## Archive behavior

### Screen D — Archive list
**Shows**: rows where `deleted_at is not null`

**Actions per archived event**:
- **Edit**: open edit modal
  - Footer for archive edit should emphasize:
    - **Delete** (danger, left)
    - **Cancel** + **Save** (right)
  - Do **not** show “Save later” inside archive edit (it’s already archived)
- **Restore** (optional but recommended):
  - Set `deleted_at = null`
  - Keep `is_active` as-is (restore as Draft or Published depending on prior choice)
- **Delete permanently**:
  - Remove row entirely (and storage image if present)
  - Confirm dialog required

---

## CRUD matrix (functional definition)

| Action | Where | DB change | Visible result |
|---|---|---|---|
| Create draft | New event → Save | Insert event with `is_active=false`, `deleted_at=null` | Appears in Active list with Draft badge |
| Publish | Preview → Upload | Update `is_active=true`, `deleted_at=null` | Appears on public `/events` |
| Update draft/published | Edit → Save | Update fields | Card updates |
| Archive | Edit → Save later | Update `deleted_at=now()` | Disappears from Active list; appears in Archive |
| Restore | Archive → Restore | Update `deleted_at=null` | Back to Active list |
| Delete permanently | Archive → Delete | Delete row (+ remove image) | Removed completely |

---

## Permissions / security (must-have)

- **Admin-only** write access to `events` (create/update/archive/delete).
- Public can only read published events: `is_active=true AND deleted_at is null`.
- Avoid exposing any service role keys client-side; rely on:
  - RLS admin policies (preferred for straightforward CRUD)
  - Edge Functions for sensitive flows if needed later

### RLS expectations (plain-English)
- If you are not an admin, you should not be able to create/edit/archive/delete events.
- Public users should only be able to read events that are **Published** and **not Archived**.
- The “admin” role is sourced from `profiles.role`.

---

## UX details (make it feel premium)

- **No surprises**: “Upload” clearly means “Publish to the live website”.
- **Toasts**:
  - “Draft saved”
  - “Event archived”
  - “Event is live”
  - “Event deleted”
- **Loading states**:
  - disable buttons and show “Saving…” / “Publishing…”
- **Validation**:
  - Require name/date/time
  - Price must be >= 0

---

## Dummy walkthrough summary (example)

**Admin wants to post a new event “Cars & Cigars”**
1. Admin logs in → lands on `/admin`.
2. Clicks **Events** → sees list.
3. Clicks **New event** → enters details and clicks **Save**.
4. Preview pops up showing how it will look to customers.
5. Admin clicks **Upload** → event becomes visible on `/events` for users to buy tickets.
6. If admin isn’t ready, they click **Back**, edit, then Save again.
7. If admin clicks **Save later**, the event goes to **Archive** where it can be edited, restored, or deleted.

---

## Step-by-step implementation checklist (for the dev team)

1. **Confirm lifecycle mapping** (Draft/Published/Archived) using `is_active` + `deleted_at` (recommended above).
2. **Admin list UI**:
   - Active list (`deleted_at is null`)
   - Archive list (`deleted_at is not null`)
3. **Create/Edit modal**:
   - Footer layout: Save later (left), Cancel + Save (right)
   - Save → opens Preview
   - Save later → archives + navigates to Archive
4. **Preview modal**:
   - Back → returns to edit with state intact
   - Upload → publish (`is_active=true`, `deleted_at=null`)
5. **Archive capabilities**:
   - Edit archived events
   - Delete archived events (confirmation)
   - Optional restore
6. **Public Events page**:
   - Reads only published active events
7. **Testing** (manual):
   - Create draft → shows Draft badge, not public
   - Upload → appears on public
   - Save later → moved to archive
   - Archive delete → removes record

---

## “Complete instructions” — exact build order (copy/paste for the team)

This is the shortest path to implement the UX correctly without breaking CRUD.

### Step 0 — Confirm route behavior (admin lands on admin dashboard)
- **Goal**: admin logs in → goes to `/admin` automatically.
- **Implementation**:
  - After password login or OAuth completes, fetch `profiles.role`.
  - If role is `admin`, redirect to `/admin` (already standard in this repo).
- **Done when**: admin never lands on `/profile` as the post-login destination.

### Step 1 — Define “Draft vs Published vs Archived” in the DB
- Use mapping (recommended):
  - Draft: `is_active=false` and `deleted_at is null`
  - Published: `is_active=true` and `deleted_at is null`
  - Archived: `deleted_at is not null`
- **Important**: “Upload” in the preview modal means: set `is_active=true` and `deleted_at=null`.

### Step 2 — Active Events list (`/admin/events`)
- Query: `deleted_at is null` and order by `date,time`.
- Render each row/card with:
  - Name, date/time, price
  - Badge: **Draft** if `!is_active`, **Published** if `is_active`
- Actions:
  - **New event** → opens modal with empty defaults (draft)
  - **Edit** → opens modal prefilled
  - **Archive** toggle → shows Archive list

### Step 3 — Create/Edit modal (draft-first)

#### Footer layout (required)
- Left: **Save later**
- Right: **Cancel** then **Save** (yellow)

#### Button behavior
- **Cancel**:
  - Close modal
  - Discard unsaved changes (reset to last persisted values)
- **Save later**:
  - Save the current form values (insert or update)
  - Then archive by setting `deleted_at=now()`
  - Navigate to Archive view (or flip view state)
  - Toast: “Event archived”
- **Save**:
  - Save the current form values (insert or update), but keep it as a **Draft**:
    - `is_active=false`
    - `deleted_at=null`
  - Then open Preview modal
  - Toast optional: “Draft saved”

### Step 4 — Preview modal (the “draft product”)

#### What it shows
- The public-facing card look:
  - Image
  - Name
  - Date/time
  - Price
  - Description
- A small badge: “Draft” (until uploaded)

#### Actions
- **Back**:
  - Close preview
  - Re-open editor with the same values (no data loss)
- **Upload**:
  - Update event: `is_active=true` and `deleted_at=null`
  - Close preview
  - Refresh active list
  - Toast: “Event is live”

### Step 5 — Archive list
- Query: `deleted_at is not null`
- UI should look similar to the active list
- Per-item actions:
  - **Edit** (optional): open edit modal
  - **Delete**: permanently delete (confirm required)
  - **Restore** (recommended): set `deleted_at=null`

### Step 6 — Public Events page
- Query: `is_active=true` and `deleted_at is null`
- Verify published events appear within one refresh.

---

## Edge cases (must handle)

- **New event + Save later**: creating a brand-new event and archiving immediately should still create a row first, then set `deleted_at`.
- **New event + Save + Back**: back should not lose image selection and form state.
- **Publish from preview**: should be idempotent (click Upload twice should not break).
- **Deleting archived event**:
  - If it has `image_path`, delete the storage object too.
  - Confirm dialog required.

---

## QA checklist (Definition of Done)

- [ ] Admin login routes to `/admin`
- [ ] New event → Save opens preview → Upload publishes to public events list
- [ ] New event → Save later sends item to Archive
- [ ] Archive list can delete with confirmation
- [ ] Active list shows Draft vs Published badges correctly
- [ ] No console errors; `npm run build` passes

---

## Technical implementation notes (still no code, but precise)

### UI component breakdown (recommended)
- **`AdminEvents` page**
  - State: `view = "active" | "archive"`
  - State: `selectedEventId` for editing
  - State: `editorOpen`, `previewOpen`
- **Event editor modal**
  - RHF+Zod form
  - Footer layout exactly as specified
  - Calls `upsertDraft()` then either:
    - opens preview (Save), or
    - archives and navigates to archive (Save later)
- **Preview modal**
  - Receives `eventId` (or draft snapshot)
  - “Back” returns to editor
  - “Upload” publishes (sets `is_active=true`, ensures `deleted_at=null`)
- **Archive list**
  - Similar card layout
  - Allows: edit, restore (optional), delete permanently

### Required queries / mutations (Supabase)
Active list:
- `events`: `deleted_at is null` ordered by `date`, `time`

Archive list:
- `events`: `deleted_at is not null` ordered by `deleted_at desc` (recommended) or `date/time`

Draft save (Save button in editor):
- Insert/update event with `is_active=false`, `deleted_at=null`

Archive (Save later button):
- Insert/update event (draft) then set `deleted_at=now()`

Publish (Upload button):
- Update event: `is_active=true`, `deleted_at=null`

Permanent delete (Archive):
- Delete row from `events`
- If `image_path` exists: remove object from storage bucket

### Preview source of truth (important)
Preview must always reflect what will go live. Recommended:
- “Save” first → ensures an event row exists and preview can render from the DB.
- Preview modal reads from the just-saved draft row (or uses the saved response).

### Navigation + transitions (exact)
- Save later → switch to archive view immediately (and close editor)
- Upload → return to active list, keep user on `/admin/events`
- Back (from preview) → return to editor with form values intact

---

## Manual test script (copy/paste)

Use this to confirm the whole UX works end-to-end.

1. Log in as admin → confirm you land on `/admin`.
2. Go to **Events**.
3. Click **New event**.
4. Fill in name/date/time/price/description.
5. Click **Save**.
6. Confirm **Preview modal** opens and looks like the public card.
7. Click **Back**.
8. Change the description.
9. Click **Save** again → confirm preview reflects the new description.
10. Click **Upload** → confirm toast “Event is live”.
11. Open public `/events` → confirm the event is visible.
12. Back in admin, edit the event → click **Save later** → confirm you are taken to Archive view.
13. In Archive view, click the event’s **Delete** and confirm delete.
14. Confirm the event is gone from archive and not visible on public `/events`.



