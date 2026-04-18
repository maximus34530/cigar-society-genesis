import Layout from "@/components/Layout";
import { FadeUp } from "@/components/FadeUp";
import { Seo } from "@/components/Seo";
import { business } from "@/lib/business";

const TERMS_DESCRIPTION =
  "Terms and Conditions for Cigar Society, LLC — Texas premium cigar lounge, age 21+, in-person sales only, Pharr, TX.";

const Terms = () => (
  <Layout>
    <Seo title="Terms & Conditions" description={TERMS_DESCRIPTION} path="/terms" />
    <section className="section-padding border-b border-border/40 bg-muted/30">
      <FadeUp className="container mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground font-body">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </FadeUp>
    </section>
    <section className="section-padding">
      <FadeUp className="container mx-auto max-w-3xl space-y-10 text-muted-foreground font-body leading-relaxed">
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">1. Agreement to these terms</h2>
          <p>
            These Terms & Conditions (“Terms”) govern your access to and use of the website operated by{" "}
            <strong className="text-foreground">{business.name}</strong> (“Cigar Society,” “we,” “us”). By using our
            site, you agree to these Terms. If you do not agree, please do not use the website.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">2. Age, tobacco sales, and eligibility</h2>
          <p>
            Our lounge and this website are intended for adults <strong className="text-foreground">21 years of age or
            older</strong>. You must be at least 21 to enter {business.name}, purchase or consume tobacco products, or
            purchase or consume alcoholic beverages where permitted by law.{" "}
            <strong className="text-foreground">
              We do not sell tobacco products to minors, and we do not facilitate online or mail-order tobacco sales
              through this website at this phase of our business.
            </strong>{" "}
            Tobacco and alcohol sales, when available, occur in person at our licensed premises in accordance with
            applicable Texas and local law. We may refuse service to anyone who cannot verify age or who violates our
            house policies.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">3. In-person lounge; no e-commerce for tobacco</h2>
          <p>
            This website is informational and supports visits to our Pharr lounge.{" "}
            <strong className="text-foreground">
              We do not operate e-commerce for cigars or other age-restricted tobacco products on this site at this
              time.
            </strong>{" "}
            Any product lists, menus, or pricing shown online are for reference only and may differ from same-day
            humidor availability. Purchases of cigars and related items are completed on site subject to ID verification
            and inventory.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">4. Tobacco and alcohol</h2>
          <p>
            Cigar Society offers cigars and alcoholic beverages in accordance with applicable Texas and local regulations.
            Nothing on this website constitutes medical, legal, or investment advice. Smoking involves health risks; use
            tobacco products only as intended and at your own discretion.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">5. Website content</h2>
          <p>
            We strive for accurate hours, offerings, and imagery, but details may change without notice. Hours,
            inventory, and events described online are subject to update. For the most current information, contact us
            at <a href={`tel:${business.phoneE164}`} className="text-foreground underline-offset-4 hover:underline">(956) 223-1303</a>{" "}
            or visit us at {business.address}.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">6. Intellectual property</h2>
          <p>
            All text, graphics, logos, and media on this site are owned by {business.name} or our licensors and are
            protected by copyright and trademark laws. You may not copy, scrape, or redistribute site content for
            commercial use without written permission.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">7. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, {business.name} and its owners, employees, and partners are not
            liable for indirect, incidental, or consequential damages arising from your use of this website or your
            visit to our lounge. Our liability for any claim related to the site is limited to the amount you paid to
            access the site (if any), or one hundred U.S. dollars, whichever is greater.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">8. Governing law and venue</h2>
          <p>
            These Terms are governed by the <strong className="text-foreground">laws of the State of Texas</strong>,
            without regard to conflict-of-law principles. Except where federal law requires otherwise, you agree that
            exclusive venue for any dispute arising from these Terms or your visit to our lounge shall be in the state
            or federal courts located in <strong className="text-foreground">Hidalgo County, Texas</strong>.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">9. Changes</h2>
          <p>
            We may update these Terms from time to time. The “Last updated” date at the top of this page will change
            when we do. Continued use of the site after changes constitutes acceptance of the revised Terms.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">10. Event tickets purchased through this website</h2>
          <p>
            When you purchase tickets for events through this website (including any deposit or ticket fee processed
            online), <strong className="text-foreground">all ticket sales are final and non-refundable</strong>, except
            where applicable law requires otherwise. Ticket purchases are not cancelled or modified through the website
            by customers; questions may be directed to us by phone. Event dates, capacity, and programming may change;
            we will use reasonable efforts to communicate material changes but{" "}
            <strong className="text-foreground">non-payment, abandonment of checkout, or failure to attend does not
            create a refund obligation.</strong>
          </p>
          <p className="mt-3">
            A <strong className="text-foreground">service charge</strong> may be added at checkout on top of the ticket
            subtotal. <strong className="text-foreground">Applicable sales tax is included in that service charge</strong>{" "}
            (it is not shown as a separate line item).
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">11. Contact</h2>
          <p>
            Questions about these Terms?{" "}
            <a href={`tel:${business.phoneE164}`} className="text-foreground underline-offset-4 hover:underline">(956) 223-1303</a>
            <br />
            <span className="text-foreground">116 W State Ave, Pharr, TX 78577</span>
          </p>
        </div>
      </FadeUp>
    </section>
  </Layout>
);

export default Terms;
