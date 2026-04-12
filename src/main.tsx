import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/AuthProvider";
import { queryClient } from "@/lib/queryClient";
import App from "./App.tsx";
import { AnalyticsScripts } from "./components/AnalyticsScripts";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <AnalyticsScripts />
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);
