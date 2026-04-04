import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";

const CIGARS_COMING_SEO =
  "Cigar Society humidor menu in Pharr, TX — online listing coming soon. Visit the lounge or call for today’s selection. 21+.";

const Cigars = () => (
  <Layout>
    <Seo title="Humidor Selection — Coming Soon" description={CIGARS_COMING_SEO} path="/cigars" />
    <section className="section-padding flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center border-b border-border/40 bg-muted/30">
      <div className="mx-auto max-w-lg px-4 text-center">
        <h1 className="font-heading text-4xl font-bold text-foreground md:text-5xl">Humidor selection</h1>
        <p className="mt-6 font-heading text-xl font-semibold tracking-wide text-muted-foreground md:text-2xl">
          Coming soon
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground font-body">
          Our online cigar menu is on the way. Stop by the lounge or get in touch for what&apos;s in the humidor today.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-body uppercase tracking-wider"
          >
            <Link to="/contact">Contact</Link>
          </Button>
          <Button asChild className="bg-gold-gradient font-body uppercase tracking-wider text-primary-foreground shadow-gold hover:opacity-90">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </section>
  </Layout>
);

export default Cigars;
