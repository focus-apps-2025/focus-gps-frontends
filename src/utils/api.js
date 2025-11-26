  // frontend/src/utils/api.js
  import axios from 'axios';
  import Cookies from 'js-cookie';

  const api = axios.create({
    // Instead of using .env, directly give your backend URL:
    baseURL: 'https://focus-gps-backend-1.onrender.com',  // change this to your backend's actual URL
    headers: {
      'Content-Type': 'application/json',
      
    },
    withCredentials: true,
  });

  // Request interceptor to add the token to headers
  api.interceptors.request.use(
    (config) => {
      const token = Cookies.get('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  export default api;
