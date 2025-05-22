import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductManagement from "./pages/ProductManagement";
import DetailProduct from "./pages/DetailProduct";
import ProfileUser from "./pages/ProfileUser";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderManagement from "./pages/OrderManagement";
import Orders from "./pages/Orders";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./stores/useAuthStore";
import Statistics from "./pages/Statistics";
const App = () => {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/product-management"
              element={
                <ProtectedRoute requiredRole="ROLE_ADMIN">
                  <ProductManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/product-detail/:productId"
              element={<DetailProduct />}
            />
            <Route
              path="/profileUser"
              element={
                <ProtectedRoute>
                  <ProfileUser />
                </ProtectedRoute>
              }
            />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orderManagement" element={<OrderManagement />} />
            <Route path="/orders" element={<Orders />} />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute requiredRole="ROLE_ADMIN">
                  <Statistics />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Toaster position="top-center" />
      </div>
    </Router>
  );
};

export default App;
