import { useState } from "react";
import Layout from "@/components/Layout";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";
import { business } from "@/lib/business";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const headingFade = useFadeInOnScroll(0);
  const formFade = useFadeInOnScroll(80);
  const infoFade = useFadeInOnScroll(160);

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
          <div ref={headingFade.ref} style={headingFade.style} className={cn(headingFade.className)}>
            <SectionHeading title="Contact Us" subtitle="Call or visit us in Pharr—or leave a note while we finish online messaging." />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto min-w-0">
            <form
              ref={formFade.ref}
              style={formFade.style}
              onSubmit={handleSubmit}
              className={cn("space-y-6 min-w-0", formFade.className)}
            >
              <p className="text-sm text-muted-foreground font-body leading-relaxed border border-border/60 rounded-lg p-4 bg-card/50">
                The form below does not send messages to our team yet. For reservations or questions, please call{" "}
                {business.phoneDisplay} or stop by during business hours.
              </p>
              <div>
                <label htmlFor="name" className="text-sm font-body text-muted-foreground mb-1 block">Name</label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-card border-border max-w-full" />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-body text-muted-foreground mb-1 block">Email</label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="bg-card border-border max-w-full" />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-body text-muted-foreground mb-1 block">Phone</label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="bg-card border-border max-w-full"
                />
              </div>
              <div>
                <label htmlFor="message" className="text-sm font-body text-muted-foreground mb-1 block">Message</label>
                <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="bg-card border-border max-w-full" />
              </div>
              <Button type="submit" size="lg" className="bg-gold-gradient text-primary-foreground font-body tracking-wider uppercase text-sm px-8 shadow-gold hover:opacity-90 w-full sm:w-auto">
                Send Message
              </Button>
            </form>

            <div ref={infoFade.ref} style={infoFade.style} className={cn("space-y-8 min-w-0", infoFade.className)}>
              <div>
                <h3 className="font-heading text-xl text-foreground mb-4">Visit Our Lounge</h3>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
                  >
                    <a
                      href={`tel:${business.phoneE164}`}
                      onClick={() => trackEvent("Phone Click", { location: "contact-cta" })}
                    >
                      Call Now
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
                  >
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
                <ul className="space-y-4 text-muted-foreground text-sm">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{business.address}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    <a
                      href={`tel:${business.phoneE164}`}
                      className="hover:text-primary transition-colors"
                      onClick={() => trackEvent("Phone Click", { location: "contact-info" })}
                    >
                      {business.phoneDisplay}
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p>{business.hoursText}</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="overflow-hidden rounded-lg border border-border shadow-card max-w-full">
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
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
