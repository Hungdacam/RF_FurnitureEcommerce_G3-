import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8811',
  headers: {
    'Content-Type': 'application/json',
  },
});

export  const axiosCatalog = axios.create({
  baseURL: 'http://localhost:8810/api/catalog', // Product Catalog Service
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

