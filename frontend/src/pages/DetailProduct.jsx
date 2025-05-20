import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProductStore from '../stores/useProductStore';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import '../css/DetailProduct.css';

const DetailProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, fetchProductById } = useProductStore();
  const { addToCart, cart, getCart } = useCartStore();
  const { authUser } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        await fetchProductById(productId);
        const selectedProduct = products.find((p) => p.id === parseInt(productId));
        setProduct(selectedProduct);
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCart = async () => {
      if (authUser) {
        try {
          await getCart(authUser.userName);
        } catch (error) {
          console.error('Lỗi khi lấy giỏ hàng:', error);
        }
      }
    };

    fetchProduct();
    fetchCart();
  }, [productId, products, fetchProductById, authUser, getCart]);

  const handleAddToCart = async () => {
    if (!authUser) {
      try {
        await addToCart(null, product.id, product.productName, product.price, quantity, false);
        alert('Sản phẩm đã được thêm vào giỏ hàng tạm. Vui lòng đăng nhập để lưu vào giỏ hàng chính thức!');
        navigate('/login');
      } catch (error) {
        alert('Lỗi khi thêm sản phẩm vào giỏ hàng tạm: ' + error.message);
        console.error(error);
      }
      return;
    }

    // Tính số lượng sản phẩm đã có trong giỏ hàng
    const existingItem = cart?.items?.find((item) => item.productId === parseInt(productId));
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    const totalRequestedQuantity = currentQuantityInCart + quantity;

    // Kiểm tra tổng số lượng so với tồn kho
    if (totalRequestedQuantity > product.quantity) {
      setErrorMessage(
        ` Số lượng tồn kho chỉ có (${product.quantity}). Bạn đã có (${currentQuantityInCart}) trong giỏ hàng. Chỉ được thêm (${product.quantity - currentQuantityInCart}) sản phẩm nữa!`
      );
      return;
    }

    try {
      await addToCart(authUser.userName, product.id, product.productName, product.price, quantity, true);
      setShowNotification(true);
      setErrorMessage('');
      setQuantity(1); // Reset số lượng sau khi thêm thành công
      // Làm mới dữ liệu sản phẩm
      await fetchProductById(productId);
      const updatedProduct = products.find((p) => p.id === parseInt(productId));
      setProduct(updatedProduct);
      // Làm mới giỏ hàng
      await getCart(authUser.userName);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      setErrorMessage('Lỗi khi thêm sản phẩm vào giỏ hàng: ' + error.message);
      console.error(error);
    }
  };

  const handleEditProduct = () => {
    navigate('/product-management');
  };

  const increaseQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
      setErrorMessage('');
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      setErrorMessage('');
    }
  };

  const isAdmin = authUser?.roles?.includes('ROLE_ADMIN');

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
            {product.description}
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

          <div className="cart-actions">
            {!isAdmin && (
              <>
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
                        setErrorMessage('');
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
              </>
            )}
            {isAdmin && (
              <button
                className="edit-product-btn"
                onClick={handleEditProduct}
              >
                <span className="edit-icon">✎</span>
                Sửa sản phẩm
              </button>
            )}
          </div>
          {errorMessage && (
            <p className="error-message">{errorMessage}</p>
          )}
        </div>
      </div>

      {showNotification && (
        <div className="cart-notification">
          ✅ Đã thêm {quantity} sản phẩm vào giỏ hàng!
        </div>
      )}
    </div>
  );
};

export default DetailProduct;