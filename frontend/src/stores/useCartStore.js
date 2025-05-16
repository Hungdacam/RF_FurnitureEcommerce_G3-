import { axiosCart } from "../lib/axios";
import { create } from 'zustand';

const useCartStore = create((set) => ({
    cart: null,
    isLoading: false,
    error: null,

    addToCart: async (userName, productId, productName, price, quantity) => {
        set({ isLoading: true, error: null });
        try {
            const token = localStorage.getItem('authToken');
            console.log('Token là:', token);
            const response = await axiosCart.post('/add', null, {
                params: { userName, productId, productName, price, quantity },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            set({ cart: response.data, isLoading: false });
            console.log('Giỏ hàng là:', response.data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data || error.message;
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    getCart: async (userName) => {
        set({ isLoading: true, error: null });
        try {
            const token = localStorage.getItem('authToken');
            const response = await axiosCart.get('/get', {
                params: { userName },
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            set({ cart: response.data, isLoading: false });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data || error.message;
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    updateCartItemQuantity: async (userName, productId, quantity) => {
        set({ isLoading: true, error: null });
        try {
            const token = localStorage.getItem('authToken');
            const response = await axiosCart.put('/update-quantity', null, {
                params: { userName, productId, quantity },
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            set({ cart: response.data, isLoading: false });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data || error.message;
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    }
}));

export default useCartStore;