import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Gallery", path: "/gallery" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ease-out",
        scrolled || open
          ? "bg-background/90 backdrop-blur-md border-b border-border/40 shadow-nav"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="container mx-auto grid h-20 grid-cols-[1fr_auto] items-center px-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 justify-start">
          <Link to="/" className="inline-flex shrink-0 items-center touch-manipulation">
            <BrandLogo />
          </Link>
        </div>

        <div className="hidden min-w-0 justify-center lg:flex">
          <ul className="flex items-center justify-center gap-5 xl:gap-7">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`relative pb-0.5 text-sm font-body tracking-widest uppercase transition-colors duration-300 ease-out hover:text-primary after:pointer-events-none after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-full after:-translate-x-1/2 after:origin-center after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 ${
                    location.pathname === link.path ? "text-primary after:scale-x-100" : "text-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-foreground touch-manipulation lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-background border-t border-border animate-fade-in"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <ul className="flex flex-col py-6">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-[44px] items-center px-6 py-3 text-sm tracking-widest uppercase transition-colors touch-manipulation hover:text-primary hover:bg-muted ${
                    location.pathname === link.path ? "text-primary" : "text-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
