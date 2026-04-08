import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ProfileMenu } from "@/components/ProfileMenu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Cigars", path: "/cigars" },
  { label: "Events", path: "/events" },
  { label: "Gallery", path: "/gallery" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

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
      <div className="container mx-auto flex items-center justify-between h-20 px-4">
        <Link to="/" className="inline-flex items-center touch-manipulation">
          <BrandLogo />
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          <ul className="flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`relative pb-0.5 text-sm font-body tracking-widest uppercase transition-colors duration-200 hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
                  location.pathname === link.path ? "text-primary after:w-full" : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          </ul>
          {user ? (
            <ProfileMenu />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-body tracking-widest uppercase text-foreground/70 hover:text-primary transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-body tracking-widest uppercase text-primary hover:text-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="lg:hidden text-foreground min-h-[44px] min-w-[44px] inline-flex items-center justify-center touch-manipulation rounded-md"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
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
            <li className="mt-3 px-6">
              <div className="h-px bg-border/70" />
            </li>
            {user ? (
              <li className="px-3 pt-4">
                <ProfileMenu className="w-full justify-start px-3" />
              </li>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className={`flex min-h-[44px] items-center px-6 py-3 text-sm tracking-widest uppercase transition-colors touch-manipulation hover:text-primary hover:bg-muted ${
                      location.pathname === "/login" ? "text-primary" : "text-foreground/70"
                    }`}
                  >
                    Log In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className={`flex min-h-[44px] items-center px-6 py-3 text-sm tracking-widest uppercase transition-colors touch-manipulation hover:text-primary hover:bg-muted ${
                      location.pathname === "/signup" ? "text-primary" : "text-foreground/70"
                    }`}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
