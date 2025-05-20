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
const App = () => {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/product-management" element={<ProductManagement />} />
        <Route path="/product-detail/:productId" element={<DetailProduct />} />
       <Route path="/profileUser" element={<ProfileUser />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orderManagement" element={<OrderManagement />} />
      <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
};

export default App;