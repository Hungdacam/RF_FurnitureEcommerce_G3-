import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8900', // Authentication Service
  headers: {
    'Content-Type': 'application/json',
  },
});

export  const axiosCatalog = axios.create({
  baseURL: 'http://localhost:8900/api/catalog', // Product Catalog Service
 
});

export const axiosCart = axios.create({
  baseURL: 'http://localhost:8900/api/cart', // Cart Service via Gateway
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosOrder = axios.create({
  baseURL: 'http://localhost:8900/api/orders', // Order Service via Gateway
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
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response && error.response.status === 404) {
      // Xử lý lỗi 404
      console.log('Endpoint không tồn tại');
    }
    return Promise.reject(error);
  }
);

axiosCatalog.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request URL:', config.url);
    console.log('Request Method:', config.method);
    console.log('Request Headers:', config.headers);
    console.log('Request Data:', config.data);
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

axiosOrder.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
