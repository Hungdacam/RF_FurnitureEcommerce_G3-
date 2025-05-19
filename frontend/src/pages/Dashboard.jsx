import React, { useEffect } from 'react';
import useProductStore from '../stores/useProductStore';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import '../css/Dasboard.css';

const Dashboard = () => {
  const { products, fetchAllProducts, isLoading } = useProductStore();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Đang tải...</p>
      </div>
    );
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    // Thêm logic thêm vào giỏ hàng ở đây
    console.log(`Đã thêm ${product.productName} vào giỏ hàng`);
    alert(`Đã thêm ${product.productName} vào giỏ hàng`);
  };

  return (
    <div className="page-container">
      <div className="container">
        <h1 className="title">Danh sách sản phẩm</h1>
        <div className="product-grid">
          {products.length === 0 ? (
            <p className="no-products">Không có sản phẩm nào.</p>
          ) : (
            products.map((product) => (
              <div 
                key={product.id} 
                className="product-card" 
                onClick={() => handleProductClick(product.id)}
              >
                <div className="product-image-container">
                  <img 
                    src={product.imageUrl} 
                    alt={product.productName} 
                    className="product-image" 
                  />
                </div>
                <div className="product-details">
                  <h3 className="product-name">{product.productName}</h3>
                  <p className="product-category">{product.category}</p>
                  <div className="product-info">
                    <p className="product-price">${product.price}</p>
                    <p className="product-quantity">Còn {product.quantity} sản phẩm</p>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="view-details-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product.id);
                      }}
                    >
                      Xem chi tiết
                    </button>
                    <button 
                      className="add-to-cart-button"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
