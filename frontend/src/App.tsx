import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Marketplace from "@/pages/Marketplace";
import ProductDetail from "@/pages/ProductDetail";
import CitizenDashboard from "@/pages/dashboard/CitizenDashboard";
import CollectorDashboard from "@/pages/dashboard/CollectorDashboard";
import RecyclerDashboard from "@/pages/dashboard/RecyclerDashboard";
import NewCollection from "@/pages/dashboard/NewCollection";
import CitizenHistory from "@/pages/dashboard/CitizenHistory";
import CitizenRecyclersMap from "@/pages/dashboard/CitizenRecyclersMap";
import CollectorMap from "@/pages/dashboard/CollectorMap";
import CollectorHistory from "@/pages/dashboard/CollectorHistory";
import RecyclerMarketplace from "@/pages/dashboard/RecyclerMarketplace";
import RecyclerOrders from "@/pages/dashboard/RecyclerOrders";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Legal from "@/pages/Legal";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Routes with MainLayout (Header + Footer) */}
              <Route element={<MainLayout />}>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/:id" element={<ProductDetail />} />
                <Route path="/legal" element={<Legal />} />
                
                {/* Citizen Routes */}
                <Route path="/dashboard/citizen" element={<CitizenDashboard />} />
                <Route path="/dashboard/citizen/new-collection" element={<NewCollection />} />
                <Route path="/dashboard/citizen/history" element={<CitizenHistory />} />
                <Route path="/dashboard/citizen/recyclers" element={<CitizenRecyclersMap />} />
                
                {/* Collector Routes */}
                <Route path="/dashboard/collector" element={<CollectorDashboard />} />
                <Route path="/dashboard/collector/map" element={<CollectorMap />} />
                <Route path="/dashboard/collector/history" element={<CollectorHistory />} />
                
                {/* Recycler Routes */}
                <Route path="/dashboard/recycler" element={<RecyclerDashboard />} />
                <Route path="/dashboard/recycler/marketplace" element={<RecyclerMarketplace />} />
                <Route path="/dashboard/recycler/orders" element={<RecyclerOrders />} />
                
                {/* Shared Routes */}
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Routes without MainLayout */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/chat" element={<Chat />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
