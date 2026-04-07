import Layout from "@/components/Layout";
import { ProfileMenu } from "@/components/ProfileMenu";
import { RequireAdmin } from "@/components/RequireAdmin";
import { Seo } from "@/components/Seo";
import { cn } from "@/lib/utils";
import { CalendarDays, ClipboardList, LayoutDashboard, Settings, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const sidebarLinks = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Sessions", to: "/admin/sessions", icon: ClipboardList },
  { label: "Clients", to: "/admin/clients", icon: Users },
  { label: "Bookings", to: "/admin/bookings", icon: CalendarDays },
];

export default function AdminLayout() {
  return (
    <RequireAdmin>
      <Layout>
        <Seo title="Admin" description="Admin dashboard." path="/admin" />
        <section className="section-padding">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
              <aside className="rounded-2xl border border-border/60 bg-card/25 p-4 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
                <div className="flex items-center justify-between px-2 pb-3">
                  <div>
                    <p className="font-heading text-lg text-foreground">Admin</p>
                    <p className="mt-0.5 font-body text-xs text-muted-foreground">Cigar Society, LLC</p>
                  </div>
                  <Settings className="h-4 w-4 text-foreground/50" aria-hidden />
                </div>
                <div className="h-px bg-border/60 my-2" />
                <nav className="space-y-1">
                  {sidebarLinks.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          "group flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 font-body text-sm tracking-wide transition-colors hover:bg-muted/50",
                          isActive ? "bg-muted/70 text-primary ring-1 ring-primary/15" : "text-foreground/70",
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 text-foreground/60 group-hover:text-primary" />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </aside>

              <div className="space-y-6">
                <header className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/25 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-heading text-2xl text-foreground">Dashboard Overview</p>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                      Monitor activity and manage key operations.
                    </p>
                  </div>
                  <ProfileMenu />
                </header>

                <Outlet />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </RequireAdmin>
  );
}

