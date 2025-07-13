import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (name, email, password) => 
    api.post('/auth/register', { name, email, password }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getProfile: () => 
    api.get('/auth/me'),
  
  updateRole: (role) => 
    api.put('/auth/role', { role })
};

export default api;