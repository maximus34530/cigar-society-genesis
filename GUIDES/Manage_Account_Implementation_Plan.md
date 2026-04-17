# Manage Account (Profile + Security) — Implementation Plan

## Objective
Replace the existing `/account/*` area with a single modern **Manage account** page (Google-inspired), and make **`/dashboard`** the default landing page after login/signup (unless an explicit return path exists, e.g. event checkout resume).

This work also updates the top-right account menu to:
- Rename **Profile → Dashboard** (routes to `/dashboard`)
- Add **Manage account** (routes to `/account`)

## Non-goals (for this milestone)
- Billing, membership, subscriptions
- Admin user management
- Full Google-like account suite (devices, privacy center, etc.)

## UX requirements
- Calm, modern UI similar in structure to Google “Manage your account”
- Include only:
  - **Personal info** (CRUD)
  - **Security & sign-in** (CRUD where applicable)
- Mobile-first layout; scale to desktop with 2-column card layout

## Route + IA changes
### Final routes
- **`/dashboard`**: default post-auth landing
- **`/account`**: Manage account (new consolidated page)

### Redirects (backward compatibility)
- `/profile` → `/account` (replace)
- `/account/profile` → `/account`
- `/account/bookings` → `/dashboard` (tickets live on dashboard now)
- `/account/*` unknown → `/account`

## Data model
### Profiles table
Continue using `profiles` for user-facing identity.

Add new columns (if not present):
- `first_name text null`
- `last_name text null`
- `phone text null` (stored as a normalized E.164-like string when possible)

Keep existing columns (already in use):
- `full_name text`
- `avatar_url text`
- `role text`

### Phone recommendation
**Store as “E.164-like”** without adding dependencies:
- Accept input as digits and optional `+`
- Normalize on save:
  - 10 digits → assume US, store as `+1XXXXXXXXXX`
  - 11 digits starting with `1` → store as `+1XXXXXXXXXX`
  - Starts with `+` and 10–15 digits total → keep
- Validate with a lightweight rule: `^\+?[0-9]{10,15}$`

Rationale: good UX without bringing in libphonenumber yet; compatible with future strict validation.

## Security & sign-in recommendation (OAuth users)
### Capabilities
- **Change email**: supported via Supabase auth email update (requires email confirmation)
- **Change/set password**:
  - Always show “Set/Change password” action
  - For OAuth-only users, this effectively becomes “Set a password”

### “Confirm it’s you” (reauth)
For sensitive actions (email/password changes), require a recent reauth:
- Password users: prompt for current password → perform `signInWithPassword` silently (refresh session) and set a local `recent_reauth_at`
- Google users: provide “Continue with Google” → start OAuth again with return-to `/account`; on return set `recent_reauth_at`

Enforce a short TTL (e.g., 5 minutes). If TTL expired, require reauth again.

## UI structure (Manage account page)
### Layout
- Page heading: “Manage account”
- Subtitle: short and reassuring (tickets + security)
- Grid:
  - Left: **Personal info**
  - Right: **Security & sign-in**

### Personal info card (CRUD)
Rows (Google-like):
- Name (First + Last) → Edit dialog
- Phone → Edit dialog

On save:
- Update `profiles.first_name`, `profiles.last_name`, `profiles.phone`
- Also keep `full_name` in sync as `${first} ${last}` (trim)

### Security & sign-in card
Rows:
- Email → Change email dialog (requires reauth + shows “check your inbox” messaging)
- Password → Set/Change password dialog (requires reauth)
- Sign-in method → read-only (shows provider: Google vs Email)

## Implementation steps (engineering checklist)
1. **DB migration**
   - Add `first_name`, `last_name`, `phone` columns to `profiles`
   - Ensure RLS policies still allow user to update own row
2. **Routing**
   - Replace nested `/account` routes with a single `ManageAccount` page at `/account`
   - Add redirects for legacy routes (`/profile`, `/account/profile`, `/account/bookings`)
3. **Navbar account menu**
   - Update `ProfileMenu`:
     - “Dashboard” → `/dashboard`
     - “Manage account” → `/account`
4. **Post-auth redirect defaults**
   - Ensure Login + Signup + OAuth callback default to `/dashboard`
   - Preserve any existing explicit return path logic (checkout resume, etc.)
5. **Build + QA**
   - `npm run build`
   - Manual smoke:
     - Email/password user can edit personal info
     - Email/password user can change password
     - Google user can set/change password
     - Legacy routes redirect properly

## Acceptance criteria
- [ ] Login + Signup land on `/dashboard` by default
- [ ] Top-right menu: “Dashboard” routes to `/dashboard`, “Manage account” routes to `/account`
- [ ] `/account` shows Google-like Manage account with:
  - [ ] Personal info (name + phone) CRUD
  - [ ] Security & sign-in (email + password) flows with reauth gating
- [ ] Old `/account/*` and `/profile` routes redirect cleanly
- [ ] `npm run build` passes

