import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: '/api', // Đổi thành đường dẫn tương đối
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosCatalog = axios.create({
  baseURL: '/api/catalog', // Đổi thành đường dẫn tương đối
});

export const axiosCart = axios.create({
  baseURL: '/api/cart', // Đổi thành đường dẫn tương đối
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosOrder = axios.create({
  baseURL: '/api/orders', // Đổi thành đường dẫn tương đối
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
