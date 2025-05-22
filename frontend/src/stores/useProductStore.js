import { create } from 'zustand';
import { axiosCatalog } from '../lib/axios';
import { toast } from 'react-hot-toast';

const useProductStore = create((set) => ({
  products: [],
  product: null,
  searchResults: [],
  isSearching: false,
  selectedCategory: null,
  isLoading: false,

  fetchAllProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosCatalog.get('/products');
      set({ products: res.data, searchResults: [], isSearching: false, selectedCategory: null });
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
      return res.data; // <-- Thêm dòng này để trả về dữ liệu sản phẩm
    } catch (error) {
      toast.error('Failed to fetch product details');
      console.error(error);
      return null; // <-- Trả về null khi lỗi
    } finally {
      set({ isLoading: false });
    }
  },


  fetchProductsByCategory: async (category) => {
    set({ isLoading: true });
    try {
      const res = await axiosCatalog.get(`/products?category=${category}`);
      set({ 
        searchResults: res.data, 
        isSearching: true, 
        selectedCategory: category 
      });
    } catch (error) {
      toast.error('Failed to fetch products by category');
      console.error(error);
      set({ searchResults: [], isSearching: true, selectedCategory: category });
    } finally {
      set({ isLoading: false });
    }
  },

  searchProducts: (keyword) => {
    set((state) => {
      if (!keyword.trim()) {
        return { searchResults: [], isSearching: false, selectedCategory: null };
      }
      const result = state.products.filter((p) =>
        p.productName.toLowerCase().includes(keyword.toLowerCase())
      );
      return { searchResults: result, isSearching: true, selectedCategory: null };
    });
  },

  filterByCategory: (category) => {
    set((state) => {
      const normalizedCategory = category.trim().toLowerCase();
      const result = state.products.filter((product) => {
        const cat = (product.category || '').trim().toLowerCase();
        if (normalizedCategory === 'khác') {
          return !['ghế', 'bàn', 'đồ decor', 'giường'].includes(cat);
        }
        return cat === normalizedCategory;
      });
      return {
        searchResults: result,
        isSearching: true,
        selectedCategory: category,
      };
    });
  },

  resetSearch: () => {
    set({ searchResults: [], isSearching: false, selectedCategory: null });
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

      const res = await axiosCatalog.post('/admin/products', formData);

      set((state) => ({
        products: [...state.products, res.data],
      }));

      toast.success('Sản phẩm đã được thêm thành công!');
    } catch (error) {
      console.error('Error adding product:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
      });
      if (error.response?.status === 405) {
        await useProductStore.getState().fetchAllProducts();
        toast.success('Sản phẩm đã được thêm thành công, nhưng có lỗi phản hồi từ server (sẽ được sửa)!');
      } else {
        toast.error(`Lỗi: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true });
    try {
      await axiosCatalog.delete(`/admin/products/${id}`);
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
        searchResults: state.searchResults.filter((product) => product.id !== id),
      }));
      toast.success('Sản phẩm đã được xóa thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xóa sản phẩm!');
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
        searchResults: state.searchResults.map((product) =>
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