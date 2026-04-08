# Cigar Society — Branding styles

Single reference for **new pages**, **marketing emails**, and **automations** (e.g. n8n) so visuals stay aligned with the live site.

**Source of truth (web app)**  
- Tokens and utilities: `src/index.css`  
- Tailwind mapping: `tailwind.config.ts`  
- UI primitives: `src/components/ui/` (shadcn — do not edit primitives for brand tweaks; extend via tokens and layout)

---

## Brand identity (copy + facts)

Use consistently in headers, footers, and legal lines:

| Item | Value |
|------|--------|
| Legal name | Cigar Society, LLC |
| Sub-brand (branding only) | “La Sociedad” — no membership system at launch |
| Address | 116 W State Ave, Pharr, TX 78577 |
| Phone | (956) 223-1303 |
| Region | Rio Grande Valley, Texas |
| Offerings | Cigars, bourbon, beer, mixed drinks |

**Voice**  
Premium, warm, confident. Short sentences. Avoid gimmicky slang. Age-restricted products: keep copy responsible and compliant.

---

## Color system

Colors are defined as **HSL components** on `:root` and consumed as `hsl(var(--token))`. On new React pages, **prefer Tailwind semantic classes** (`bg-background`, `text-foreground`, `border-border`, `text-primary`, etc.) so theme changes stay centralized.

### Core semantic tokens (shadcn)

| Role | CSS variable | Tailwind (typical) | Notes |
|------|----------------|-------------------|--------|
| Page background | `--background` | `bg-background` | Near-black |
| Main text | `--foreground` | `text-foreground` | Warm light |
| Surfaces (cards) | `--card` | `bg-card` | Slightly lifted |
| Muted text | `--muted-foreground` | `text-muted-foreground` | Secondary copy |
| Borders / inputs | `--border`, `--input` | `border-border` | Subtle warm edge |
| Brand gold (primary) | `--primary`, `--gold` | `text-primary`, `bg-primary`, `border-primary` | CTAs, links, accents |
| On-gold text | `--primary-foreground` | `text-primary-foreground` | Use on gold fills |
| Destructive | `--destructive` | `text-destructive`, `bg-destructive` | Errors, destructive actions |

### Brand accent tokens (extended)

| Token | Purpose |
|-------|---------|
| `--gold`, `--gold-light` | Gold gradient, highlights, dividers |
| `--tobacco`, `--tobacco-light` | Warm brown secondary surfaces |
| `--charcoal`, `--charcoal-light` | Deep neutrals |

### Gradients & shadows (utilities)

Defined in `index.css` — use the **utility classes** on the site:

| Utility | Use |
|---------|-----|
| `bg-gold-gradient` + `shadow-gold` | Primary buttons and strong CTAs |
| `text-gold-gradient` | Accent headline text (sparingly) |
| `gold-divider` | Section separators under titles |
| `section-warm-radial` | Soft gold wash on alternating sections |
| `hero-heading-glow` | Large hero titles |
| `hero-overlay` | Hero image darkening |

**Rule:** Do not hardcode hex in React/Tailwind for brand colors — use CSS variables / Tailwind tokens from `index.css`.

---

## Typography

### Font families

Loaded in `src/index.css` (Google Fonts). Stacks:

| Role | Family | CSS / Tailwind |
|------|--------|----------------|
| Body | **Lato** (300–900) | `font-body` → `var(--font-body)` |
| Display headings (h1–h3) | **Bebas Neue** | Applied globally to `h1–h3` in `index.css` |
| Section titles / card titles | **Playfair Display** | `font-heading` |
| Accent / UI | System fallbacks | `-apple-system`, `Georgia`, `sans-serif` |

**Practical pattern (pages like Privacy, Dashboard):**

- Page title: `font-heading` or hero pattern with Bebas for impact  
- Section headings: `font-heading`  
- Body copy: `font-body`  
- Meta / captions: `text-sm text-muted-foreground font-body`

