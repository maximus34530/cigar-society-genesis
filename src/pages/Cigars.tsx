import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cigars } from "@/data/cigars";
import { resolveCigarCardImage } from "@/lib/resolveCigarCardImage";
import { cn } from "@/lib/utils";
import boldSmoke from "@/assets/cigar-cards/unsplash-cigar-smoke-table.jpg";
import classicSingle from "@/assets/cigar-cards/unsplash-single-cigar-plate.jpg";
import mildSelection from "@/assets/cigar-cards/unsplash-three-cigars-ashtray.jpg";
import cigarsFeatured from "@/assets/cigars-featured.jpg";
import featuredFigurado from "@/assets/featured-figurado-style.jpg";
import featuredMaduro from "@/assets/featured-maduro-style.jpg";

/** Set to false to show the full 222-cigar Humidor Selection (filters + grid) again. */
const SHOW_HUMIDOR_SELECTION = false;

type OurCigarStrength = "Mild" | "Medium" | "Full Body";

type OurCigar = {
  name: string;
  meta: string;
  strength: OurCigarStrength;
  description: string;
  imageSrc: string;
};

/** Six featured cigars: two Mild, two Medium, two Full Body (order preserved). */
const OUR_CIGARS_STATIC: OurCigar[] = [
  {
    name: "Macanudo Café",
    meta: "Dominican Republic · Connecticut Shade",
    strength: "Mild",
    description: "Creamy and smooth with subtle notes of cedar and vanilla.",
    imageSrc: mildSelection,
  },
  {
    name: "Ashton Classic",
    meta: "Dominican Republic · Connecticut",
    strength: "Mild",
    description: "Elegant and refined with a mellow, buttery finish.",
    imageSrc: cigarsFeatured,
  },
  {
    name: "Arturo Fuente Hemingway",
    meta: "Dominican Republic · Cameroon",
    strength: "Medium",
    description: "Perfectly balanced with flavors of earth, nuts, and sweet spice.",
    imageSrc: featuredFigurado,
  },
  {
    name: "Romeo y Julieta 1875",
    meta: "Honduras · Connecticut",
    strength: "Medium",
    description: "Classic medium-body with notes of almond and light pepper.",
    imageSrc: classicSingle,
  },
  {
    name: "Padrón 1964 Anniversary",
    meta: "Nicaragua · Maduro",
    strength: "Full Body",
    description: "Rich and complex with cocoa, coffee, and a long earthy finish.",
    imageSrc: featuredMaduro,
  },
  {
    name: "Liga Privada No. 9",
    meta: "Nicaragua · Connecticut Broadleaf",
    strength: "Full Body",
    description: "Dark and powerful with notes of dark chocolate, pepper, and leather.",
    imageSrc: boldSmoke,
  },
];

function CigarCardHero({ alt, src }: { alt: string; src: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg border-b border-border/60 bg-muted">
      <img alt={alt} src={src} className="h-full w-full object-cover" loading="lazy" decoding="async" />
    </div>
  );
}

const CIGARS_SEO =
  "Browse premium cigars at Cigar Society in Pharr, TX — humidor snapshot by strength with pricing. Must be 21+.";

const OUR_CIGARS_SEO =
  "Featured premium cigars at Cigar Society in Pharr, TX — mild, medium, and full-bodied selections. Must be 21+.";

const STRENGTH_ORDER = ["Mild", "Mild to Medium", "Medium", "Medium to Full", "Full"] as const;
type Strength = (typeof STRENGTH_ORDER)[number];

