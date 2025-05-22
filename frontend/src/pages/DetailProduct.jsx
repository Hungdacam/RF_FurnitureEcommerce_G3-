import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProductStore from '../stores/useProductStore';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import '../css/DetailProduct.css';

const DetailProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, fetchProductById, updateProduct, isLoading } = useProductStore();
  const { addToCart, cart, getCart } = useCartStore();
  const { authUser } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editProductData, setEditProductData] = useState({
    product_name: "",
    category: "",
    description: "",
    price: "",
    quantity: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [editImageFile, setEditImageFile] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const fetchedProduct = await fetchProductById(productId);
        setProduct(fetchedProduct); // Lấy trực tiếp dữ liệu trả về
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
  }, [productId, fetchProductById, authUser, getCart]);

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
    setEditProductData({
      product_name: product.productName,
      category: product.category,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
    });
    setShowEditForm(true);
    setEditErrors({});
    setEditImageFile(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditProductData({ ...editProductData, [name]: value });
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEditImageChange = (e) => {
    setEditImageFile(e.target.files[0]);
  };

  const validateEditForm = () => {
    const newErrors = {};
    if (!editProductData.product_name.trim())
      newErrors.product_name = "Tên sản phẩm không được để trống";
    if (!editProductData.category.trim())
      newErrors.category = "Danh mục không được để trống";
    if (!editProductData.description.trim())
      newErrors.description = "Mô tả không được để trống";
    if (!editProductData.price || Number(editProductData.price) <= 0)
      newErrors.price = "Giá phải lớn hơn 0";
    if (
      editProductData.quantity === "" ||
      isNaN(editProductData.quantity) ||
      !Number.isInteger(Number(editProductData.quantity)) ||
      Number(editProductData.quantity) < 0
    ) {
      newErrors.quantity = "Số lượng phải là số nguyên dương lớn hơn hoặc bằng 0";
    }
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;
    try {
      await updateProduct(product.id, editProductData, editImageFile);
      setShowEditForm(false);
      // Lấy lại dữ liệu sản phẩm mới nhất từ fetchProductById
      const updatedProduct = await fetchProductById(productId);
      setProduct(updatedProduct); // Cập nhật lại state product ngay lập tức
    } catch (error) {
      setEditErrors({ submit: "Lỗi khi cập nhật sản phẩm: " + error.message });
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditErrors({});
    setEditImageFile(null);
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
            {isAdmin && !showEditForm && (
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

          {/* FORM CHỈNH SỬA SẢN PHẨM */}
          {isAdmin && showEditForm && (
            <form className="edit-product-form" onSubmit={handleUpdateProduct} style={{ marginTop: 20 }}>
              <div className="form-group">
                <label htmlFor="edit_product_name">Tên sản phẩm:</label>
                <input
                  type="text"
                  id="edit_product_name"
                  name="product_name"
                  value={editProductData.product_name}
                  onChange={handleEditInputChange}
                  required
                />
                {editErrors.product_name && (
                  <span className="error-message">{editErrors.product_name}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="edit_category">Danh mục:</label>
                <input
                  type="text"
                  id="edit_category"
                  name="category"
                  value={editProductData.category}
                  onChange={handleEditInputChange}
                  required
                />
                {editErrors.category && (
                  <span className="error-message">{editErrors.category}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="edit_description">Mô tả:</label>
                <textarea
                  id="edit_description"
                  name="description"
                  value={editProductData.description}
                  onChange={handleEditInputChange}
                  required
                ></textarea>
                {editErrors.description && (
                  <span className="error-message">{editErrors.description}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="edit_price">Giá:</label>
                <input
                  type="number"
                  id="edit_price"
                  name="price"
                  value={editProductData.price}
                  onChange={handleEditInputChange}
                  required
                />
                {editErrors.price && (
                  <span className="error-message">{editErrors.price}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="edit_quantity">Số lượng:</label>
                <input
                  type="number"
                  id="edit_quantity"
                  name="quantity"
                  value={editProductData.quantity}
                  onChange={handleEditInputChange}
                  required
                />
                {editErrors.quantity && (
                  <span className="error-message">{editErrors.quantity}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="edit_image">Hình ảnh (tùy chọn):</label>
                <input
                  type="file"
                  id="edit_image"
                  name="image"
                  onChange={handleEditImageChange}
                />
              </div>
              {editErrors.submit && (
                <span className="error-message">{editErrors.submit}</span>
              )}
              <div className="edit-buttons">
                <button
                  type="submit"
                  className="update-button"
                  disabled={isLoading}
                >
                  <span className="button-icon">✔</span> Lưu Cập Nhật
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancelEdit}
                >
                  <span className="button-icon">✖</span> Hủy
                </button>
              </div>
            </form>
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