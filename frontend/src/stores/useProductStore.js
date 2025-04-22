import { create } from 'zustand';
import { axiosCatalog } from '../lib/axios';
import { toast } from 'react-hot-toast';

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
      toast.error('Failed to fetch products');
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
      toast.error('Failed to fetch product details');
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
      toast.error('Failed to fetch products by category');
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
  
      const formData = new FormData();
      formData.append('product_name', productData.product_name);
      formData.append('category', productData.category);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('quantity', productData.quantity);
      formData.append('image', imageFile);
  
      const res = await axiosCatalog.post('/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      set((state) => ({
        products: [...state.products, res.data],
      }));
  
      toast.success('Sản phẩm đã được thêm thành công!');
    } catch (error) {
      if (error.response) {
        toast.error(`Lỗi từ server: ${error.response.data.message || 'Không thể thêm sản phẩm'}`);
      } else if (error.request) {
        toast.error('Không thể kết nối tới server. Kiểm tra backend hoặc CORS.');
      } else {
        toast.error(`Lỗi: ${error.message}`);
      }
      console.error('Error adding product:', error);
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
      const formData = new FormData();
      formData.append('product_name', productData.product_name);
      formData.append('category', productData.category);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('quantity', productData.quantity);
  
      if (imageFile) {
        formData.append('image', imageFile);
      }
  
      const res = await axiosCatalog.put(`/admin/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? res.data : product
        ),
      }));
  
      toast.success('Sản phẩm đã được cập nhật thành công!');
    } catch (error) {
      if (error.response) {
        toast.error(`Lỗi từ server: ${error.response.data.message || 'Không thể cập nhật sản phẩm. Vui lòng thử lại!'}`);
      } else if (error.request) {
        toast.error('Không thể kết nối tới server. Vui lòng kiểm tra backend hoặc CORS.');
      } else {
        toast.error(`Lỗi: ${error.message}`);
      }
      console.error('Error updating product:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

}));

export default useProductStore;