import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8900', // Authentication Service
  headers: {
    'Content-Type': 'application/json',
  },
});

export  const axiosCatalog = axios.create({
  baseURL: 'http://localhost:8900/api/catalog', // Product Catalog Service
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosCart = axios.create({
  baseURL: 'http://localhost:8900/api/cart', // Cart Service via Gateway
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào header
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
axiosCatalog.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Lấy token từ localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosCart.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

