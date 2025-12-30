import axios from 'axios';

const baseURL = process.env.REACT_APP_BACKEND_URL || 
                process.env.REACT_APP_API_URL || 
                (window.location.hostname === 'controle-financeiro-eco-frontend.onrender.com' 
                  ? 'https://controle-financeiro-eco-back.onrender.com'
                  : 'http://localhost:3333');

console.log('🔧 API Base URL:', baseURL);
console.log('🔧 REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
console.log('🔧 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

export const api = axios.create({
  baseURL,
});
