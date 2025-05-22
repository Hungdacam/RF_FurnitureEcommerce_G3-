import { create } from 'zustand';
import {  axiosStats,axiosOrder } from '../lib/axios';
import { toast } from 'react-hot-toast';

const useStatisticsStore = create((set) => ({
  revenueStats: [],
  topSellingProducts: [],
  topRevenueProducts: [],
  topSpendingCustomers: [],
  topFrequentCustomers: [],
  paymentMethodStats: [],
  dashboardStats: {},
  isLoading: false,
  error: null,
  invoices: [],
  selectedInvoice: null,
  invoiceDetails: [],
  dailyRevenue: [],
  lastFetchedStartDate: null,
  lastFetchedEndDate: null,

  // Đồng bộ dữ liệu từ Order Service
  syncData: async () => {
    set({ isLoading: true, error: null });
    try {
      await axiosStats.post('/sync');
      toast.success('Đồng bộ dữ liệu thành công!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi đồng bộ dữ liệu';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  // Lấy thống kê doanh thu
  getRevenueStats: async (startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosStats.get('/revenue', {
        params: { startDate, endDate }
      });
      set({ 
        dailyRevenue: response.data,
        lastFetchedStartDate: startDate,
        lastFetchedEndDate: endDate,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi lấy thống kê doanh thu';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  // Lấy top sản phẩm bán chạy
getTopSellingProducts: async (limit = 10, startDate, endDate) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axiosStats.get('/products/top-selling', {
      params: { limit, startDate, endDate }
    });
    set({ topSellingProducts: response.data });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi khi lấy top sản phẩm bán chạy';
    set({ error: errorMessage });
    toast.error(errorMessage);
  } finally {
    set({ isLoading: false });
  }
},

// Lấy top sản phẩm có doanh thu cao
getTopRevenueProducts: async (limit = 10, startDate, endDate) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axiosStats.get('/products/top-revenue', {
      params: { limit, startDate, endDate }
    });
    set({ topRevenueProducts: response.data });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi khi lấy top sản phẩm có doanh thu cao';
    set({ error: errorMessage });
    toast.error(errorMessage);
  } finally {
    set({ isLoading: false });
  }
},

// Lấy top khách hàng chi tiêu nhiều
getTopSpendingCustomers: async (limit = 10, startDate, endDate) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axiosStats.get('/customers/top-spending', {
      params: { limit, startDate, endDate }
    });
    set({ topSpendingCustomers: response.data });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi khi lấy top khách hàng chi tiêu nhiều';
    set({ error: errorMessage });
    toast.error(errorMessage);
  } finally {
    set({ isLoading: false });
  }
},

// Lấy top khách hàng mua hàng thường xuyên
getTopFrequentCustomers: async (limit = 10, startDate, endDate) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axiosStats.get('/customers/top-frequent', {
      params: { limit, startDate, endDate }
    });
    set({ topFrequentCustomers: response.data });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi khi lấy top khách hàng mua hàng thường xuyên';
    set({ error: errorMessage });
    toast.error(errorMessage);
  } finally {
    set({ isLoading: false });
  }
},

// Lấy thống kê phương thức thanh toán
getPaymentMethodStats: async (startDate, endDate) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axiosStats.get('/payment-methods', {
      params: { startDate, endDate }
    });
    set({ paymentMethodStats: response.data });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi khi lấy thống kê phương thức thanh toán';
    set({ error: errorMessage });
    toast.error(errorMessage);
  } finally {
    set({ isLoading: false });
  }
},


  // Lấy tổng hợp thống kê cho dashboard
  // Cập nhật phương thức getDashboardStats để nhận tham số startDate và endDate
  getDashboardStats: async (startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      const response = await axiosStats.get('/dashboard', { params });
      set({ dashboardStats: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi lấy thống kê tổng hợp';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
 // Lấy danh sách hóa đơn (đơn hàng đã giao thành công)
  getInvoices: async (startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      // Gọi API lấy danh sách đơn hàng đã giao thành công
      const response = await axiosOrder.get('/delivered');
      
      let filteredInvoices = response.data;
      
      // Lọc theo khoảng thời gian nếu có
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Đặt giờ end về cuối ngày để bao gồm cả ngày kết thúc
        end.setHours(23, 59, 59, 999);
        
        filteredInvoices = filteredInvoices.filter(invoice => {
          const orderDate = new Date(invoice.orderDate);
          return orderDate >= start && orderDate <= end;
        });
      }
      
      set({ 
        invoices: filteredInvoices,
        lastFetchedStartDate: startDate,
        lastFetchedEndDate: endDate,
        isLoading: false 
      });
      
      return filteredInvoices;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi lấy danh sách hóa đơn';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return [];
    }
  },
  
  // Lấy chi tiết hóa đơn theo ID
  getInvoiceDetails: async (invoiceId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosOrder.get(`/${invoiceId}`);
      set({ selectedInvoice: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi lấy chi tiết hóa đơn';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },
  
  // Reset cache để buộc gọi lại API
  resetInvoiceCache: () => {
    set({ 
      lastFetchedStartDate: null,
      lastFetchedEndDate: null
    });
  }

}));

export default useStatisticsStore;