import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-3 focus:text-sm focus:font-body focus:uppercase focus:tracking-wider focus:text-foreground focus:shadow-card focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
    >
      Skip to main content
    </a>
    <Navbar />
    <main id="main-content" className="flex-1 pt-20 outline-none" tabIndex={-1}>
      {children}
    </main>
    <Footer />
  </div>
);

export default Layout;
