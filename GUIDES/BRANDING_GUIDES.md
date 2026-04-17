# Cigar Society — Branding guide (web & HTML email)

Style references derived from design tokens in `src/index.css` and `tailwind.config.ts` so marketing and transactional HTML email can stay on brand with the site.

## Typography

| Role | Site stack | Email notes |
|------|------------|-------------|
| **Display / main titles** | `Bebas Neue` (used for `h1`–`h3` on the site) | Strong brand fit; all-caps reads well. Fallback: `Arial Narrow`, `Helvetica`, `sans-serif`. |
| **Section / elegant headings** | `Playfair Display`, Georgia, serif | Fallback: `Georgia`, `Times New Roman`, serif. |
| **Body** | `Lato` (300, 400, 700, 900) | Fallback: `-apple-system`, `Segoe UI`, `Roboto`, `Helvetica`, `Arial`, `sans-serif`. |

### Google Fonts (same families as the app)

```
https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lato:wght@300;400;700;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap
```

Many email clients ignore custom fonts — **always set fallbacks** and test in Gmail and Outlook.

## Color palette

Tokens use `hsl(var(--*))` on the site. Hex values below are computed equivalents for HTML email and tools that expect hex.

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#0d0d0d` | Outer / full-bleed background |
| Card / panels | `#141414` | Content blocks |
| Foreground (body text) | `#ebe7e0` | Primary copy on dark |
| Muted text | `#989081` | Secondary lines, disclaimers |
| Gold (primary / accent) | `#d9a520` | CTAs, links, rules, icons |
| Gold light | `#ecc051` | Highlights, gradient stops |
| Tobacco | `#47301f` | Warm panels, borders |
| Tobacco light | `#634936` | Softer brown accents |
| Charcoal | `#1a1a1a` | Nested blocks |
| Charcoal light | `#262626` | Nested blocks (lighter) |
| Border | `#322f29` | Dividers, table borders |
| On-gold text | `#0d0d0d` | Text on gold buttons (matches primary foreground) |

### Gradients

Use sparingly in email; many clients flatten or ignore them.

- **Gold:** `135deg` from `#d9a520` toward `#ecc051` (see `--gradient-gold` in `src/index.css`).
- **Dark:** `180deg` from `#0d0d0d` to `#141414` (see `--gradient-dark` in `src/index.css`).

## Layout & shape

- **Corner radius:** `--radius` = `0.5rem` → **8px** on buttons and cards.
- **Spacing:** The site uses generous vertical rhythm; in email, **16–24px** padding inside a **600px** max content width is a practical match.

## Business copy (exact values)

Use these strings for footer, legal, and contact blocks:

| Field | Value |
|-------|--------|
| Legal name | Cigar Society, LLC |
| Address | 116 W State Ave, Pharr, TX 78577 |
| Phone | (956) 223-1303 |
| Sub-brand | La Sociedad (branding; no membership system at launch) |
| Region | Rio Grande Valley, Texas |

**Offerings (when relevant):** cigars, bourbon, beer, mixed drinks.

**Social proof (when relevant):** 5.0 ★ — 27 Google Reviews.

## HTML email practical notes

- Prefer **inline styles** and **table-based layout** for broad client compatibility.
- Treat the hex table above as the on-brand reference when CSS variables are not available in the mailer.

## Source tokens (site)

Key variables live in `src/index.css` under `:root` (e.g. `--background`, `--foreground`, `--gold`, `--gold-light`, `--tobacco`, `--font-heading`, `--font-body`, gradients). Display headings use `Bebas Neue` for `h1`–`h3`; see the `h1, h2, h3` rule in the same file.
