import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Jobs ────────────────────────────────────────────────────────────────────
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getOne: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/client/my-jobs'),
};

// ─── Applications ────────────────────────────────────────────────────────────
export const applicationsAPI = {
  apply: (data) => api.post('/applications', data),
  getMy: () => api.get('/applications/my'),
  getForJob: (jobId) => api.get(`/applications/job/${jobId}`),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getFreelancers: (params) => api.get('/users/freelancers', { params }),
  getById: (id) => api.get(`/users/${id}`),
};

// ─── Projects ────────────────────────────────────────────────────────────────
export const projectsAPI = {
  getMy: () => api.get('/projects/my'),
  getOne: (id) => api.get(`/projects/${id}`),
  submitDelivery: (id, data) => api.post(`/projects/${id}/submit`, data),
  approve: (id) => api.put(`/projects/${id}/approve`),
  requestRevision: (id, data) => api.put(`/projects/${id}/revision`, data),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  createStripeIntent: (data) => api.post('/payments/stripe/create-intent', data),
  confirmStripe: (data) => api.post('/payments/stripe/confirm', data),
  createRazorpayOrder: (data) => api.post('/payments/razorpay/create-order', data),
  getMy: () => api.get('/payments/my'),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getForUser: (userId) => api.get(`/reviews/user/${userId}`),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  getPayments: () => api.get('/admin/payments'),
};

// ─── Messages ────────────────────────────────────────────────────────────────
export const messagesAPI = {
  send: (data) => api.post('/messages', data),
  getConversation: (userId) => api.get(`/messages/${userId}`),
  getConversations: () => api.get('/messages/conversations'),
};

export default api;
