import { axiosCart } from "../lib/axios";
import { create } from 'zustand';
const useCartStore = create((set) => ({
    cart: null,
    isLoading: false,
    error: null,

    addToCart: async (userName, productId, productName, price, quantity) => {
        set({isLoading: true, error: null});
        try {
            const token = localStorage.getItem('authToken');
            console.log('Token là:', token);
            const response = await axiosCart.post('/add', null, {
                params: {userName, productId, productName, price, quantity},
                headers: {
    Authorization: `Bearer ${token}`
  }
            });
            set({ cart: response.data, isLoading: false });
            return response.data;
        } catch (error) {
             set({ error: error.message, isLoading: false });
              throw error;
        }
    }
}))

export default useCartStore;