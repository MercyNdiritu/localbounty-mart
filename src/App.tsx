
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppProvider } from "@/contexts/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SellersPage from "./pages/SellersPage";
import CartPage from "./pages/CartPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import BasicAnalyticsPage from "./pages/BasicAnalyticsPage";
import PromotionalToolsPage from "./pages/PromotionalToolsPage";
import ShippingManagementPage from "./pages/ShippingManagementPage";
import CustomerSupportPage from "./pages/CustomerSupportPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/sellers" element={<SellersPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
                <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
                <Route path="/seller/products" element={<ProductManagementPage />} />
                <Route path="/seller/analytics" element={<BasicAnalyticsPage />} />
                <Route path="/seller/promotions" element={<PromotionalToolsPage />} />
                <Route path="/seller/shipping" element={<ShippingManagementPage />} />
                <Route path="/seller/customer-support" element={<CustomerSupportPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
