import axios from 'axios';

// Hardcoded for Vercel/Render production, fallback to localhost for development
const API_URL = import.meta.env.PROD 
  ? 'https://chattrix-chat-application.onrender.com' 
  : 'http://localhost:5555';

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add a request interceptor to include the JWT token in headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
