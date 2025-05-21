import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import DetailProduct from './pages/DetailProduct';
import ProfileUser from './pages/ProfileUser';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderManagement from './pages/OrderManagement';
import Orders from './pages/Orders';
import UserManagement from './pages/UserManagement';
import UserDetail from './pages/UserDetail';
const App = () => {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Login />} />
        <Route path="/product-management" element={<ProductManagement />} />
        <Route path="/product-detail/:productId" element={<DetailProduct />} />
        <Route path="/profileUser" element={<ProfileUser />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orderManagement" element={<OrderManagement />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/user-detail/:userId" element={<UserDetail />} />
      </Routes>
    </Router>
  );
};

export default App;