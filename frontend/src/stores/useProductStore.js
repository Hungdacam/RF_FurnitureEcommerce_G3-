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
}));

export default useProductStore;