const STRENGTH_RULES: { re: RegExp; strength: Strength }[] = [
  { re: /\bmild\s*[-–]\s*to\s*[-–]?\s*medium\b/i, strength: "Mild to Medium" },
  { re: /\bmedium\s*[-–]\s*to\s*[-–]?\s*full\b/i, strength: "Medium to Full" },
  { re: /\bmedium\s*\+/i, strength: "Medium to Full" },
  { re: /\bfull[\s-]bodied\b/i, strength: "Full" },
  { re: /\bfull\s+body\b/i, strength: "Full" },
  { re: /\blight[\s-]bodied\b/i, strength: "Mild" },
  { re: /\bmild[\s-]bodied\b/i, strength: "Mild" },
  { re: /\bmedium[\s-]bodied\b/i, strength: "Medium" },
  { re: /\bmedium\s+body\b/i, strength: "Medium" },
  { re: /\bsmooth (and )?mild\b/i, strength: "Mild" },
  { re: /\bcreamy (and )?mild\b/i, strength: "Mild" },
  { re: /\bmild (yet|smoke|flavor|cigar)\b/i, strength: "Mild" },
  { re: /\bmild,?\s+(yet|smooth|creamy)\b/i, strength: "Mild" },
  { re: /\bvery\s+mild\b/i, strength: "Mild" },
  { re: /\bmoderate\s+strength\b/i, strength: "Medium" },
  { re: /\bfull\s+strength\b/i, strength: "Full" },
  { re: /\bmedium\s+strength\b/i, strength: "Medium" },
  { re: /\blight\s+wrapper\b/i, strength: "Mild" },
  { re: /\blight\s+connecticut\b/i, strength: "Mild" },
  { re: /\bmedium\s+to\s+full-bodied\b/i, strength: "Medium to Full" },
];

function inferStrengthFromName(name: string): Strength {
  const n = name.toLowerCase();
  if (/\bconnecticut\b/.test(n)) return "Mild";
  if (/\bmaduro\b/.test(n)) return "Medium to Full";
  if (/\bhabano\b/.test(n)) return "Medium";
  return "Medium";
}

function inferStrength(name: string, description?: string): Strength {
  const t = `${name} ${description ?? ""}`;
  for (const { re, strength } of STRENGTH_RULES) {
    if (re.test(t)) return strength;
  }
  if (!description?.trim()) {
    return inferStrengthFromName(name);
  }
  if (description.trim().length < 30) {
    return inferStrengthFromName(name);
  }
  return "Medium";
}

const sorted = [...cigars].sort((a, b) => a.name.localeCompare(b.name));

type FilterKey = "all" | Strength;

