import { Link } from "react-router-dom";
import { Clock, Instagram, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { business } from "@/lib/business";
import { trackEvent } from "@/lib/analytics";

const Footer = () => {
  return (
    <footer className="footer-border-glow relative bg-muted/90 shadow-[inset_0_1px_0_hsl(var(--gold)/0.12)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="container mx-auto section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-heading text-2xl mb-4">
              <Link
                to="/"
                className="inline-flex items-center gap-3 group text-primary hover:text-primary/90 transition-colors touch-manipulation"
              >
                <BrandLogo variant="footer" />
                <span>{business.publicVenueName}</span>
              </Link>
            </h3>
            <p className="text-muted-foreground font-body leading-relaxed">
              A premium cigar lounge experience in the heart of the Rio Grande Valley.
            </p>
            <div className="flex gap-2 mt-6">
              <a
                href="https://www.facebook.com/cigarsocietyus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-primary transition-colors touch-manipulation rounded-md"
                aria-label="Facebook"
                onClick={() => trackEvent("Social Click", { location: "footer", platform: "facebook" })}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="https://tiktok.com/@cigarsocietytx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-primary transition-colors touch-manipulation rounded-md"
                aria-label="TikTok"
                onClick={() => trackEvent("Social Click", { location: "footer", platform: "tiktok" })}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-primary transition-colors touch-manipulation rounded-md"
                aria-label="Instagram"
                onClick={() => trackEvent("Social Click", { location: "footer", platform: "instagram" })}
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg text-foreground mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link to="/cigars" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Cigars
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
            <h4 className="font-heading text-sm text-foreground/90 mt-8 mb-3 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg text-foreground mb-4">Visit Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                {business.address}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a
                  href={`tel:${business.phoneE164}`}
                  className="inline-flex min-h-[44px] items-center hover:text-primary transition-colors touch-manipulation"
                  onClick={() => trackEvent("Phone Click", { location: "footer" })}
                >
                  {business.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {business.hoursSchedule.map((row) => (
                    <div key={row.day} className="flex justify-between gap-3 text-left">
                      <span className="text-foreground/90">{row.day}</span>
                      <span className="shrink-0 tabular-nums">{row.hours}</span>
                    </div>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {business.name}. All rights reserved. Must be 21+ to enter.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
