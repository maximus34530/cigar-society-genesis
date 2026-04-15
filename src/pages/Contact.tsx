import { useState } from "react";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/FadeUp";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { business } from "@/lib/business";
import { trackEvent } from "@/lib/analytics";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("Contact Form Submit", { location: "contact-page" });
    toast({
      title: "Thanks for reaching out",
      description: `This site does not send messages to our team yet. For same-day help, call ${business.phoneDisplay}.`,
    });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <Layout>
      <Seo
        title="Contact — Hours, Map & Message"
        description="Contact Cigar Society in Pharr, TX — phone, directions, hours, and a message form. Visit our Rio Grande Valley cigar lounge."
        path="/contact"
      />
      <section className="section-warm-radial section-padding">
        <div className="container mx-auto min-w-0">
          <FadeUp>
            <SectionHeading title="Contact Us" subtitle="Call or visit us in Pharr—or leave a note while we finish online messaging." />
          </FadeUp>

          <div className="grid max-w-5xl grid-cols-1 gap-12 mx-auto min-w-0 lg:grid-cols-2">
            <FadeUp delay={0.06}>
              <form onSubmit={handleSubmit} className="space-y-6 min-w-0">
                <p className="rounded-lg border border-border/60 bg-card/50 p-4 font-body text-sm leading-relaxed text-muted-foreground">
                  The form below does not send messages to our team yet. For reservations or questions, please call{" "}
                  {business.phoneDisplay} or stop by during business hours.
                </p>
                <div>
                  <label htmlFor="name" className="mb-1 block font-body text-sm text-muted-foreground">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="max-w-full border-border bg-card"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1 block font-body text-sm text-muted-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="max-w-full border-border bg-card"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1 block font-body text-sm text-muted-foreground">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    className="max-w-full border-border bg-card"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1 block font-body text-sm text-muted-foreground">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="max-w-full border-border bg-card"
                  />
                </div>
                <Button type="submit" size="lg" variant="luxury" className="w-full font-body text-sm uppercase tracking-wider sm:w-auto">
                  Send Message
                </Button>
              </form>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="space-y-8 min-w-0">
                <div>
                  <h3 className="mb-4 font-heading text-xl text-foreground">Visit Our Lounge</h3>
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg" variant="luxury" className="w-full sm:w-auto">
                      <a
                        href={`tel:${business.phoneE164}`}
                        onClick={() => trackEvent("Phone Click", { location: "contact-cta" })}
                      >
                        Call Now
                      </a>
                    </Button>
                    <Button asChild size="lg" variant="luxury" className="w-full sm:w-auto">
                      <a
                        href={business.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent("Directions", { location: "contact-cta" })}
                      >
                        Get Directions
                      </a>
                    </Button>
                  </div>
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span>{business.address}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="h-5 w-5 shrink-0 text-primary" />
                      <a
                        href={`tel:${business.phoneE164}`}
                        className="transition-colors duration-[600ms] ease-out hover:text-primary"
                        onClick={() => trackEvent("Phone Click", { location: "contact-info" })}
                      >
                        {business.phoneDisplay}
                      </a>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p>{business.hoursText}</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="max-w-full overflow-hidden rounded-lg border border-border shadow-card">
                  <iframe
                    title={`${business.name} location`}
                    src={business.mapEmbedSrc}
                    width="100%"
                    height="250"
                    className="w-full max-w-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
