import { create } from 'zustand';
import { axiosCatalog } from '../lib/axios';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const useProductStore = create((set) => ({
  products: [],
  product: null,
  isLoading: false,

  fetchAllProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosCatalog.get('/products');
      set({ products: res.data });
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true });
    try {
      const res = await axiosCatalog.get(`products/${id}`);
      set({ product: res.data });
    } catch (error) {
      toast.error('Không thể tải chi tiết sản phẩm');
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProductsByCategory: async (category) => {
    set({ isLoading: true });
    try {
      const res = await axiosCatalog.get(`/products?category=${category}`);
      set({ products: res.data });
    } catch (error) {
      toast.error('Không thể tải sản phẩm theo danh mục');
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (productData, imageFile) => {
    set({ isLoading: true });
    try {
      if (!imageFile) {
        toast.error('Vui lòng chọn hình ảnh!');
        return;
      }

      // Kiểm tra định dạng file
      const allowedFormats = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedFormats.includes(imageFile.type)) {
        toast.error('Chỉ hỗ trợ định dạng JPEG, PNG hoặc GIF!');
        return;
      }

      // Kiểm tra kích thước file (tối đa 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (imageFile.size > maxSize) {
        toast.error('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }

      // Tải ảnh lên Cloudinary
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'KTPM_G3'); // Thay bằng preset của bạn

      const cloudinaryResponse = await axios.post(
        'https://api.cloudinary.com/v1_1/dbjqhaayj/image/upload', // Thay bằng cloud name của bạn
        formData
      );

      const imageUrl = cloudinaryResponse.data.secure_url;

      // Chuẩn bị dữ liệu sản phẩm với imageUrl
      const productPayload = {
          productName: productData.product_name, // Đổi thành productName để khớp với Product.java
          category: productData.category,
          description: productData.description,
          price: parseFloat(productData.price), // Đảm bảo price là số
          quantity: parseInt(productData.quantity, 10), // Đảm bảo quantity là số nguyên
          imageUrl: imageUrl,
      };

      console.log('Payload gửi đi:', productPayload); // Thêm log để debug

      const res = await axiosCatalog.post('/admin/products', productPayload);

      set((state) => ({
        products: [...state.products, res.data],
      }));

      toast.success('Sản phẩm đã được thêm thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
      });
      if (error.response?.status === 405) {
        await useProductStore.getState().fetchAllProducts();
        toast.success('Sản phẩm đã được thêm, nhưng có lỗi phản hồi từ server!');
      } else {
        toast.error(`Lỗi: ${error.response?.data || error.message}`);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true });
    try {
      await axiosCatalog.delete(`/admin/products/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProduct: async (id, productData, imageFile) => {
    set({ isLoading: true });
    try {
      let imageUrl = productData.imageUrl; // Giữ URL ảnh cũ nếu không có ảnh mới

      if (imageFile) {
        // Kiểm tra định dạng file
        const allowedFormats = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedFormats.includes(imageFile.type)) {
          toast.error('Chỉ hỗ trợ định dạng JPEG, PNG hoặc GIF!');
          return;
        }

        // Kiểm tra kích thước file (tối đa 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (imageFile.size > maxSize) {
          toast.error('Kích thước ảnh không được vượt quá 5MB!');
          return;
        }

        // Tải ảnh mới lên Cloudinary
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', 'KTPM_G3'); // Thay bằng preset của bạn

        const cloudinaryResponse = await axios.post(
          'https://api.cloudinary.com/v1_1/dbjqhaayj/image/upload', // Thay bằng cloud name của bạn
          formData
        );

        imageUrl = cloudinaryResponse.data.secure_url;
      }

      // Chuẩn bị dữ liệu sản phẩm với imageUrl
      const productPayload = {
          productName: productData.product_name, // Đổi thành productName để khớp với Product.java
          category: productData.category,
          description: productData.description,
          price: parseFloat(productData.price), // Đảm bảo price là số
          quantity: parseInt(productData.quantity, 10), // Đảm bảo quantity là số nguyên
          imageUrl: imageUrl,
      };

      console.log('Payload gửi đi:', productPayload); // Thêm log để debug

      const res = await axiosCatalog.put(`/admin/products/${id}`, productPayload);

      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? res.data : product
        ),
      }));

      toast.success('Sản phẩm đã được cập nhật thành công!');
    } catch (error) {
      if (error.response) {
        toast.error(`Lỗi từ server: ${error.response.data || 'Không thể cập nhật sản phẩm. Vui lòng thử lại!'}`);
      } else if (error.request) {
        toast.error('Không thể kết nối tới server. Vui lòng kiểm tra backend hoặc CORS.');
      } else {
        toast.error(`Lỗi: ${error.message}`);
      }
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useProductStore;