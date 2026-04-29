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
const Gallery = lazy(() => import("./pages/Gallery"));
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
                <Route path="/gallery" element={<Gallery />} />
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
