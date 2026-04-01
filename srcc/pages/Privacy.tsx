import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { business } from "@/lib/business";

const PRIVACY_DESCRIPTION =
  "Privacy Policy for Cigar Society, LLC — Pharr, TX premium cigar lounge. Age 21+; no online tobacco sales; contact (956) 223-1303.";

const Privacy = () => (
  <Layout>
    <Seo title="Privacy Policy" description={PRIVACY_DESCRIPTION} path="/privacy" />
    <section className="section-padding border-b border-border/40 bg-muted/30">
      <div className="container mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground font-body">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </section>
    <section className="section-padding">
      <div className="container mx-auto max-w-3xl space-y-10 text-muted-foreground font-body leading-relaxed">
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">1. Who we are</h2>
          <p>
            This policy describes how <strong className="text-foreground">{business.name}</strong> (“Cigar Society,”
            “we”) collects and uses information when you use our website. We operate a{" "}
            <strong className="text-foreground">Texas-based premium cigar lounge</strong> at {business.address}. Our
            lounge serves guests who are <strong className="text-foreground">21 years of age or older</strong>. We do
            not market tobacco to minors and we do not sell tobacco products to minors.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">2. In-person services and age-restricted products</h2>
          <p>
            <strong className="text-foreground">
              We do not offer e-commerce or online ordering for cigars or other age-restricted tobacco products through
              this website at this phase of our business.
            </strong>{" "}
            Age verification and purchases for tobacco and alcohol occur on site in compliance with applicable law. This
            site may display menus or product information for planning your visit; it is not an online store for tobacco.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">3. Information we collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-foreground">Contact form.</strong> If you submit our contact form, we may receive
              the name, email, phone number, and message you enter.{" "}
              <strong className="text-foreground">
                This website does not currently transmit form submissions to our team; call (956) 223-1303 for
                time-sensitive requests.
              </strong>
            </li>
            <li>
              <strong className="text-foreground">Phone & directions.</strong> When you tap to call or open maps, your
              device handles that action; we do not receive additional personal data from those links beyond what your
              carrier or map provider processes.
            </li>
            <li>
              <strong className="text-foreground">Analytics.</strong> If configured in our hosting environment, we may
              use privacy-focused or industry-standard analytics (for example Plausible or Google Analytics) to understand
              aggregate traffic. Those tools receive typical technical data such as approximate location, device type,
              and pages viewed—not passwords or payment card data, which we do not collect on this site.
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">4. How we use information</h2>
          <p>
            We use contact details you provide directly (for example by phone or in person) to respond to questions,
            coordinate visits, and operate the lounge. Analytics data helps us improve the website and understand what
            content matters to visitors.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">5. Cookies and similar technologies</h2>
          <p>
            Our analytics providers may set cookies or use similar storage to measure visits. You can control cookies
            through your browser settings. Essential site functionality does not rely on non-essential tracking.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">6. Third-party services</h2>
          <p>
            Our site may link to social networks, maps, or other services. Those services have their own privacy
            policies. We are not responsible for their practices.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">7. Children and minors</h2>
          <p>
            This website is not directed at individuals under 21. We do not knowingly collect personal information from
            anyone under 21 online, and we do not sell tobacco products to minors.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">8. Your choices</h2>
          <p>
            You may request access to or correction of personal information we hold about you from in-person or phone
            interactions, subject to applicable law. For website-specific requests, contact us at (956) 223-1303.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">9. Texas notice</h2>
          <p>
            Where applicable, Texas consumers may have rights under state privacy law. This policy is provided by a
            business operating in <strong className="text-foreground">Pharr, Hidalgo County, Texas</strong>. To exercise
            rights or ask questions, contact us using the information below.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">10. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy when our practices or regulations change. The “Last updated” date will
            reflect revisions. Material changes will be posted on this page.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">11. Contact</h2>
          <p>
            {business.name}
            <br />
            116 W State Ave, Pharr, TX 78577
            <br />
            <a href={`tel:${business.phoneE164}`} className="text-foreground underline-offset-4 hover:underline">(956) 223-1303</a>
          </p>
        </div>
      </div>
    </section>
  </Layout>
);

export default Privacy;