### Scale (guidance)

- **Hero:** large clamp classes or `text-4xl md:text-5xl` for legal/static pages  
- **Section headings:** `text-2xl`–`text-3xl` with `font-heading`  
- **Body:** default with `leading-relaxed` on long-form content  
- **Uppercase / tracking:** sparingly for labels (e.g. `uppercase tracking-wider` on nav-style links)

---

## Layout & spacing

| Pattern | Implementation |
|---------|------------------|
| Page sections | `section-padding` (`py-20 md:py-28 px-4 md:px-8`) |
| Max width (content) | `container mx-auto` with `max-w-*` as needed (e.g. `max-w-3xl` for legal) |
| Section rhythm | Alternate `bg-background` with `bg-muted/80` or `section-warm-radial` for depth |
| Cards | `rounded-xl border border-border/60 bg-card/40` (or similar opacity per page) |

**Responsive:** Mobile-first; increase padding and type size at `md:` and `lg:` breakpoints.

---

## Components & interaction

- **Primary button:** `Button` with `className="bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90"` (matches existing CTAs)  
- **Outline / secondary:** `variant="outline"` with `border-primary` or `border-border/70`  
- **Focus:** Visible ring — `focus-visible:ring-2 focus-visible:ring-primary/35` (match existing patterns)  
- **Motion:** Prefer `tailwindcss-animate` classes; respect `prefers-reduced-motion` (site already reduces some animations)

---

## Imagery

- Photography: lounge, cigars, warm lighting — premium, not stocky  
- Overlays: `hero-overlay` or subtle gradients; keep text readable (WCAG contrast)  
- Event images: Supabase `event-images` bucket; same warm treatment as site heroes

---

## Emails & HTML templates (n8n, transactional)

Email clients do not support your CSS file. **Inline styles** and **web-safe fallbacks** are required.

### Fonts (email)

Link the same families in `<head>` (or use `@import` if your sender allows):

```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lato:wght@400;700&family=Playfair+Display:wght@600&display=swap" rel="stylesheet">
```

**Stacks:**

- Headlines: `'Bebas Neue', Arial, sans-serif` or `'Playfair Display', Georgia, serif` for a more editorial feel  
- Body: `'Lato', Helvetica, Arial, sans-serif`

### Approximate hex (for inline email styles only)

These approximate the HSL tokens in `index.css` — spot-check against the live site when polishing templates.

| Use | Approx. hex | Notes |
|-----|-------------|--------|
| Background | `#0d0d0d` | Near black |
| Card / panel | `#141414` | Slightly above background |
| Primary text | `#ebe8e0` | Warm off-white |
| Muted text | `#8a857a` | Secondary |
| Border | `#2e2a22` | Warm divider |
| Gold (primary) | `#c9a43a` | CTAs, rules, links |

**Primary button (email example):**

```html
<a href="{{url}}" style="display:inline-block;padding:12px 24px;border-radius:8px;background:linear-gradient(135deg,#c9a43a,#d4b862);color:#0d0d0d;font-family:'Lato',Helvetica,Arial,sans-serif;font-weight:700;text-decoration:none;">View details</a>
```

**Footer block:** Legal name, address, phone, optional “La Sociedad” line — same facts as the table above.

---

## Checklist for new work

- [ ] Colors use tokens (`hsl(var(--…))` / Tailwind semantic classes), not one-off hex — **except** standalone HTML emails (inline hex OK)  
- [ ] Headings: Bebas or Playfair per hierarchy; body: Lato  
- [ ] Primary actions use gold gradient + dark text on gold  
- [ ] Sections use `section-padding` or equivalent spacing  
- [ ] Business facts and phone/address match this doc  
- [ ] Animations stay subtle; respect reduced motion where applicable

---

## Related docs

- `Phase_2_implementation_plan.md` — product scope  
- `Stripe_Payment_Implementation_Plan.md` — payments & receipts (n8n payload ideas)
