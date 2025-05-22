import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import useProductStore from '../stores/useProductStore';

import '../css/Header.css';

const Header = () => {
  const { authUser, logout } = useAuthStore();
  const { searchProducts } = useProductStore();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleSearch = (keyword) => {
    setSearchQuery(keyword);
    searchProducts(keyword);
    navigate('/dashboard');
  };
  const handleStatistics = () => {
    if (authUser?.roles?.includes('ROLE_ADMIN')) {
      navigate('/statistics');
    } else {
      alert('Bạn không có quyền truy cập vào trang này!');
    }
  };
  const handleLogout = async () => {
    await logout(navigate);
  };

  const handleGoToProductManagement = () => {
    if (authUser?.roles?.includes('ROLE_ADMIN')) {
      navigate('/product-management');
    } else {
      alert('Bạn không có quyền truy cập vào trang này!');
    }
  };

  const handleViewProfile = () => {
    navigate('/profileUser');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleOrderManagement = () => {
    navigate('/orderManagement');
  };


  const handleGoToCart = () => {
    navigate('/cart');
  };

  const handleUserManagement = () => {
    navigate('/user-management');
  };
  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-text">APHRODITE</span>
        </div>
        <nav className="main-nav">
          <ul className="nav-list">
            <li className="nav-item active">
              <Link to="/dashboard" className="nav-link">Trang chủ</Link>
            </li>
            
            <li className="nav-item">
              <span className="nav-link" style={{ cursor: 'pointer' }} onClick={handleGoToCart}>Giỏ hàng</span>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link">About Us</Link>
            </li>
          </ul>
        </nav>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
          />
          <button className="search-button" onClick={() => handleSearch(searchQuery)}>
            🔍
          </button>
        </div>
        <div className="user-profile" ref={menuRef}>
          {authUser ? (
            <>
              <button className="profile-button" onClick={() => setMenuOpen(!menuOpen)}>
                <span className="profile-icon">👤</span>
              </button>
              {menuOpen && (
                <div className="profile-menu">
                  <p className="username">👋 Xin chào, <strong>{authUser?.userName}</strong></p>
                  <div style={{ padding: '15px 0' }}>
                    <button
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginBottom: '10px',
                        width: '100%',
                      }}
                      onClick={handleViewProfile}
                    >
                      Xem thông tin cá nhân
                    </button>
                    {!authUser?.roles?.includes('ROLE_ADMIN') && (
                      <button
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#17a2b8',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          marginBottom: '10px',
                          width: '100%',
                        }}
                        onClick={handleViewOrders}
                      >
                        Theo dõi đơn hàng
                      </button>
                    )}
                    {authUser?.roles?.includes('ROLE_ADMIN') && (
                      <>
                        <button
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginBottom: '10px',
                            width: '100%',
                          }}
                          onClick={handleGoToProductManagement}
                        >
                          Vào trang quản lý sản phẩm
                        </button>
                        <button
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#ffc107',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginBottom: '10px',
                            width: '100%',
                          }}
                          onClick={handleOrderManagement}
                        >
                          Quản lý đơn hàng
                        </button>
                          <button className="dropdown-link" onClick={handleStatistics}>
                            <svg className="dropdown-icon" viewBox="0 0 24 24">
                              <path d="M3 17h2v-7H3v7zm4 0h2V7H7v10zm4 0h2v-4h-2v4zm4 0h2V4h-2v13zm4 0h2v-9h-2v9z" />
                            </svg>
                            Thống kê
                          </button>
                            <button className="dropdown-link" onClick={handleUserManagement}>
                            <svg className="dropdown-icon" viewBox="0 0 24 24">
                              <path d="M3 17h2v-7H3v7zm4 0h2V7H7v10zm4 0h2v-4h-2v4zm4 0h2V4h-2v13zm4 0h2v-9h-2v9z" />
                            </svg>
                            Quản lí người dùng
                          </button>
                          
                      </>
                    )}
                  </div>
                  <button className="logout-button" onClick={handleLogout}>Đăng xuất</button>
                </div>
              )}
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Đăng nhập</Link>
              <Link to="/signup" className="sign-up-btn">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;