const HumidorSelectionHidden = () => {
  const [filter, setFilter] = useState<FilterKey>("all");

  const enriched = useMemo(
    () =>
      sorted.map((c) => ({
        ...c,
        strength: inferStrength(c.name, c.description),
      })),
    [],
  );

  const visible = useMemo(() => {
    if (filter === "all") return enriched;
    return enriched.filter((c) => c.strength === filter);
  }, [enriched, filter]);

  const orderedVisible = useMemo(() => {
    const copy = [...visible];
    copy.sort((a, b) => {
      const ai = STRENGTH_ORDER.indexOf(a.strength);
      const bi = STRENGTH_ORDER.indexOf(b.strength);
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    });
    return copy;
  }, [visible]);

  return (
    <>
      <section className="section-padding border-b border-border/40 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-4 font-heading text-4xl font-bold text-foreground md:text-5xl">Humidor Selection</h1>
          <p className="mx-auto max-w-2xl font-body leading-relaxed text-muted-foreground">
            A carefully curated selection of premium cigars — from mild and approachable to bold and full-bodied. Every
            stick in our humidor is hand-selected by our certified tobacconist. Come in, explore the selection, and let us
            help you find your perfect smoke. Must be 21+ to purchase.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto">
          <nav
            aria-label="Filter by strength"
            className="mb-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-2"
          >
            <Button
              type="button"
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              className={cn(
                filter !== "all" &&
                  "border-primary/50 bg-background text-foreground hover:bg-primary/10 hover:text-foreground",
              )}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            {STRENGTH_ORDER.map((s) => (
              <Button
                key={s}
                type="button"
                variant={filter === s ? "default" : "outline"}
                size="sm"
                className={cn(
                  filter !== s &&
                    "border-primary/50 bg-background text-foreground hover:bg-primary/10 hover:text-foreground",
                )}
                onClick={() => setFilter(s)}
              >
                {s}
              </Button>
            ))}
          </nav>

          <p className="mb-8 text-center text-sm text-muted-foreground">
            Showing {orderedVisible.length} of {enriched.length} cigars
            {filter !== "all" ? ` · ${filter}` : ""}
          </p>

          <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 xl:grid-cols-3">
            {orderedVisible.map((c) => (
              <li key={c.id}>
                <Card
                  className={cn(
                    "h-full overflow-hidden border-border/80 shadow-card transition-opacity",
                    !c.inStock && "bg-muted/40 opacity-60",
                  )}
                >
                  <CigarCardHero
                    src={resolveCigarCardImage(c.name)}
                    alt={`Representative cigar photo for ${c.name}. Ask our team for current bands and availability.`}
                  />
                  <CardHeader className="space-y-3 pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                      <CardTitle className="font-heading pr-2 text-lg leading-snug text-balance">{c.name}</CardTitle>
                      {!c.inStock ? (
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-[0.65rem] uppercase tracking-wide text-muted-foreground"
                        >
                          Out of Stock
                        </Badge>
                      ) : null}
                    </div>
                    <p className="font-heading text-xl text-primary">{c.price}</p>
                    <Badge
                      variant="outline"
                      className="w-fit border-primary/55 bg-primary/10 font-body text-xs font-medium text-primary"
                    >
                      {c.strength}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {c.description ? (
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                    ) : (
                      <p className="text-sm italic text-muted-foreground/80">No description on file.</p>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

const Cigars = () => {
  return (
    <Layout>
      <Seo
        title={SHOW_HUMIDOR_SELECTION ? "Humidor Selection — Cigar Menu" : "Our Cigars — Featured Selection"}
        description={SHOW_HUMIDOR_SELECTION ? CIGARS_SEO : OUR_CIGARS_SEO}
        path="/cigars"
      />

      {!SHOW_HUMIDOR_SELECTION ? (
        <>
          <section className="section-padding border-b border-border/40 bg-muted/30">
            <div className="container mx-auto max-w-4xl text-center">
              <h1 className="mb-4 font-heading text-4xl font-bold text-foreground md:text-5xl">Our Cigars</h1>
              <p className="mx-auto max-w-2xl font-body leading-relaxed text-muted-foreground">
                A sample of the premium cigars we carry—visit the lounge for our full humidor and personal recommendations.
                Must be 21+ to purchase.
              </p>
            </div>
          </section>

          <section className="section-padding">
            <div className="container mx-auto">
              <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 xl:grid-cols-3">
                {OUR_CIGARS_STATIC.map((c) => (
                  <li key={c.name}>
                    <Card className="h-full overflow-hidden border-border/80 shadow-card transition-opacity">
                      <CigarCardHero
                        src={c.imageSrc}
                        alt={`Representative cigar photo for ${c.name}. Visit the lounge to see our current selection.`}
                      />
                      <CardHeader className="space-y-3 pb-2">
                        <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                          <CardTitle className="font-heading pr-2 text-lg leading-snug text-balance">{c.name}</CardTitle>
                        </div>
                        <p className="font-heading text-xl text-primary">{c.meta}</p>
                        <Badge
                          variant="outline"
                          className="w-fit border-primary/55 bg-primary/10 font-body text-xs font-medium text-primary"
                        >
                          {c.strength}
                        </Badge>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      ) : null}

      <div
        className={cn(!SHOW_HUMIDOR_SELECTION && "hidden")}
        aria-hidden={!SHOW_HUMIDOR_SELECTION}
        data-phase="humidor-selection-deferred"
      >
        <HumidorSelectionHidden />
      </div>
    </Layout>
  );
};

export default Cigars;
