import React, { useState, useEffect } from "react";
import useProductStore from "../stores/useProductStore";
import "../css/ProductManagement.css";

export default function ProductManagement() {
  const {
    products,
    fetchAllProducts,
    addProduct,
    deleteProduct,
    updateProduct,
    isLoading,
  } = useProductStore();
  const [showForm, setShowForm] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [productData, setProductData] = useState({
    product_name: "",
    category: "",
    description: "",
    price: "",
    quantity: "",
  });
  const [editProductData, setEditProductData] = useState({
    product_name: "",
    category: "",
    description: "",
    price: "",
    quantity: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  const validateForm = () => {
    const newErrors = {};
    if (!productData.product_name.trim())
      newErrors.product_name = "Tên sản phẩm không được để trống";
    if (!productData.category.trim())
      newErrors.category = "Danh mục không được để trống";
    if (!productData.description.trim())
      newErrors.description = "Mô tả không được để trống";
    if (!productData.price || productData.price <= 0)
      newErrors.price = "Giá phải lớn hơn 0";
    if (!productData.quantity || productData.quantity < 0)
      newErrors.quantity = "Số lượng không được âm";
    if (!imageFile) newErrors.image = "Hình ảnh không được để trống";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditProductData({ ...editProductData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng file
      const allowedFormats = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedFormats.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: 'Chỉ hỗ trợ định dạng JPEG, PNG hoặc GIF',
        }));
        return;
      }

      // Kiểm tra kích thước file
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          image: 'Kích thước ảnh không được vượt quá 5MB',
        }));
        return;
      }

      setImageFile(file);
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    await addProduct(productData, imageFile);
    setShowForm(false);
    setProductData({
      product_name: "",
      category: "",
      description: "",
      price: "",
      quantity: "",
    });
    setImageFile(null);
    setErrors({});
    fetchAllProducts();
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa sản phẩm này không?"
    );
    if (confirmDelete) {
      await deleteProduct(id);
      fetchAllProducts();
    }
  };

  const handleEdit = (product) => {
    setEditProductId(product.id);
    setEditProductData({
      product_name: product.productName,
      category: product.category,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      imageUrl: product.imageUrl,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateProduct(editProductId, editProductData, imageFile);
    setEditProductId(null);
    setEditProductData({
      product_name: "",
      category: "",
      description: "",
      price: "",
      quantity: "",
      imageUrl: "",
    });
    setImageFile(null);
    fetchAllProducts();
  };

  const handleCancelEdit = () => {
    setEditProductId(null);
    setEditProductData({
      product_name: "",
      category: "",
      description: "",
      price: "",
      quantity: "",
      imageUrl: "",
    });
    setImageFile(null);
  };

  return (
    <div className="product-management-container">
      <h1 className="title">Quản Lý Sản Phẩm</h1>
      <div className="button-group">
        <button
          className="add-product-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Đóng Form" : "Thêm Sản Phẩm Mới"}
        </button>
        <button
          className="view-products-button"
          onClick={() => setShowProductList(!showProductList)}
        >
          {showProductList ? "Ẩn Danh Sách" : "Danh Sách Sản Phẩm"}
        </button>
      </div>

      {showProductList && (
        <div className="product-list">
          {products.length === 0 ? (
            <p className="no-products">Không có sản phẩm nào.</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="product-item">
                {editProductId === product.id ? (
                  <form className="edit-product-form" onSubmit={handleUpdate}>
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
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit_image">Hình ảnh (tùy chọn):</label>
                      <input
                        type="file"
                        id="edit_image"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/jpeg,image/png,image/gif"
                      />
                      {errors.image && (
                        <span className="error-message">{errors.image}</span>
                      )}
                    </div>
                    <div className="edit-buttons">
                      <button type="submit" className="update-button">
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
                ) : (
                  <>
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      className="product-image"
                    />
                    <h3 className="product-name">{product.productName}</h3>
                    <p className="product-category">
                      Danh mục: {product.category}
                    </p>
                    <p className="product-description">{product.description}</p>
                    <p className="product-price">Giá: ${product.price}</p>
                    <p className="product-quantity">
                      Số lượng: {product.quantity}
                    </p>
                    <div className="product-actions">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(product)}
                      >
                        <span className="button-icon">✎</span> Cập Nhật
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(product.id)}
                      >
                        <span className="button-icon">🗑</span> Xóa
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="product_name">Tên sản phẩm:</label>
            <input
              type="text"
              id="product_name"
              name="product_name"
              value={productData.product_name}
              onChange={handleInputChange}
            />
            {errors.product_name && (
              <span className="error-message">{errors.product_name}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="category">Danh mục:</label>
            <input
              type="text"
              id="category"
              name="category"
              value={productData.category}
              onChange={handleInputChange}
            />
            {errors.category && (
              <span className="error-message">{errors.category}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="description">Mô tả:</label>
            <textarea
              id="description"
              name="description"
              value={productData.description}
              onChange={handleInputChange}
            ></textarea>
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="price">Giá:</label>
            <input
              type="number"
              id="price"
              name="price"
              value={productData.price}
              onChange={handleInputChange}
            />
            {errors.price && (
              <span className="error-message">{errors.price}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Số lượng:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={productData.quantity}
              onChange={handleInputChange}
            />
            {errors.quantity && (
              <span className="error-message">{errors.quantity}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="image">Hình ảnh:</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/gif"
            />
            {errors.image && (
              <span className="error-message">{errors.image}</span>
            )}
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Đang thêm..." : "Thêm Sản Phẩm"}
          </button>
        </form>
      )}
    </div>
  );
}