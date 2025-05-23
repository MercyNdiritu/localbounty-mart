import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import { AppProvider } from "@/contexts/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SellersPage from "./pages/SellersPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import OrdersManagementPage from "./pages/OrdersManagementPage";
import BasicAnalyticsPage from "./pages/BasicAnalyticsPage";
import AdvancedAnalyticsPage from "./pages/AdvancedAnalyticsPage";
import PromotionalToolsPage from "./pages/PromotionalToolsPage";
import MarketingAutomationPage from "./pages/MarketingAutomationPage";
import ShippingManagementPage from "./pages/ShippingManagementPage";
import CustomerSupportPage from "./pages/CustomerSupportPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import ShopperDashboardPage from "./pages/ShopperDashboardPage";
import { Product, Order, OrderStatus } from "./types";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, userType, requiredType }: { 
  children: JSX.Element, 
  userType: 'customer' | 'seller' | 'guest',
  requiredType: 'customer' | 'seller'
}) => {
  if (userType === 'guest') {
    return <Navigate to="/login" replace />;
  }
  
  if (userType !== requiredType) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'p1',
      name: 'Farm Fresh Eggs',
      description: 'Locally sourced farm fresh eggs',
      price: 499, // KES
      image: '/placeholder.svg',
      category: 'farm',
      sellerId: 's5',
      stock: 24,
      deliveryOption: 'both'
    },
    {
      id: 'p2',
      name: 'Organic Tomatoes',
      description: 'Homegrown organic tomatoes',
      price: 349, // KES
      image: '/placeholder.svg',
      category: 'farm',
      sellerId: 's5',
      stock: 15,
      deliveryOption: 'delivery'
    },
    {
      id: 'p3',
      name: 'Handmade Soap',
      description: 'Natural handmade soap with lavender',
      price: 699, // KES
      image: '/placeholder.svg',
      category: 'handmade',
      sellerId: 's5',
      stock: 8,
      deliveryOption: 'pickup'
    },
    {
      id: 'p4',
      name: 'Fresh Honey',
      description: 'Raw unfiltered local honey',
      price: 999, // KES
      image: '/placeholder.svg',
      category: 'farm',
      sellerId: 's5',
      stock: 12,
      deliveryOption: 'both'
    },
    {
      id: 'p5',
      name: 'Artisan Bread',
      description: 'Freshly baked sourdough bread',
      price: 549, // KES
      image: '/placeholder.svg',
      category: 'handmade',
      sellerId: 's5',
      stock: 6,
      deliveryOption: 'pickup'
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-12345',
      customerId: 'CUST-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '0712345678',
      shippingAddress: {
        address: '123 Main St',
        city: 'Nairobi',
        county: 'Nairobi',
        postalCode: '00100'
      },
      items: [
        {
          productId: 'p1',
          productName: 'Farm Fresh Eggs',
          quantity: 2,
          price: 499
        },
        {
          productId: 'p4',
          productName: 'Fresh Honey',
          quantity: 1,
          price: 999
        }
      ],
      totalAmount: 1997,
      status: 'delivered',
      payment: {
        method: 'mpesa',
        status: 'completed',
        transactionId: 'TXN-98765'
      },
      sellerId: 's5',
      createdAt: '2023-12-01T09:30:00Z',
      updatedAt: '2023-12-01T09:30:00Z'
    },
    {
      id: 'ORD-12346',
      customerId: 'CUST-002',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      customerPhone: '0723456789',
      shippingAddress: {
        address: '456 Oak Ave',
        city: 'Mombasa',
        county: 'Mombasa',
        postalCode: '80100'
      },
      items: [
        {
          productId: 'p3',
          productName: 'Handmade Soap',
          quantity: 3,
          price: 699
        }
      ],
      totalAmount: 2097,
      status: 'processing',
      payment: {
        method: 'card',
        status: 'completed',
        transactionId: 'TXN-98766'
      },
      sellerId: 's5',
      createdAt: '2023-12-02T14:45:00Z',
      updatedAt: '2023-12-02T14:45:00Z'
    },
    {
      id: 'ORD-12347',
      customerId: 'CUST-003',
      customerName: 'Michael Ouma',
      customerEmail: 'michael@example.com',
      customerPhone: '0734567890',
      shippingAddress: {
        address: '789 Pine St',
        city: 'Kisumu',
        county: 'Kisumu',
        postalCode: '40100'
      },
      items: [
        {
          productId: 'p2',
          productName: 'Organic Tomatoes',
          quantity: 2,
          price: 349
        },
        {
          productId: 'p5',
          productName: 'Artisan Bread',
          quantity: 1,
          price: 549
        }
      ],
      totalAmount: 1247,
      status: 'pending',
      payment: {
        method: 'mpesa',
        status: 'pending'
      },
      sellerId: 's5',
      createdAt: '2023-12-03T11:20:00Z',
      updatedAt: '2023-12-03T11:20:00Z'
    }
  ]);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [...prev, order]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
    ));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider 
          initialProducts={products}
          orders={orders}
          addProduct={addProduct}
          updateProduct={updateProduct}
          deleteProduct={deleteProduct}
          addOrder={addOrder}
          updateOrderStatus={updateOrderStatus}
        >
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
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/subscription" element={<SubscriptionPage />} />
                  <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  
                  <Route 
                    path="/account" 
                    element={
                      <ProtectedRoute userType='customer' requiredType='customer'>
                        <ShopperDashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/seller/dashboard" 
                    element={
                      <ProtectedRoute userType='seller' requiredType='seller'>
                        <SellerDashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller/products" 
                    element={
                      <ProtectedRoute userType='seller' requiredType='seller'>
                        <ProductManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller/orders" 
                    element={
                      <ProtectedRoute userType='seller' requiredType='seller'>
                        <OrdersManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller/analytics" 
                    element={
                      <ProtectedRoute userType='seller' requiredType='seller'>
                        <BasicAnalyticsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller/advanced-analytics" 
                    element={
                      <ProtectedRoute userType='seller' requiredType='seller'>
                        <AdvancedAnalyticsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller/promotions" 
                    element={
                      <ProtectedRoute userType='seller' requiredType='seller'>
                        <PromotionalToolsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller/marketing-automation" 
                    element={
                      <ProtectedRoute userType='seller' requiredType='seller'>
                        <MarketingAutomationPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller/shipping" 
                    element={
                      <ProtectedRoute userType='seller' requiredType='seller'>
                        <ShippingManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller/customer-support" 
                    element={
                      <ProtectedRoute userType='seller' requiredType='seller'>
                        <CustomerSupportPage />
                      </ProtectedRoute>
                    } 
                  />
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
};

export default App;
