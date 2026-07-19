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
    // Không redirect nếu là request đăng nhập (để LoginPage hiển thị thông báo lỗi)
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
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
  changePassword: (data) => api.post('/auth/change-password', data),
  deleteMe: () => api.delete('/auth/me'),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  resetPasswordDirect: (data) => api.post('/auth/reset-password-direct', data),
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
  // Gọi trước khi thêm vào giỏ – xác nhận tồn kho với CSDL
  addToCartValidate: (id, soluong) =>
    api.post(`/sanpham/${id}/add-to-cart`, null, { params: { soluong } }),
};

// ─── Testing ─────────────────────────────────────────────────────────────────
export const testAPI = {
  simulateDbError: () => api.post('/test/simulate-db-error'),
  restoreDb: () => api.post('/test/restore-db'),
  getDbStatus: () => api.get('/test/db-status'),
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
  // Khách hàng gửi yêu cầu hủy kèm lý do
  requestCancel: (id, lydo_huy) => api.post(`/donhang/my-orders/${id}/request-cancel`, { lydo_huy }),
  // Admin xem danh sách yêu cầu chờ duyệt hủy
  getCancelRequests: () => api.get('/donhang/cancel-requests'),
  // Admin duyệt hoặc từ chối yêu cầu hủy
  reviewCancel: (id, chap_thuan) => api.post(`/donhang/cancel-requests/${id}/review`, { chap_thuan }),
  // Admin cập nhật trạng thái thủ công
  updateStatus: (id, trangthai) => api.patch(`/donhang/${id}/trangthai`, null, { params: { trangthai } }),
};

