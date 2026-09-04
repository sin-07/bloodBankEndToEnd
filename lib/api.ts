import axios from 'axios';
import Cookies from 'js-cookie';

/**
 * Axios API client with JWT interceptor
 * Now uses Next.js API routes (same-origin)
 */
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========================
// Auth API
// ========================
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};

// ========================
// Donor API
// ========================
export const donorAPI = {
  getProfile: () => api.get('/donors/profile'),
  updateProfile: (data: any) => api.put('/donors/profile', data),
  checkEligibility: () => api.get('/donors/eligibility'),
  getDonations: (params?: any) => api.get('/donors/donations', { params }),
  getDonationHistory: (page?: number, limit?: number) =>
    api.get('/donors/donations', { params: { page, limit } }),
  getAll: (params?: any) => api.get('/donors', { params }),
  downloadCertificate: (donationId: string) =>
    api.get(`/donors/donations/${donationId}/certificate`, { responseType: 'blob' }),
  // Appointment flow
  bookAppointment: (data: any) => api.post('/donors/appointments', data),
  getAppointments: (params?: any) => api.get('/donors/appointments', { params }),
  recordDonation: (data: any) => api.post('/donors/donations', data),
  approveDonation: (id: string, data?: any) => api.put(`/donors/donations/${id}/approve`, data || {}),
  rejectDonation: (id: string, data?: any) => api.put(`/donors/donations/${id}/reject`, data || {}),
};

// ========================
// Blood Request API
// ========================
export const bloodRequestAPI = {
  create: (data: any) => api.post('/blood-requests', data),
  getAll: (params?: any) => api.get('/blood-requests', { params }),
  getById: (id: string) => api.get(`/blood-requests/${id}`),
  updateStatus: (id: string, data: any) => api.put(`/blood-requests/${id}/status`, data),
  cancel: (id: string) => api.put(`/blood-requests/${id}/cancel`),
};

// ========================
// Inventory API
// ========================
export const inventoryAPI = {
  getAll: (params?: any) => api.get('/inventory', { params }),
  getSummary: () => api.get('/inventory/summary'),
  add: (data: any) => api.post('/inventory', data),
  update: (id: string, data: any) => api.put(`/inventory/${id}`, data),
  remove: (id: string) => api.delete(`/inventory/${id}`),
  checkExpiry: () => api.post('/inventory/check-expiry'),
  getAlerts: () => api.get('/inventory/alerts'),
};

// ========================
// Admin API
// ========================
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getDashboardStats: () => api.get('/admin/stats'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUserStatus: (id: string, data: { isActive: boolean }) =>
    api.put(`/admin/users/${id}/status`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  exportReport: (type: string, params?: any) =>
    api.get(`/admin/export/${type}`, { params, responseType: 'blob' }),
};

// ========================
// Hospital API
// ========================
export const hospitalAPI = {
  getProfile: () => api.get('/hospitals/profile'),
  updateProfile: (data: any) => api.put('/hospitals/profile', data),
  createBulkRequest: (data: any) => api.post('/hospitals/bulk-request', data),
  getRequests: (params?: any) => api.get('/hospitals/requests', { params }),
  getAll: (params?: any) => api.get('/hospitals', { params }),
  verify: (id: string, data?: any) => api.put(`/hospitals/${id}/verify`, data),
};

export default api;
