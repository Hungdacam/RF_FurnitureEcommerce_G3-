import React, { useEffect } from 'react';
import useProductStore from '../stores/useProductStore';
import '../css/Dasboard.css'; // We'll update this CSS file separately

const Dashboard = () => {
  const { products, fetchAllProducts, isLoading } = useProductStore();

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  if (isLoading) {
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
              <li className="nav-item"><a href="#" className="nav-link">Giỏ hàng</a></li>
              <li className="nav-item"><a href="#" className="nav-link">About Us</a></li>
            </ul>
          </nav>
          <div className="user-profile">
            <button className="profile-button">
              <span className="profile-icon">👤</span>
            </button>
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
                <p className="product-category">Loại: {product.category}</p>
                <p className="product-description">Mô tả: {product.discription}</p>
                <div className="product-info">
                  <p className="product-price">${product.price}</p>
                  <p className="product-quantity">Số lượng: {product.quantity}</p>
                </div>
                <button className="add-to-cart-button">
                  <span className="cart-icon">🛒</span>
                  <span>Thêm vào giỏ hàng</span>
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