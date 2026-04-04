import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cigars } from "@/data/cigars";
import { cn } from "@/lib/utils";

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

const CIGARS_V1_SEO =
  "Archived humidor listing for Cigar Society, Pharr, TX — snapshot by strength with pricing. Must be 21+.";

type FilterKey = "all" | Strength;

const CigarsV1 = () => {
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
    <Layout>
      <Seo
        title="Humidor Selection (archive) — Cigar Menu"
        description={CIGARS_V1_SEO}
        path="/cigars-v1"
        noIndex
      />
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
                    "h-full border-border/80 shadow-card transition-opacity",
                    !c.inStock && "bg-muted/40 opacity-60",
                  )}
                >
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
    </Layout>
  );
};

export default CigarsV1;
