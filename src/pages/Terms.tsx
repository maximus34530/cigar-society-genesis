import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { business } from "@/lib/business";

const TERMS_DESCRIPTION =
  "Terms and Conditions for using the Cigar Society, LLC website. Age 21+, tobacco products, and use of our Pharr, TX lounge information.";

const Terms = () => (
  <Layout>
    <Seo title="Terms & Conditions" description={TERMS_DESCRIPTION} path="/terms" />
    <section className="section-padding border-b border-border/40 bg-muted/30">
      <div className="container mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground font-body">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </section>
    <section className="section-padding">
      <div className="container mx-auto max-w-3xl space-y-10 text-muted-foreground font-body leading-relaxed">
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">1. Agreement to these terms</h2>
          <p>
            These Terms & Conditions (“Terms”) govern your access to and use of the website operated by{" "}
            <strong className="text-foreground">{business.name}</strong> (“Cigar Society,” “we,” “us”). By using our
            site, you agree to these Terms. If you do not agree, please do not use the website.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">2. Age and eligibility</h2>
          <p>
            Our lounge and this website are intended for adults 21 years of age or older. You must be at least 21 to
            enter {business.name} and to purchase or consume tobacco products where permitted by law. We may refuse
            service to anyone who cannot verify age or who violates our house policies.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">3. Tobacco and alcohol</h2>
          <p>
            Cigar Society offers cigars and alcoholic beverages in accordance with applicable Texas and local
            regulations. Nothing on this website constitutes medical, legal, or investment advice. Smoking involves
            health risks; use tobacco products only as intended and at your own discretion.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">4. Website content</h2>
          <p>
            We strive for accurate hours, offerings, and imagery, but details may change without notice. Hours,
            inventory, and events described online are subject to update. For the most current information, contact us
            at {business.phoneDisplay} or visit us at {business.address}.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">5. Intellectual property</h2>
          <p>
            All text, graphics, logos, and media on this site are owned by {business.name} or our licensors and are
            protected by copyright and trademark laws. You may not copy, scrape, or redistribute site content for
            commercial use without written permission.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">6. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, {business.name} and its owners, employees, and partners are not
            liable for indirect, incidental, or consequential damages arising from your use of this website or your
            visit to our lounge. Our liability for any claim related to the site is limited to the amount you paid to
            access the site (if any), or one hundred U.S. dollars, whichever is greater.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">7. Governing law</h2>
          <p>
            These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law principles.
            Any dispute shall be brought in courts located in Hidalgo County, Texas, unless otherwise required by law.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">8. Changes</h2>
          <p>
            We may update these Terms from time to time. The “Last updated” date at the top of this page will change
            when we do. Continued use of the site after changes constitutes acceptance of the revised Terms.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">9. Contact</h2>
          <p>
            Questions about these Terms: {business.phoneDisplay} · {business.address}
          </p>
        </div>
      </div>
    </section>
  </Layout>
);

export default Terms;
