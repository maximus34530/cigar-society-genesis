# Implementation plan: Free-event n8n via Supabase Edge (HTTP n8n safe)

**Status:** Planning only — no code in this document.  
**Goal:** Stop the browser from calling `http://…` n8n (blocked as mixed content on `https://` production). The webapp calls a **Supabase Edge Function** over HTTPS; the function performs a **server-side** `fetch` to your self-hosted n8n **HTTP** webhook.

---

## 1. Problem and success criteria

- **Today:** After a free booking insert, the client `POST`s JSON to `VITE_N8N_EVENT_RESERVATION_WEBHOOK_URL`. If that URL is `http://`, browsers on HTTPS block it (mixed content). Failures are silent (`.catch` swallows errors).
- **Done when:**
  - Production free reservations reliably trigger n8n (or return a clear error to logs/monitoring).
  - No requirement for HTTPS on n8n for this path (HTTP from Supabase → n8n is fine).
  - Only authenticated users who own the booking can trigger the automation (see §4).
  - `VITE_N8N_EVENT_RESERVATION_WEBHOOK_URL` can be removed from Vercel after cutover (optional cleanup).

---

## 2. Target architecture

```text
User (HTTPS) → Vercel SPA → Supabase (bookings insert, unchanged)
                         → supabase.functions.invoke("…")  [HTTPS]
                                    → Edge: validate user + booking
                                    → fetch(http://n8n…/webhook/…)  [server]
```

- **Browser:** Talks only to Supabase and your domain (both HTTPS).
- **Edge:** Holds the n8n URL in a **secret**; calls HTTP n8n from Deno.

---

## 3. Edge Function design

### 3.1 Name and placement

- Add a new function under `supabase/functions/` (name TBD in implementation, e.g. `notify-free-reservation` or `forward-free-event-webhook`).
- Register it in `supabase/config.toml` with **`verify_jwt = false`** and validate the user in code with `Authorization` + `auth.getUser()`, **same pattern as** `create-checkout-session` (project already avoids gateway ES256/JWT issues this way).

### 3.2 Secret(s)

- **New secret (recommended):** `N8N_FREE_RESERVATION_WEBHOOK_URL` — full n8n webhook URL (may be `http://`).
- **Alternative:** Reuse a single internal “n8n base” secret if you prefer one knob; keep naming obvious for ops.
- **Do not** put this URL in `VITE_*` (public build).

### 3.3 Request contract (choose one tier)

**Option A — Minimal change (faster):**  
Client sends the **same JSON body** you send today (`type`, `booking_id`, `user_id`, `event`, `reservation`, `payment`, etc.). Edge:

1. Requires `Authorization: Bearer <user JWT>`.
2. Confirms `getUser()` matches `user_id` in the body (if present).
3. Optionally loads the booking by `booking_id` and checks `user_id` + `status` + free semantics (light sanity check).
4. Forwards body to n8n with `Content-Type: application/json`.

**Option B — Hardened (recommended for production):**  
Client sends only **`{ "booking_id": "<uuid>" }`**. Edge (service role):

1. Validates JWT → `uid`.
2. Loads `bookings` row + joined `events` (or separate queries).
3. Verifies: booking belongs to `uid`, status appropriate for “free confirmed” (e.g. `paid` with `total_paid` 0 and event price free — align with product rules).
4. Builds the n8n payload **on the server** (same shape as today so n8n workflows need minimal or no changes).
5. `fetch` to n8n; on success return `{ ok: true }`, on failure return non-2xx with a safe message (no secret leakage).

**Recommendation:** Plan for **Option B** unless time pressure forces A first; document a follow-up issue to tighten A → B.

### 3.4 Response and errors

- Return JSON: `{ ok: true }` on success; `{ ok: false, error: "…" }` with appropriate HTTP status on validation failure.
- Log n8n non-OK responses (trimmed body) like `stripe-webhook` / receipt code does — helps ops without exposing secrets to the client.
- Decide whether the **SPA should toast** on n8n failure after a successful DB insert (product choice: today booking succeeds even if n8n fails).

### 3.5 CORS

- Reuse the same `_shared/cors` pattern as other Edge functions (`OPTIONS` + JSON responses) so `functions.invoke` from the browser works.

