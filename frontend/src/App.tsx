import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance
const Landing = lazy(() => import("@/pages/Landing"));
const Auth = lazy(() => import("@/pages/Auth"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const CitizenDashboard = lazy(() => import("@/pages/dashboard/CitizenDashboard"));
const CollectorDashboard = lazy(() => import("@/pages/dashboard/CollectorDashboard"));
const RecyclerDashboard = lazy(() => import("@/pages/dashboard/RecyclerDashboard"));
const NewCollection = lazy(() => import("@/pages/dashboard/NewCollection"));
const CitizenHistory = lazy(() => import("@/pages/dashboard/CitizenHistory"));
const CitizenRecyclersMap = lazy(() => import("@/pages/dashboard/CitizenRecyclersMap"));
const CollectorMap = lazy(() => import("@/pages/dashboard/CollectorMap"));
const CollectorHistory = lazy(() => import("@/pages/dashboard/CollectorHistory"));
const RecyclerMarketplace = lazy(() => import("@/pages/dashboard/RecyclerMarketplace"));
const RecyclerOrders = lazy(() => import("@/pages/dashboard/RecyclerOrders"));
const Chat = lazy(() => import("@/pages/Chat"));
const Profile = lazy(() => import("@/pages/Profile"));
const Legal = lazy(() => import("@/pages/Legal"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
