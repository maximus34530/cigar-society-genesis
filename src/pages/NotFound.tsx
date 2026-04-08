import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <Layout>
    <Seo
      title="Page not found"
      description="The page you are looking for does not exist at Cigar Society."
      path="/404"
      noIndex
    />
    <section className="section-padding flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-8">This page doesn’t exist or has moved.</p>
        <Button asChild className="btn-gold-shimmer bg-gold-gradient font-body uppercase tracking-wider text-primary-foreground">
          <Link to="/">Return home</Link>
        </Button>
      </div>
    </section>
  </Layout>
);

export default NotFound;
