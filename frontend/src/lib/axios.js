import axios from 'axios';

// Kiểm tra môi trường để sử dụng base URL phù hợp
const getBaseURL = () => {
  // Trong production, sử dụng relative path
  if (import.meta.env.PROD) {
    return '';
  }
  // Trong development, sử dụng localhost
  return 'http://localhost:8900';
};

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosCatalog = axios.create({
  baseURL: `${getBaseURL()}/api/catalog`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosCart = axios.create({
  baseURL: `${getBaseURL()}/api/cart`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosOrder = axios.create({
  baseURL: `${getBaseURL()}/api/orders`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosStats = axios.create({
  baseURL: `${getBaseURL()}/api/statistics`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors để thêm token
const addTokenInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Áp dụng interceptor cho tất cả instances
addTokenInterceptor(axiosInstance);
addTokenInterceptor(axiosCatalog);
addTokenInterceptor(axiosCart);
addTokenInterceptor(axiosOrder);
addTokenInterceptor(axiosStats);
