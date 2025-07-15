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

export const adminAPI = {
  getDashboardStats: () => 
    api.get('/admin/dashboard'),
  
  getAllUsers: () => 
    api.get('/admin/users'),
  
  getLenders: () => 
    api.get('/admin/lenders'),
  
  getBorrowers: () => 
    api.get('/admin/borrowers'),
  
  transferMoney: (from, to, amount) => 
    api.post('/admin/transfer', { from, to, amount }),
  
  deleteUser: (userId) => 
    api.delete(`/admin/users/${userId}`)
};

export const lenderAPI = {
  getProfile: () => 
    api.get('/lender/profile'),
  
  updateProfile: (data) => 
    api.put('/lender/profile', data),
  
  getBorrowers: () => 
    api.get('/lender/borrowers'),
  
  transferMoney: (to, amount) => 
    api.post('/lender/transfer', { to, amount }),
  
  loadWallet: (amount) => 
    api.post('/lender/load-wallet', { amount })
};

export default api;