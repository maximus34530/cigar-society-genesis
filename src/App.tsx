import { lazy, Suspense, useCallback, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AgeGate } from "@/components/AgeGate";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAgeVerified, setAgeVerified } from "@/lib/ageGateStorage";
import { PageLoadingFallback } from "./components/PageLoadingFallback";

const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Cigars = lazy(() => import("./pages/Cigars"));
const CigarsV1 = lazy(() => import("./pages/CigarsV1"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Events = lazy(() => import("./pages/Events"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  const [ageVerified, setAgeVerifiedState] = useState(() => isAgeVerified());

  const handleAgeVerified = useCallback((remember: boolean) => {
    setAgeVerified(remember);
    setAgeVerifiedState(true);
  }, []);

  return (
    <TooltipProvider>
      {!ageVerified ? (
        <AgeGate onVerified={handleAgeVerified} />
      ) : (
        <>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/cigars" element={<Cigars />} />
                <Route path="/cigars-v1" element={<CigarsV1 />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/events" element={<Events />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </>
      )}
    </TooltipProvider>
  );
};

export default App;
