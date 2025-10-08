import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SocialMedia from "./pages/SocialMedia";
import EmailMarketing from "./pages/EmailMarketing";
import ContentCreation from "./pages/ContentCreation";
import CampaignAutopilot from "./pages/CampaignAutopilot";
import Campaigns from "./pages/Campaigns";
import SocialListening from "./pages/SocialListening";
import LeadGeneration from "./pages/LeadGeneration";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/social-media" element={<ProtectedRoute><SocialMedia /></ProtectedRoute>} />
          <Route path="/email-marketing" element={<ProtectedRoute><EmailMarketing /></ProtectedRoute>} />
          <Route path="/content-creation" element={<ProtectedRoute><ContentCreation /></ProtectedRoute>} />
          <Route path="/campaign-autopilot" element={<ProtectedRoute><CampaignAutopilot /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/social-listening" element={<ProtectedRoute><SocialListening /></ProtectedRoute>} />
          <Route path="/lead-generation" element={<ProtectedRoute><LeadGeneration /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
