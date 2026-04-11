# Login, Signup & Supabase Auth — Implementation Plan (Reusable)

**Primary delivery issue:** [#125](https://github.com/maximus34530/cigar-society-genesis/issues/125) (OAuth Google/Apple, callback route, signup confirm UX)  
**Related:** [#107](https://github.com/maximus34530/cigar-society-genesis/issues/107) (signup confirm + rate limits — implemented in app), [#108](https://github.com/maximus34530/cigar-society-genesis/issues/108) (magic link demo — optional, not required for launch)  
**Companion docs:** [`UI_UX_implementation_plan.md`](./UI_UX_implementation_plan.md), [`Phase_2_implementation_plan.md`](./Phase_2_implementation_plan.md), [`GITHUB_ISSUES_GUIDE.md`](./GITHUB_ISSUES_GUIDE.md)  
**Scope:** Email/password + **Google** + **Apple** OAuth, PKCE, `profiles` + roles, route guards, **return-to-intent** (Events tickets + post–email-confirm resume).  
**Stack (this project):** React 18 + Vite + TypeScript + React Router v6 + `@supabase/supabase-js` + shadcn/ui.

> **Purpose:** Stand up or **re-stand up** Supabase Auth on this site or another. **Supabase MCP** applies migrations and introspects the project; **Google Cloud** and **Apple Developer** consoles are still required once per provider to obtain client IDs/secrets (MCP cannot paste those into Supabase for you).

---

## Locked product decisions (Cigar Society)

| Topic | Decision |
|--------|-----------|
| **Email confirmation** | **On** in Supabase (`signUp` often returns **no session** until the user clicks the email link). |
| **Default post-auth path** | **`/dashboard`** when the user had no `state.from` (e.g. opened Log in from the navbar). |
| **Return-to-intent** | If the user was buying **event tickets**, preserve **`/events?reserve=…`** (and any explicit `state.from`) through login, signup, **OAuth**, and **email-confirm** flows. |
| **Email-confirm resume** | Before email/password `signUp`, stash `{ path, email, exp }` in **`sessionStorage`**; after session exists, **`PostAuthEmailConfirmRedirect`** consumes it **only if** `user.email` matches — avoids hijacking if another account logs in first. |
| **OAuth return** | Separate **`sessionStorage`** key for OAuth; consumed only on **`/auth/callback`** after `getSession()`. |
| **Admin routing** | If the resolved path is the **default** (`/dashboard`) and `profiles.role === 'admin'`, send to **`/admin`** (same rule as password login). |
| **RequireAdmin denial** | Redirect non-admins to **`/dashboard`** (not `/profile`). |
| **OAuth providers** | **Google** and **Apple** both enabled in Supabase + UI. |
| **Magic link** | **Not** required for launch; see **#108** if you add it later. |
| **Admin detection** | **`profiles.role` only** (no JWT `app_metadata` for v1). |

---

## Auth UX — what we’re aiming for (summary)

1. **Supabase Auth** — passwords + OAuth; issues **JWTs** / **`session`**.
2. **`public.profiles`** — `full_name`, `avatar_url`, **`role`** (`admin` | `client` | `user`), `id = auth.users.id`, filled by **`on_auth_user_created`** trigger (already on project).
3. **App shell** — **`AuthProvider`**, **`RequireAuth`** / **`RequireAdmin`**, **`PostAuthEmailConfirmRedirect`**, **`/auth/callback`** for OAuth PKCE return.

**Professional bar:** No fake “you’re logged in” after signup when **confirm email** is on; rate-limit friendly copy; OAuth buttons + password path share the same **return** rules.

---

## Desired outcome

### User experience
- **Password login:** `signInWithPassword` → load `profiles.role` → **`resolvePostLoginPath(from, isAdmin)`** → navigate.
- **Password signup:** If **`data.session`** exists → navigate immediately; else **“Check your email”** + stash return path keyed by **email**; **2s** anti double-submit; **60s** UI cooldown on rate-limit errors.
- **Google / Apple:** `signInWithOAuth` with **`redirectTo`** = `{origin}/auth/callback` → **`/auth/callback`** runs `getSession()` → **`takeOAuthReturnPath()`** → same admin resolution as login.
- **After email link:** User lands with session → **`PostAuthEmailConfirmRedirect`** matches email → navigates to saved path (e.g. Events reserve).

### Backend / security
- Browser: **anon / publishable key only**.
- **RLS** on `profiles` and all user data tables.
- **Redirect URL allow list** in Supabase includes:  
  `http://localhost:8080/**`, `http://127.0.0.1:8080/**`, and production **`…/auth/callback`** (wildcard `/**` covers it).

---

## Current state (implemented in *this* repo)

| Area | Location / behavior |
|------|---------------------|
| **Supabase client** | `src/lib/supabase.ts` — **`flowType: 'pkce'`**, **`detectSessionInUrl: true`**. |
| **Return-path helpers** | `src/lib/authRouting.ts` — `DEFAULT_POST_AUTH_PATH`, `resolvePostLoginPath`, `resolvePostLoginPathForUser`, OAuth + email-signup stash/take. |
| **OAuth launcher** | `src/lib/oauthSignIn.ts` — `signInWithOAuthProvider('google' \| 'apple', returnPath)`. |
| **Callback route** | `src/pages/AuthCallback.tsx` — route **`/auth/callback`** (see `App.tsx`). |
| **Email-confirm resume** | `src/components/PostAuthEmailConfirmRedirect.tsx` — mounted inside **`BrowserRouter`** in `App.tsx`. |
| **Login** | `src/pages/Login.tsx` — Google + Apple buttons, password + **show/hide**, destructive **Alert** for errors, default **`from`** = `/dashboard`. |
| **Signup** | `src/pages/Signup.tsx` — same OAuth + confirm-email branch + rate limit cooldown + password rules (8+ chars + digit). |
| **Events → login** | `src/pages/Events.tsx` — still passes **`state.from`** = `/events?reserve=…`. |
| **Migration (doc)** | `supabase/migrations/20260411225735_document_profiles_auth_integration.sql` — table comment (also applied via MCP). |

---

## Dumbed-down flow (what the user sees)

1. Browse site → **Reserve** while logged out → **Login** with `from` = Events + reserve id.
2. They choose **Google / Apple** or **email/password**.
3. **OAuth:** redirect to provider → back to **`/auth/callback`** → app sends them to **`from`** (or `/dashboard`, or `/admin` if admin + default).
4. **Email signup + confirm:** “Check your email” → they click link → session appears → **silent redirect** to saved **`from`** when email matches stash.
5. **Password login:** same navigation rules without callback route.

```mermaid
flowchart TD
  subgraph paths [Return path storage]
    O[OAuth: sessionStorage oauth path]
    E[Email signup: sessionStorage path+email+exp]
  end
  L[Login / Signup] --> O
  L --> E
  O --> C[/auth/callback]
  C --> D[Dashboard / Events / Admin]
  E --> P[PostAuthEmailConfirmRedirect]
  P --> D
```

---

## Part A — Supabase Dashboard (one-time per project)

1. **Authentication → URL configuration**  
   - **Site URL:** production origin (and/or dev).  
   - **Redirect URLs:** include `http://localhost:8080/**`, production `https://YOURDOMAIN/**`, and any preview URLs Vercel uses.

2. **Authentication → Providers**  
   - **Email** — confirm email **ON** (matches locked decision).  
   - **Google** — enable; paste **Web client ID** + **secret** from [Google Cloud Console](https://console.cloud.google.com/) (OAuth consent screen + OAuth 2.0 Client IDs, type **Web application**). Authorized redirect URI must include Supabase’s callback URL shown in the Supabase Google provider settings.  
   - **Apple** — enable; complete **Services ID**, **Secret Key (.p8)**, **Key ID**, **Team ID** per Supabase docs (Apple Developer → Certificates, Identifiers & Profiles).

3. **Authentication → Email templates** — optional branding for confirm signup.

> **MCP cannot:** create Google OAuth clients or Apple keys in those vendor consoles. After you paste credentials into Supabase, the in-app buttons work without further code changes.

---

## Part B — Database (`profiles`)

- Table **`public.profiles`** exists; trigger **`on_auth_user_created`** on **`auth.users`** exists (verified via SQL).
- **MCP:** `list_tables`, `apply_migration` for schema changes; `execute_sql` for careful read-only checks.
- Latest doc-only migration: **`document_profiles_auth_integration`** (table **comment**).

---

## Part C — Frontend wiring (this repo)

1. **Default `from`:** `DEFAULT_POST_AUTH_PATH = '/dashboard'` in **`authRouting.ts`**; Login/Signup `useMemo` uses it when `location.state.from` is missing.
2. **OAuth:** call **`signInWithOAuthProvider(provider, from)`** before redirect; stash path; **`redirectTo`** = `${origin}/auth/callback`.
3. **Callback:** **`getSession()`**; if missing session → clear OAuth stash, go **`/login`**; else **`takeOAuthReturnPath()`** + **`resolvePostLoginPathForUser`**.
4. **Email signup:** **`stashEmailSignupReturnPath(from, email)`** immediately before **`signUp`**; clear on error or immediate session; on confirm, **`PostAuthEmailConfirmRedirect`** consumes when emails match.

---

## Part D — Environment

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Project URL. |
| `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Client key. |
| `VITE_SITE_ORIGIN` | Optional; used in **`oauthSignIn`** only if `window` is missing (SSR/build edge cases). Prefer real browser **`window.location.origin`** for OAuth redirect. |

---

## Testing checklist (manual)

- [ ] **Google OAuth** round-trip (dev + production domains in Supabase).
- [ ] **Apple OAuth** round-trip.
- [ ] **Password signup** with confirm email → stash → confirm → lands on **Events reserve** when that was the intent.
- [ ] **Rate limit** message + cooldown (spam signup in dev).
- [ ] **Admin** with default path → **`/admin`**.
- [ ] **Non-admin** hitting **`/admin`** → **`/dashboard`**.

---

## Should-do / nice-to-have

| Item | Notes |
|------|--------|
| Magic link demo / real | **#108** |
| Auth guard skeleton instead of `null` | `UI_UX_implementation_plan.md` |
| Forgot password flow | `resetPasswordForEmail` + route |

---

## Questions (historical — answered for Cigar Society)

1. **Email confirmation:** **On.**  
2. **Default post-login:** **`/dashboard`**, unless `state.from` is set (e.g. ticket flow).  
3. **Admin detection:** **`profiles.role` only.**  
4. **OAuth providers:** **Google + Apple.**  
5. **Magic link:** **Deferred** (optional **#108**).

---

## My personal summary (one table)

| Piece | Dummy explanation |
|--------|---------------------|
| **PKCE + callback** | OAuth round-trip parking spot: **`/auth/callback`** finishes the handshake. |
| **OAuth stash** | “After Google, send them back to the concert line they were in.” |
| **Email stash** | “After they click the email link, only continue if it’s the **same email** we stashed for.” |
| **`/dashboard` default** | “If they weren’t doing anything special, home is the lobby TV (**Dashboard**).” |
| **Supabase MCP** | Ships **SQL migrations** and **comments**; **doesn’t** log into Google/Apple for you. |

That’s the loop: **Dashboard config (URLs + providers) → env + client → Login/Signup/OAuth/Callback/PostAuth listener → same `profiles` truth as before.**
