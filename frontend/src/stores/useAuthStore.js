import { create } from 'zustand';
import {axiosInstance} from '../lib/axios';
import { toast } from 'react-hot-toast';

const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  isLoggingOut: false,
  role:null,
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        set({ authUser: null });
        return;
      }
      const res = await axiosInstance.get('/users/me');
      set({ authUser: res.data });
    } catch (error) {
      console.log('Lỗi kiểm tra auth:', error.message);
      set({ authUser: null });
      localStorage.removeItem('authToken');
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data, navigate) => {
  set({ isSigningUp: true });
  try {
    const res = await axiosInstance.post('/api/registration', {
      userName: data.userName,
      userPassword: data.userPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber
    });
    
    if (res.data.token) {
      localStorage.setItem('authToken', res.data.token);
      set({ authUser: { userName: res.data.userName, userId: res.data.userId } });
      toast.success('Đăng ký thành công!');
      navigate('/dashboard');
    } else {
      throw new Error('Không nhận được token từ server');
    }
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
    toast.error(errorMessage);
  } finally {
    set({ isSigningUp: false });
  }
},
  

  login: async (data, navigate) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/api/login', {
        userName: data.userName,
        userPassword: data.userPassword,
      });
      if (res.data.token) {
        localStorage.setItem('authToken', res.data.token);
        const userRes = await axiosInstance.get(`/api/users/by-username?username=${res.data.userName}`);
        set({
          authUser: {
            ...userRes.data,
            roles: [userRes.data.role?.roleName], // Đảm bảo luôn có mảng roles
          },
          role: res.data.roles, // nếu muốn giữ
        });
        toast.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        throw new Error('Không nhận được token từ server');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async (navigate) => {
    set({ isLoggingOut: true });
    try {
      await axiosInstance.post('/api/logout'); // Gửi yêu cầu POST
      localStorage.removeItem('authToken');
      set({ authUser: null });
      toast.success('Đăng xuất thành công');
      if (navigate) navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi đăng xuất';
      toast.error(errorMessage);
    } finally {
      set({ isLoggingOut: false });
    }
  },

  findOneUser: async (userName) => {
    try {
      const res = await axiosInstance.get(`/users?name=${userName}`);
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không tìm thấy người dùng';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },
}));

export default useAuthStore;