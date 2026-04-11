import Layout from "@/components/Layout";
import { ProfileMenu } from "@/components/ProfileMenu";
import { RequireAdmin } from "@/components/RequireAdmin";
import { Seo } from "@/components/Seo";
import { cn } from "@/lib/utils";
import { CalendarDays, LayoutDashboard, PartyPopper, Settings, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const sidebarLinks = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Events", to: "/admin/events", icon: PartyPopper },
  { label: "Clients", to: "/admin/clients", icon: Users },
  { label: "Bookings", to: "/admin/bookings", icon: CalendarDays },
];

export default function AdminLayout() {
  return (
    <RequireAdmin>
      <Layout>
        <Seo title="Admin" description="Admin dashboard." path="/admin" noIndex />
        <section className="section-padding">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] min-w-0">
              <aside className="min-w-0 rounded-2xl border border-border/60 bg-card/25 p-4 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:w-[280px]">
                <div className="flex items-center justify-between px-2 pb-3">
                  <div>
                    <p className="font-heading text-lg text-foreground">Admin</p>
                    <p className="mt-0.5 font-body text-xs text-muted-foreground">Cigar Society, LLC</p>
                  </div>
                  <Settings className="h-4 w-4 text-foreground/50 shrink-0" aria-hidden />
                </div>
                <div className="h-px bg-border/60 my-2" />
                <nav
                  className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0 -mx-1 px-1 snap-x snap-mandatory lg:snap-none [scrollbar-width:thin]"
                  aria-label="Admin sections"
                >
                  {sidebarLinks.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          "group flex min-h-[44px] shrink-0 snap-start items-center gap-2 rounded-xl px-3 py-2 font-body text-sm tracking-wide transition-colors hover:bg-muted/50 lg:w-full lg:shrink",
                          isActive ? "bg-muted/70 text-primary ring-1 ring-primary/15" : "text-foreground/70",
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 text-foreground/60 group-hover:text-primary shrink-0" />
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

