import { lazy, Suspense, useCallback, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AgeGate } from "@/components/AgeGate";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAgeVerified, setAgeVerified } from "@/lib/ageGateStorage";
import { PostAuthEmailConfirmRedirect } from "@/components/PostAuthEmailConfirmRedirect";
import { PageLoadingFallback } from "./components/PageLoadingFallback";

const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Cigars = lazy(() => import("./pages/Cigars"));
const CigarsV1 = lazy(() => import("./pages/CigarsV1"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Events = lazy(() => import("./pages/Events"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminSessions = lazy(() => import("./pages/admin/AdminSessions"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AccountLayout = lazy(() => import("./pages/account/AccountLayout"));
const AccountProfilePage = lazy(() => import("./pages/account/AccountProfilePage"));
const AccountBookingsPage = lazy(() => import("./pages/account/AccountBookingsPage"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

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
              <PostAuthEmailConfirmRedirect />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/cigars" element={<Cigars />} />
                <Route path="/cigars-v1" element={<CigarsV1 />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/events" element={<Events />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/account" element={<AccountLayout />}>
                  <Route index element={<Navigate to="/account/profile" replace />} />
                  <Route path="profile" element={<AccountProfilePage />} />
                  <Route path="bookings" element={<AccountBookingsPage />} />
                </Route>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="clients" element={<AdminClients />} />
                  <Route path="bookings" element={<AdminBookings />} />
                </Route>
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
