import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://channelflow-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    // Better way to set headers in Axios 1.x
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log(`[API] request to ${config.url} with token (len: ${token.length})`);
  } else {
    console.log(`[API] request to ${config.url} WITHOUT token`);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle 505 (Invalid Token)
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 505) {
    console.error('[API] Token Invalid or Expired (Status 505). Redirecting to login.');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
