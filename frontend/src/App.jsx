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
      </Routes>
    </Router>
  );
};

export default App;