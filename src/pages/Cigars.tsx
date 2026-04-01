import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cigars } from "@/data/cigars";
import { business } from "@/lib/business";
import { cn } from "@/lib/utils";

const sorted = [...cigars].sort((a, b) => a.name.localeCompare(b.name));

const CIGARS_SEO =
  "Browse premium cigars available at Cigar Society in Pharr, TX — lounge inventory snapshot with pricing. Must be 21+.";

const Cigars = () => (
  <Layout>
    <Seo title="Cigar Menu — Premium Selection" description={CIGARS_SEO} path="/cigars" />
    <section className="section-padding border-b border-border/40 bg-muted/30">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Cigars</h1>
        <p className="text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
          A snapshot of our Toast POS cigar inventory. Availability changes daily—ask our team for what&apos;s fresh in
          the humidor. Tobacco sales are for guests 21+ for on-site enjoyment at {business.shortName} only; we do not
          ship or sell online at this time.
        </p>
      </div>
    </section>

    <section className="section-padding">
      <div className="container mx-auto">
        <SectionHeading
          title="Humidor selection"
          subtitle={`${sorted.length} cigars listed · prices as posted in POS`}
        />
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 list-none p-0 m-0">
          {sorted.map((c) => (
            <li key={c.id}>
              <Card
                className={cn(
                  "h-full border-border/80 shadow-card transition-opacity",
                  !c.inStock && "opacity-60 bg-muted/40"
                )}
              >
                <CardHeader className="space-y-2 pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                    <CardTitle className="font-heading text-lg leading-snug text-balance pr-2">{c.name}</CardTitle>
                    {!c.inStock ? (
                      <Badge variant="secondary" className="shrink-0 uppercase tracking-wide text-[0.65rem]">
                        Out of stock
                      </Badge>
                    ) : null}
                  </div>
                  <p className="font-heading text-primary text-xl">{c.price}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  {c.description ? (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">{c.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground/80 italic">No description on file.</p>
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

export default Cigars;
