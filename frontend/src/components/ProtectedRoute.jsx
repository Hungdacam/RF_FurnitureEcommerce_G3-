// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { authUser, isCheckingAuth } = useAuthStore();
  
  if (isCheckingAuth) {
    return <div className="loading">Đang tải...</div>;
  }
  
  if (!authUser) {
    toast.error('Vui lòng đăng nhập để tiếp tục');
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && (!authUser.roles || !authUser.roles.includes(requiredRole))) {
    toast.error('Bạn không có quyền truy cập trang này');
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;