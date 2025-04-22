import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProductStore from '../stores/useProductStore';
import '../css/DetailProduct.css';

const DetailProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products } = useProductStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchProduct = () => {
      const selectedProduct = products.find((p) => p.id === parseInt(productId));
      setProduct(selectedProduct);
      setLoading(false);
    };
    
    fetchProduct();
  }, [productId, products]);

  // Hàm xử lý khi thêm vào giỏ hàng
  const handleAddToCart = () => {
    // Ở đây bạn có thể thêm logic thêm vào giỏ hàng, ví dụ:
    // addToCart(product.id, quantity);
    
    // Hiển thị thông báo
    setShowNotification(true);
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Tăng số lượng
  const increaseQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  // Giảm số lượng
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return <div className="loading-container">Đang tải thông tin sản phẩm...</div>;
  }

  if (!product) {
    return <div className="loading-container">Không tìm thấy sản phẩm!</div>;
  }

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        ⬅ Quay lại
      </button>
      <h1 className="detail-title">{product.productName}</h1>
      <div className="detail-content">
        <img
          src={product.imageUrl}
          alt={product.productName}
          className="detail-image"
          onError={(e) => (e.target.src = 'https://via.placeholder.com/400x400?text=Sản+phẩm')}
        />
        <div className="detail-info">
          <p>
            <strong>Loại sản phẩm</strong>
            {product.category}
          </p>
          <p>
            <strong>Mô tả</strong>
            {product.discription}
          </p>
          <p>
            <strong>Giá bán</strong>
            <span className="price">${product.price.toLocaleString()}</span>
          </p>
          <p>
            <strong>Số lượng</strong>
            {product.quantity}
            <span className={`badge ${product.quantity > 0 ? 'stock-badge' : 'out-of-stock-badge'}`}>
              {product.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
            </span>
          </p>
          
          {/* Thêm chức năng giỏ hàng */}
          <div className="cart-actions">
            <div className="quantity-selector">
              <button 
                className="quantity-btn" 
                onClick={decreaseQuantity} 
                disabled={quantity <= 1}
              >
                -
              </button>
              <input 
                type="number" 
                className="quantity-input" 
                value={quantity} 
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1 && value <= product.quantity) {
                    setQuantity(value);
                  }
                }}
                min="1"
                max={product.quantity}
              />
              <button 
                className="quantity-btn" 
                onClick={increaseQuantity} 
                disabled={quantity >= product.quantity}
              >
                +
              </button>
            </div>
            <button 
              className="add-to-cart-btn" 
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
            >
              <span className="cart-icon">🛒</span>
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
      
      {/* Thông báo thêm vào giỏ hàng */}
      {showNotification && (
        <div className="cart-notification">
          ✅ Đã thêm {quantity} sản phẩm vào giỏ hàng!
        </div>
      )}
    </div>
  );
};

export default DetailProduct;