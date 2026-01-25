import axios from 'axios';

// Força o uso do servidor local em desenvolvimento
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const baseURL = isDevelopment 
  ? 'http://localhost:3333'
  : (process.env.REACT_APP_BACKEND_URL || 'https://controle-financeiro-eco-back.onrender.com');

console.log('🔧 API Base URL:', baseURL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 isDevelopment:', isDevelopment);

export const api = axios.create({
  baseURL,
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
