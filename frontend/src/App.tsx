import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import SmoothScroll from "./components/SmoothScroll";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import SessionHistory from "./pages/History";
import Security from "./pages/Security";
import SystemSettings from "./pages/Settings";
import SystemInfo from "./pages/SystemInfo";
import IntelHub from "./pages/IntelHub";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import RootLog from "./pages/RootLog";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ScrollToTop />
        <SmoothScroll />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<SessionHistory />} />
          <Route path="/security" element={<Security />} />
          <Route path="/settings" element={<SystemSettings />} />
          <Route path="/info" element={<SystemInfo />} />
          <Route path="/intel" element={<IntelHub />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/logs" element={<RootLog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Keep /auth as a redirect to /login for backward compatibility */}
          <Route path="/auth" element={<Login />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
