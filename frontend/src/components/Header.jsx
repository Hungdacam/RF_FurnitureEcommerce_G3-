// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import '../css/Header.css';

const Header = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const dropdownRef = useRef(null);
  const categoryMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setShowCategoryMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  const handleCategoryClick = (e) => {
    e.stopPropagation();
    setShowCategoryMenu((prev) => !prev);
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

  const handleGoToCart = () => {
    navigate('/cart');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">Shop App</Link>
        </div>
        
        <nav className="navigation">
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link active">Trang chủ</Link>
            </li>
            <li className="nav-item" ref={categoryMenuRef}>
              <button className="nav-link dropdown-trigger" onClick={handleCategoryClick}>
                Danh mục sản phẩm
                <svg className="dropdown-icon" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"></path>
                </svg>
              </button>
              {showCategoryMenu && (
                <div className="dropdown-content">
                  <Link to="/category/electronics" className="dropdown-item">Điện tử</Link>
                  <Link to="/category/clothing" className="dropdown-item">Quần áo</Link>
                  <Link to="/category/books" className="dropdown-item">Sách</Link>
                  <Link to="/category/home" className="dropdown-item">Đồ gia dụng</Link>
                </div>
              )}
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link">Về chúng tôi</Link>
            </li>
          </ul>
        </nav>
        
        <div className="header-actions">
          {authUser ? (
            <>
              <button className="cart-button" onClick={handleGoToCart}>
                <svg className="cart-icon" viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"></path>
                </svg>
                <span className="cart-count">0</span>
              </button>
              
              <div className="user-profile" ref={dropdownRef}>
                <button className="user-button" onClick={handleProfileClick}>
                  <div className="user-avatar">
                    {authUser.userDetails?.firstName?.charAt(0) || authUser.userName?.charAt(0) || 'U'}
                  </div>
                </button>
                
                {showDropdown && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <p className="user-name">{authUser.userDetails?.firstName || authUser.userName}</p>
                      <p className="user-email">{authUser.email || ''}</p>
                    </div>
                    <div className="dropdown-actions">
                      <Link to="/profile" className="dropdown-link">
                        <svg className="dropdown-icon" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                        </svg>
                        Hồ sơ
                      </Link>
                      
                      {authUser.roles && authUser.roles.includes('ROLE_ADMIN') && (
                        <button className="dropdown-link" onClick={handleGoToProductManagement}>
                          <svg className="dropdown-icon" viewBox="0 0 24 24">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path>
                          </svg>
                          Quản lý sản phẩm
                        </button>
                      )}
                      
                      <button className="dropdown-link logout" onClick={handleLogout}>
                        <svg className="dropdown-icon" viewBox="0 0 24 24">
                          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path>
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Đăng nhập</Link>
              <Link to="/signup" className="btn btn-primary">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
