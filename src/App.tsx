import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { initializeDemoData } from "@/utils/storage";

// Import pages
import Login from "./pages/Login";
import BuyerDashboard from "./pages/Buyer/BuyerDashboard";
import BuyerOrders from "./pages/Buyer/BuyerOrders";
import BuyerReviews from "./pages/Buyer/BuyerReviews";
import BuyerCart from "./pages/Buyer/BuyerCart";
import BuyerProfile from "./pages/Buyer/BuyerProfile";
import BuyerSettings from "./pages/Buyer/BuyerSettings";
import PaymentPage from "./pages/Buyer/PaymentPage";
import OrderWaiting from "./pages/Buyer/OrderWaiting";
import MenuDetail from "./pages/MenuDetail";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import SellerDashboard from "./pages/Seller/SellerDashboard";
import AllOrdersPage from "./pages/Seller/AllOrdersPage";
import SellerProfile from "./pages/Seller/SellerProfile";
import SellerSettings from "./pages/Seller/SellerSettings";
import AddMenu from "./pages/Seller/AddMenu";
import EditMenu from "./pages/Seller/EditMenu";
import NotFound from "./pages/NotFound";
import StoreDetail from "@/pages/StoreDetail";
import StoreList from "@/pages/StoreList";

// Initialize demo data
initializeDemoData();

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
};

// Public Route component (only for non-authenticated users)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      {/* Buyer Routes */}
      <Route
        path="/buyer"
        element={
          <ProtectedRoute allowedRoles={["buyer"]}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/orders"
        element={
          <ProtectedRoute allowedRoles={["buyer"]}>
            <BuyerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/reviews"
        element={
          <ProtectedRoute allowedRoles={["buyer"]}>
            <BuyerReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/cart"
        element={
          <ProtectedRoute allowedRoles={["buyer"]}>
            <BuyerCart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/profile"
        element={
          <ProtectedRoute allowedRoles={["buyer"]}>
            <BuyerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/settings"
        element={
          <ProtectedRoute allowedRoles={["buyer"]}>
            <BuyerSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/payment/:orderId/:storeId"
        element={
          <ProtectedRoute allowedRoles={["buyer"]}>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/waiting/:orderId"
        element={
          <ProtectedRoute allowedRoles={["buyer"]}>
            <OrderWaiting />
          </ProtectedRoute>
        }
      />
      <Route
        path="/menu/:id"
        element={
          <ProtectedRoute allowedRoles={["buyer"]}>
            <MenuDetail />
          </ProtectedRoute>
        }
      />
      {/* Seller Routes */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/profile"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/menu/new"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <AddMenu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/menu/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <EditMenu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/settings"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerSettings />
          </ProtectedRoute>
        }
      />
      <Route path="/seller/orders" element={<AllOrdersPage />} />
      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
      <Route path="/store/:sellerId" element={<StoreDetail />} />
      menu.storeName
      <Route path="/store-list" element={<StoreList />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
