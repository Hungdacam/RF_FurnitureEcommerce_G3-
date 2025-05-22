import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import useCartStore from "./useCartStore";

const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  isLoggingOut: false,
  isVerifyingOtp: false,
  isResendingOtp: false,
  role: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const token = localStorage.getItem("authToken");
      console.log("checkAuth: Token:", token);
      if (!token) {
        set({ authUser: null, role: null });
        return;
      }
      const res = await axiosInstance.get("/users/me");
      console.log("checkAuth: Response /users/me:", res.data);
      set({
        authUser: {
          ...res.data,
          roles: res.data.roleName ? [res.data.roleName] : [],
        },
        role: res.data.roleName ? [res.data.roleName] : null,
      });
    } catch (error) {
      console.error("checkAuth: Lỗi kiểm tra auth:", error.message);
      set({ authUser: null, role: null });
      localStorage.removeItem("authToken");
    } finally {
      set({ isCheckingAuth: false });
      console.log("checkAuth: Kết thúc kiểm tra auth");
    }
  },

  signup: async (data, navigate, setBackendError) => {
    set({ isSigningUp: true });
    try {
      console.log("signup: Gửi dữ liệu đăng ký:", data);
      const res = await axiosInstance.post("/api/registration", { ...data });
      console.log("signup: Response /registration:", res.data);
      set({ userName: res.data.userName });
      toast.success(res.data.message || "Vui lòng kiểm tra email để nhận mã OTP!");
      return true;
    } catch (error) {
      const err = error.response?.data;
      const errorMessage =
        typeof err === "string" ? err : err?.message || "Đăng ký thất bại";
      console.error("signup: Lỗi:", errorMessage);
      if (setBackendError) setBackendError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyOtp: async (otpCode, userName, navigate) => {
    set({ isVerifyingOtp: true });
    try {
      console.log("verifyOtp: Gửi mã OTP:", otpCode, "và userName:", userName);
      const res = await axiosInstance.post("/api/verify-otp", { otpCode, userName });
      console.log("verifyOtp: Response /verify-otp:", res.data);
      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
        const userRes = await axiosInstance.get(
          `api/users/by-username?username=${res.data.userName}`
        );
        console.log("verifyOtp: Response /users/by-username:", userRes.data);
        set({
          authUser: {
            ...userRes.data,
            roles: userRes.data.roleName ? [userRes.data.roleName] : [],
          },
          role: userRes.data.roleName ? [userRes.data.roleName] : null,
        });
        await useCartStore.getState().syncLocalCart(userName);toast.success(res.data.message || "Xác thực email thành công!");
        
        navigate("/dashboard", { replace: true });
        return true;
      } else {
        throw new Error("Không nhận được token từ server");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Xác thực OTP thất bại";
      console.error("verifyOtp: Lỗi:", errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isVerifyingOtp: false });
    }
  },

  resendOtp: async (userName) => {
    set({ isResendingOtp: true });
    try {
      console.log("resendOtp: Gửi yêu cầu gửi lại OTP cho user:", userName);
      const res = await axiosInstance.post("/api/resend-otp", { userName });
      console.log("resendOtp: Response /resend-otp:", res.data);
      toast.success(res.data.message || "Đã gửi lại mã OTP. Vui lòng kiểm tra email!");
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Gửi lại OTP thất bại";
      console.error("resendOtp: Lỗi:", errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isResendingOtp: false });
    }
  },

  login: async (data, navigate) => {
    set({ isLoggingIn: true });
    try {
      console.log("login: Bắt đầu đăng nhập với:", data);
      const res = await axiosInstance.post("/api/login", {
        userName: data.userName,
        userPassword: data.userPassword,
      });
      console.log("login: Response /api/login:", res.data);
      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
        const userRes = await axiosInstance.get(
          `/api/users/by-username?username=${res.data.userName}`
        );
        console.log("login: Response /api/users/by-username:", userRes.data);
        const roles = userRes.data.roleName ? [userRes.data.roleName] : [];
        set({
          authUser: {
            ...userRes.data,
            roles,
          },
          role: roles,
        });
        try {
          await useCartStore.getState().syncLocalCart(res.data.userName);
          console.log("login: Đồng bộ giỏ hàng thành công");
        } catch (error) {
          console.error("login: Lỗi đồng bộ giỏ hàng:", error.message);
          toast.error("Không thể đồng bộ giỏ hàng tạm, nhưng bạn đã đăng nhập thành công");
        }
        toast.success("Đăng nhập thành công!");
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Không nhận được token từ server");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đăng nhập thất bại";
      console.error("login: Lỗi đăng nhập:", error);
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoggingIn: false });
      console.log("login: Kết thúc đăng nhập");
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      localStorage.removeItem("authToken");
      set({ authUser: null, role: null });
      toast.success("Đăng xuất thành công");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Lỗi khi đăng xuất";
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
      const errorMessage =
        error.response?.data?.message || "Không tìm thấy người dùng";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  updateUserDetails: async (userId, userDetails) => {
    try {
      const res = await axiosInstance.put(`/api/users/${userId}`, userDetails, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      set({
        authUser: {
          ...res.data,
          roles: res.data.roleName ? [res.data.roleName] : [],
        },
        role: res.data.roleName ? [res.data.roleName] : null,
      });
      toast.success("Cập nhật thông tin người dùng thành công!");
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cập nhật thông tin thất bại";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },
}));

export default useAuthStore;