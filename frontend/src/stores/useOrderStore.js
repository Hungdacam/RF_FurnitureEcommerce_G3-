import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { axiosOrder } from '../lib/axios';
import useCartStore from './useCartStore';

const useOrderStore = create((set) => ({
  isCreatingOrder: false,
  isLoadingOrders: false,
  orders: [],
  createOrder: async (orderData, navigate) => {
    set({ isCreatingOrder: true });
    try {
      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      const response = await axiosOrder.post('/create', orderData);
      console.log('Order created successfully:', response.data);
      toast.success('Đặt hàng thành công! Vui lòng theo dõi trạng thái đơn hàng.');
      navigate('/orders');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Lỗi khi đặt hàng';
      const status = error.response?.status;
      console.error('Create order error:', {
        message: errorMessage,
        status,
        data: error.response?.data,
        config: error.config
      });
      let displayMessage = errorMessage;
      if (status === 403) {
        displayMessage = 'Không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại hoặc liên hệ hỗ trợ.';
        toast.error(displayMessage, {
          duration: 5000,
          action: {
            text: 'Đăng nhập lại',
            onClick: () => navigate('/login')
          }
        });
      } else if (status === 400) {
        displayMessage = errorMessage;
        toast.error(displayMessage, {
          duration: 5000,
          action: {
            text: 'Quay lại giỏ hàng',
            onClick: () => navigate('/cart')
          }
        });
      } else if (status === 503) {
        displayMessage = 'Dịch vụ không khả dụng. Vui lòng thử lại sau.';
        toast.error(displayMessage);
      } else {
        toast.error(displayMessage);
      }
      throw new Error(errorMessage);
    } finally {
      set({ isCreatingOrder: false });
    }
  },
  getAllOrders: async () => {
    set({ isLoadingOrders: true });
    try {
      console.log('Fetching all orders');
      const response = await axiosOrder.get('/all');
      console.log('All orders fetched successfully:', response.data);
      set({ orders: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data || 'Lỗi khi tải tất cả đơn hàng';
      console.error('Fetch all orders error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Lỗi khi tải tất cả đơn hàng');
      throw new Error(errorMessage);
    } finally {
      set({ isLoadingOrders: false });
    }
  },
  // Lấy đơn hàng đã giao thành công
  getDeliveredOrders: async () => {
    set({ isLoadingOrders: true });
    try {
      console.log('Fetching delivered orders');
      const response = await axiosOrder.get('/delivered');
      console.log('Delivered orders fetched successfully:', response.data);
      
      // Chỉ cập nhật orders với delivered orders hoặc tạo state riêng
      set({ orders: response.data }); // hoặc deliveredOrders: response.data
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Lỗi khi tải đơn hàng đã giao';
      console.error('Fetch delivered orders error:', errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isLoadingOrders: false });
    }
  },

  getOrdersByUser: async (userName) => {
    set({ isLoadingOrders: true });
    try {
      console.log('Fetching orders for user:', userName);
      const response = await axiosOrder.get('/user', {
        params: { userName }
      });
      console.log('Orders fetched successfully:', response.data);
      set({ orders: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data || 'Lỗi khi tải đơn hàng';
      console.error('Fetch orders error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Lỗi khi tải đơn hàng');
      throw new Error(errorMessage);
    } finally {
      set({ isLoadingOrders: false });
    }
  },
  updateOrderStatus: async (orderId, status) => {
    try {
      console.log(`Updating status for order ${orderId} to ${status}`);
      const response = await axiosOrder.put(`/update-status/${orderId}`, { status });
      console.log('Order status updated successfully:', response.data);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      }));
      toast.success('Cập nhật trạng thái thành công!');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data || 'Lỗi khi cập nhật trạng thái';
      console.error('Update order status error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Lỗi khi cập nhật trạng thái');
      throw new Error(errorMessage);
    }
  },
  cancelOrder: async (orderId) => {
    try {
      console.log(`Cancelling order ${orderId}`);
      const response = await axiosOrder.put(`/cancel/${orderId}`);
      console.log('Order cancelled successfully:', response.data);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status: 'CANCELLED' } : order
        )
      }));
      const userName = response.data.userName;
      if (userName) {
        await useCartStore.getState().getCart(userName);
      }
      toast.success('Hủy đơn hàng thành công!');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data || 'Lỗi khi hủy đơn hàng';
      console.error('Cancel order error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Lỗi khi hủy đơn hàng');
      throw new Error(errorMessage);
    }
  },
  updateOrder: async (orderId, contactData) => {
    try {
      console.log(`Updating contact info for order ${orderId}:`, contactData);
      const response = await axiosOrder.put(`/update-contact/${orderId}`, contactData);
      console.log('Order contact info updated successfully:', response.data);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, ...contactData } : order
        )
      }));
      toast.success('Cập nhật thông tin liên hệ thành công!');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data || 'Lỗi khi cập nhật thông tin liên hệ';
      console.error('Update order contact info error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Lỗi khi cập nhật thông tin liên hệ');
      throw new Error(errorMessage);
    }
  },
}));
export default useOrderStore;