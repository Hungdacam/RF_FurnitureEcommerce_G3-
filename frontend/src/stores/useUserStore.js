import { create } from "zustand";

import { axiosInstance } from '../lib/axios';

const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: false,

  fetchUser: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/api/users/${userId}`);
      set({ currentUser: res.data });
    } catch (err) {
      console.error("Lỗi khi lấy thông tin người dùng:", err);
    } finally {
      set({ isLoading: false });
    }
  },
 
  updateUser: async (userId, userData) => {
  set({ isLoading: true });
  try {
    // Log thông tin request để debug
    console.log(`Gửi request PUT đến: /api/users/${userId}`);
    console.log('Dữ liệu gửi đi:', userData);
    
    const res = await axiosInstance.put(
      `/api/users/${userId}`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    // Log response để debug
    console.log('Response từ server:', res.data);
    
    set({ currentUser: res.data });
    return res.data; // Trả về data để component có thể kiểm tra
  } catch (err) {
    console.error("Lỗi chi tiết khi cập nhật thông tin người dùng:", err.response || err);
    // Ném lỗi để xử lý ở component
    throw err;
  } finally {
    set({ isLoading: false });
  }
}

}));

export default useUserStore;