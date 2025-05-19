import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import DetailProduct from './pages/DetailProduct';
import ProfileUser from './pages/ProfileUser';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './stores/useAuthStore';

function App() {
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={<Dashboard />} 
            />
            <Route 
              path="/product/:productId" 
              element={<DetailProduct />} 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfileUser />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/product-management" 
              element={
                <ProtectedRoute requiredRole="ROLE_ADMIN">
                  <ProductManagement />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

export default App;