---

## 4. Security checklist

| Item | Action |
|------|--------|
| Auth | Require valid user JWT; reject anonymous. |
| Ownership | Booking row must belong to `uid` from JWT. |
| Abuse | Rate limiting is optional; JWT + ownership already limits casual abuse. |
| Secrets | Webhook URL only in Supabase Edge secrets. |
| Idempotency (optional) | If n8n must not fire twice, consider a DB flag or dedupe key in a later iteration. |

---

## 5. Frontend changes (high level)

- **File:** `src/pages/Events.tsx` (free branch after successful `bookings` insert).
- **Remove:** Direct `fetch(VITE_N8N_EVENT_RESERVATION_WEBHOOK_URL, …)`.
- **Add:** `supabase.functions.invoke("<function-name>", { body: … })` with the chosen contract (A or B).
- **Env:** Remove `VITE_N8N_EVENT_RESERVATION_WEBHOOK_URL` from Vercel after production verification; update `.env.example` and any internal runbooks.
- **UX:** Optionally surface invoke errors (user-visible toast vs silent + log only) — align with paid receipt behavior for consistency.

---

## 6. n8n and network requirements

- n8n must be reachable from **Supabase’s outbound network** (public hostname/IP or tunnel). Private LAN-only n8n will not work without a tunnel (e.g. Cloudflare Tunnel) exposing it.
- **No CORS** configuration needed on n8n for the browser for this path (browser only talks to Supabase).
- Existing workflow can keep the same JSON `type: "event_reservation_free_confirmed"` if Option B mirrors the current payload.

---

## 7. Deployment and rollout

1. Implement Edge Function + local `supabase functions serve` test with a dev secret pointing at test n8n or webhook.site.
2. `supabase secrets set N8N_FREE_RESERVATION_WEBHOOK_URL=…` on the linked project.
3. Deploy the function: `supabase functions deploy <name>`.
4. Merge SPA changes; deploy Vercel production.
5. Set secret on production Supabase; confirm function version live.
6. Run one real free reservation; confirm n8n execution and email/slack.
7. Remove `VITE_N8N_EVENT_RESERVATION_WEBHOOK_URL` from Vercel; redeploy SPA so the old URL is not in the bundle.

**Rollback:** Keep the Edge function deployed; revert SPA to previous commit only if needed (old client would still hit mixed content if VITE URL is http — rollback is really “re-enable HTTPS n8n” or “disable client ping”).

---

## 8. Testing matrix

| Case | Expected |
|------|----------|
| Signed-in user, free event, valid booking | 200 from Edge; n8n receives POST; workflow runs. |
| No `Authorization` | 401 from Edge. |
| Wrong user’s `booking_id` | 403/404 from Edge; no n8n call. |
| Paid event / wrong status | 400 from Edge; no n8n call (per rules you define). |
| n8n down / timeout | Edge returns error; booking row behavior per product (likely still created). |
| Supabase function not deployed / wrong name | Client invoke error; visible in Network tab. |

---

## 9. GitHub workflow (repo rules)

- Open a **GitHub Issue** before implementation (see `GUIDES/GITHUB_ISSUES_GUIDE.md`).
- Branch: `feat/issue-<id>-free-reservation-n8n-edge` (or team convention).
- Commit messages: `[#<id>] …` after approval.
- Close the issue when acceptance criteria in §1 are met on production.

---

## 10. Optional follow-ups (separate issues)

- Unify free + paid n8n naming/secrets in docs (`N8N_RECEIPT_WEBHOOK_URL` vs new free URL).
- Server-side idempotency for n8n (e.g. `receipt_sent_at`-style column for free webhooks).
- Structured logging / alerting when Edge → n8n fails.

---

## 11. Acceptance criteria (copy into issue)

- [ ] New Edge Function deployed; secret set in production Supabase.
- [ ] Free reservation on production `https://` site triggers n8n without browser mixed-content errors.
- [ ] Unauthorized users cannot trigger n8n for arbitrary bookings.
- [ ] `.env.example` updated; Vercel no longer relies on `VITE_N8N_EVENT_RESERVATION_WEBHOOK_URL` for this feature (or documented as deprecated).
- [ ] Manual test documented in issue comment (screenshot or execution ID).
