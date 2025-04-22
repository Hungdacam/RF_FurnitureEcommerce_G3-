import React, { useEffect } from 'react';
import useProductStore from '../stores/useProductStore';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import '../css/Dasboard.css'; // We'll update this CSS file separately

const Dashboard = () => {
  const { products, fetchAllProducts, isLoading } = useProductStore();
  const navigate = useNavigate();
  const { authUser } = useAuthStore(); // Lấy thông tin người dùng từ store
  const { productId } = useParams();
  console.log('Product ID:', productId);

  const handleGoToProductManagement = () => {
    if (authUser?.roles?.includes('ROLE_ADMIN')) {
      navigate('/product-management');
    } else {
      alert('Bạn không có quyền truy cập vào trang này!');
    }
  };
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
              <li>
              {authUser?.roles?.includes('ROLE_ADMIN') && ( // Chỉ hiển thị nút nếu có ROLE_ADMIN
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
                <div className="product-info">
                  <p className="product-price">${product.price}</p>
                </div>
                <button className="add-to-cart-button">
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