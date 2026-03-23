import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { business } from "@/lib/business";

const PRIVACY_DESCRIPTION =
  "Privacy Policy for Cigar Society, LLC in Pharr, TX — how we handle website visits, analytics, and contact inquiries.";

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
            “we”) collects and uses information when you use our website. Our physical location is {business.address}.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">2. Information we collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-foreground">Contact form.</strong> If you submit our contact form, we may
              receive the name, email, phone number, and message you enter.{" "}
              <strong className="text-foreground">
                This website does not currently transmit form submissions to our team; call {business.phoneDisplay}{" "}
                for time-sensitive requests.
              </strong>
            </li>
            <li>
              <strong className="text-foreground">Phone & directions.</strong> When you tap to call or open maps, your
              device handles that action; we do not receive additional personal data from those links beyond what your
              carrier or map provider processes.
            </li>
            <li>
              <strong className="text-foreground">Analytics.</strong> If configured in our hosting environment, we may
              use privacy-focused or industry-standard analytics (for example Plausible or Google Analytics) to
              understand aggregate traffic. Those tools receive typical technical data such as approximate location,
              device type, and pages viewed—not passwords or payment card data, which we do not collect on this site.
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">3. How we use information</h2>
          <p>
            We use contact details you provide directly (for example by phone or in person) to respond to questions,
            coordinate visits, and operate the lounge. Analytics data helps us improve the website and understand what
            content matters to visitors.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">4. Cookies and similar technologies</h2>
          <p>
            Our analytics providers may set cookies or use similar storage to measure visits. You can control cookies
            through your browser settings. Essential site functionality does not rely on non-essential tracking.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">5. Third-party services</h2>
          <p>
            Our site may link to social networks, maps, or other services. Those services have their own privacy
            policies. We are not responsible for their practices.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">6. Children</h2>
          <p>
            This website is not directed at individuals under 21. We do not knowingly collect personal information
            from anyone under 21 online.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">7. Your choices</h2>
          <p>
            You may request access to or correction of personal information we hold about you from in-person or phone
            interactions, subject to applicable law. For website-specific requests, contact us at {business.phoneDisplay}.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">8. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy when our practices or regulations change. The “Last updated” date will
            reflect revisions. Material changes will be posted on this page.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-3">9. Contact</h2>
          <p>
            {business.name} · {business.address} · {business.phoneDisplay}
          </p>
        </div>
      </div>
    </section>
  </Layout>
);

export default Privacy;
