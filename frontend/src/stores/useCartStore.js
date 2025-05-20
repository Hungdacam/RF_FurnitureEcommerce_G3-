import { axiosCart, axiosCatalog } from "../lib/axios"; // Thêm axiosCatalog
import { create } from 'zustand';

const useCartStore = create((set) => ({
    cart: null,
    isLoading: false,
    error: null,
    getLocalCart: () => {
        const localCart = localStorage.getItem('tempCart');
        return localCart ? JSON.parse(localCart) : [];
    },
    saveLocalCart: (items) => {
        localStorage.setItem('tempCart', JSON.stringify(items));
    },

    addToCart: async (userName, productId, productName, price, quantity, isAuthenticated = false) => {
        set({ isLoading: true, error: null });
        if (!isAuthenticated) {
            const localCart = useCartStore.getState().getLocalCart();
            const existingItem = localCart.find((item) => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                localCart.push({ productId, productName, price, quantity });
            }
            useCartStore.getState().saveLocalCart(localCart);
            set({ isLoading: false });
            return localCart;
        }
        try {
            // Kiểm tra tồn kho trước khi thêm
            const productResponse = await axiosCatalog.get(`/products/${productId}`);
            const stockQuantity = productResponse.data.quantity;
            if (quantity > stockQuantity) {
                throw new Error(`Số lượng yêu cầu (${quantity}) vượt quá tồn kho (${stockQuantity})!`);
            }

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

    syncLocalCart: async (userName) => {
        const localCart = useCartStore.getState().getLocalCart();
        if (!localCart || localCart.length === 0) return;
        set({ isLoading: true, error: null });
        try {
            const token = localStorage.getItem('authToken');
            for (const item of localCart) {
                // Kiểm tra tồn kho
                const productResponse = await axiosCatalog.get(`/products/${item.productId}`);
                const stockQuantity = productResponse.data.quantity;
                if (item.quantity > stockQuantity) {
                    throw new Error(
                        `Số lượng sản phẩm ${item.productName} (${item.quantity}) vượt quá tồn kho (${stockQuantity})!`
                    );
                }

                await axiosCart.post('/add', null, {
                    params: {
                        userName,
                        productId: item.productId,
                        productName: item.productName,
                        price: item.price,
                        quantity: item.quantity
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            const response = await axiosCart.get('/get', {
                params: { userName },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            set({ cart: response.data, isLoading: false });
            // Xóa giỏ hàng tạm
            localStorage.removeItem('tempCart');
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
            // Kiểm tra tồn kho trước khi cập nhật
            const productResponse = await axiosCatalog.get(`/products/${productId}`);
            const stockQuantity = productResponse.data.quantity;
            if (quantity > stockQuantity) {
                throw new Error(`Số lượng yêu cầu (${quantity}) vượt quá tồn kho (${stockQuantity})!`);
            }

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