import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { axiosOrder, axiosCart } from '../lib/axios';

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
      try {
        for (const item of orderData.items) {
          console.log('Clearing cart item:', { userName: orderData.userName, productId: item.productId });
          await axiosCart.put('/update-quantity', null, {
            params: {
              userName: orderData.userName,
              productId: item.productId,
              quantity: 0
            }
          });
        }
      } catch (cartError) {
        console.error('Failed to clear cart:', cartError);
        toast.error('Đặt hàng thành công nhưng không thể xóa giỏ hàng!');
      }
      toast.success('Đặt hàng thành công! Vui lòng theo dõi trạng thái đơn hàng.');
      navigate('/orders');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data || error.message || 'Lỗi khi đặt hàng';
      console.error('Create order error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Lỗi khi đặt hàng');
      throw new Error('Lỗi khi đặt hàng');
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
      const errorMessage = error.response?.data || 'Lỗi khi tải tất cả đơn hàng';
      console.error('Fetch all orders error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Lỗi khi tải tất cả đơn hàng');
      throw new Error('Lỗi khi tải tất cả đơn hàng');
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
      const errorMessage = error.response?.data || 'Lỗi khi tải đơn hàng';
      console.error('Fetch orders error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Lỗi khi tải đơn hàng');
      throw new Error('Lỗi khi tải đơn hàng');
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
      const errorMessage = error.response?.data || 'Lỗi khi cập nhật trạng thái';
      console.error('Update order status error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Lỗi khi cập nhật trạng thái');
      throw new Error('Lỗi khi cập nhật trạng thái');
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
      toast.success('Hủy đơn hàng thành công!');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data || 'Lỗi khi hủy đơn hàng';
      console.error('Cancel order error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Lỗi khi hủy đơn hàng');
      throw new Error('Lỗi khi hủy đơn hàng');
    }
  },
}));
export default useOrderStore;