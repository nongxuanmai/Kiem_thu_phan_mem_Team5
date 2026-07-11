import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  getUsers: () => api.get('/auth/users'),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// ─── Sản phẩm ───────────────────────────────────────────────────────────────
export const sanphamAPI = {
  getAll: (params) => api.get('/sanpham', { params }),
  getById: (id) => api.get(`/sanpham/${id}`),
  create: (data) => api.post('/sanpham', data),
  update: (id, data) => api.put(`/sanpham/${id}`, data),
  delete: (id) => api.delete(`/sanpham/${id}`),
  uploadImage: (id, formData) =>
    api.post(`/sanpham/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Danh mục ───────────────────────────────────────────────────────────────
export const danhmucAPI = {
  getAll: () => api.get('/danhmuc'),
  create: (data) => api.post('/danhmuc', data),
  update: (id, data) => api.put(`/danhmuc/${id}`, data),
  delete: (id) => api.delete(`/danhmuc/${id}`),
};

// ─── Đơn hàng ───────────────────────────────────────────────────────────────
export const donhangAPI = {
  create: (data) => api.post('/donhang', data),
  getMyOrders: () => api.get('/donhang/my-orders'),
  getById: (id) => api.get(`/donhang/${id}`),
  getAll: () => api.get('/donhang'),
  delete: (id) => api.delete(`/donhang/${id}`),
};
