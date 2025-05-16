import React, { useEffect, useState } from 'react';
import useProductStore from '../stores/useProductStore';

import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

import useCartStore from '../stores/useCartStore';

import '../css/Dasboard.css';
const Dashboard = () => {
  const { products, fetchAllProducts, isLoading: isProductLoading } = useProductStore();
  const { addToCart, isLoading: isCartLoading } = useCartStore();
  const navigate = useNavigate();
  const { authUser, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      await logout(navigate);
    }
  };

  const handleGoToProductManagement = () => {
    if (authUser?.roles?.includes('ROLE_ADMIN')) {
      navigate('/product-management');
    } else {
      alert('Bạn không có quyền truy cập vào trang này!');
    }
  };

  const handleAddToCart = async (product) => {
    if (!authUser) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return;
    }
    try {
      console.log('User:', authUser); // Debug user info
      console.log('Token:', localStorage.getItem('authToken'));
      await addToCart(authUser.userName, product.id, product.productName, product.price, 1);
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (error) {
      alert('Lỗi khi thêm sản phẩm vào giỏ hàng!');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  if (isProductLoading || isCartLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <span className="logo-text">WORKAHOLIC SHOP</span>
          </div>
          <nav className="main-nav">
            <ul className="nav-list">
              <li className="nav-item active"><a href="#" className="nav-link">Trang chủ</a></li>
              <li className="nav-item"><a href="#" className="nav-link">Danh mục sản phẩm</a></li>
              <li className="nav-item">
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/cart');
                  }}
                >
                  Giỏ hàng
                </a>
              </li>
              <li className="nav-item"><a href="#" className="nav-link">About Us</a></li>
              <li>
                {authUser?.roles?.includes('ROLE_ADMIN') && (
                  <button
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                    onClick={handleGoToProductManagement}
                  >
                    ĐI ĐẾN TRANG QUẢN LÍ SẢN PHẨM
                  </button>
                )}
              </li>
            </ul>
          </nav>
          <div className="user-profile">
            <button className="profile-button" onClick={handleProfileClick}>
              <span className="profile-icon">👤</span>
            </button>
            {showMenu && (
              <div className="profile-menu" style={{
                position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #ccc', borderRadius: 4, zIndex: 10
              }}>
                <button style={{ display: 'block', width: '100%' }} onClick={() => { setShowMenu(false); navigate('/profileUser'); }}>
                  Xem thông tin cá nhân
                </button>
                <button style={{ display: 'block', width: '100%' }} onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container">
        <h1 className="title">DANH SÁCH SẢN PHẨM</h1>
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="product-image"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                />
              </div>
              <div className="product-details">
                <h2 className="product-name">{product.productName}</h2>
                <div className="product-info">
                  <p className="product-price">${product.price}</p>
                </div>
                <button
                  className="add-to-cart-button"
                  onClick={() => handleAddToCart(product)}
                >
                  <span className="cart-icon">🛒</span>
                  <span>Thêm vào giỏ hàng</span>
                </button>
                <button
                  className="add-to-info-button"
                  onClick={() => navigate(`/product-detail/${product.id}`)}
                >
                  <span>Chi tiết sản phẩm</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;