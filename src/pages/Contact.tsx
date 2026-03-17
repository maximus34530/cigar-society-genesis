import { useState } from "react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto">
          <SectionHeading title="Contact Us" subtitle="We'd love to hear from you. Visit us or send a message below." />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="text-sm font-body text-muted-foreground mb-1 block">Name</label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-card border-border" />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-body text-muted-foreground mb-1 block">Email</label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="bg-card border-border" />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-body text-muted-foreground mb-1 block">Phone</label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-card border-border" />
              </div>
              <div>
                <label htmlFor="message" className="text-sm font-body text-muted-foreground mb-1 block">Message</label>
                <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="bg-card border-border" />
              </div>
              <Button type="submit" size="lg" className="bg-gold-gradient text-primary-foreground font-body tracking-wider uppercase text-sm px-8 shadow-gold hover:opacity-90 w-full">
                Send Message
              </Button>
            </form>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h3 className="font-heading text-xl text-foreground mb-4">Visit Our Lounge</h3>
                <ul className="space-y-4 text-muted-foreground text-sm">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>116 W State Ave, Pharr, TX 78577</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    <a href="tel:+19562231303" className="hover:text-primary transition-colors">(956) 223-1303</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0" />
                    <a href="mailto:info@cigarsocietyus.com" className="hover:text-primary transition-colors">info@cigarsocietyus.com</a>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p>Mon–Thu: 12:00 PM – 10:00 PM</p>
                      <p>Fri–Sat: 12:00 PM – 12:00 AM</p>
                      <p>Sun: 12:00 PM – 8:00 PM</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg overflow-hidden border border-border shadow-card">
                <iframe
                  title="Cigar Society US location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3588.123!2d-98.185!3d26.195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDExJzQyLjAiTiA5OMKwMTEnMDYuMCJX!5e0!3m2!1sen!2sus!4v1234567890"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
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
