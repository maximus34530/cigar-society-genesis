import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/components/AuthProvider";
import App from "./App.tsx";
import { AnalyticsScripts } from "./components/AnalyticsScripts";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <AnalyticsScripts />
    <AuthProvider>
      <App />
    </AuthProvider>
  </HelmetProvider>
);
