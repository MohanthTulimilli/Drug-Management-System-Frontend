import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isPayment = err.config?.url?.includes('/payment/');
      if (!isPayment) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  registerRetailer: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register-retailer', data),
  registerDelivery: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register-delivery', data),
};

// Users
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  getByRole: (role: string) => api.get(`/users/role/${role}`),
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  toggleStatus: (id: number) => api.patch(`/users/${id}/toggle-status`),
  stats: () => api.get('/users/stats'),
};

// Inventory
export const inventoryAPI = {
  getMedicines: (search?: string) => api.get('/inventory/medicines', { params: search ? { search } : {} }),
  getAllMedicines: () => api.get('/inventory/medicines/all'),
  getMedicine: (id: number) => api.get(`/inventory/medicines/${id}`),
  createMedicine: (data: any) => api.post('/inventory/medicines', data),
  updateMedicine: (id: number, data: any) => api.put(`/inventory/medicines/${id}`, data),
  deleteMedicine: (id: number) => api.delete(`/inventory/medicines/${id}`),
  getBatches: (medicineId?: number) => api.get('/inventory/batches', { params: medicineId ? { medicineId } : {} }),
  createBatch: (data: any, medicineId: number) => api.post(`/inventory/batches?medicineId=${medicineId}`, data),
  updateBatch: (id: number, data: any) => api.put(`/inventory/batches/${id}`, data),
  deleteBatchesBulk: (ids: number[]) => api.post('/inventory/batches/bulk-delete', ids),
  getLowStock: () => api.get('/inventory/low-stock'),
  getExpiring: () => api.get('/inventory/expiring-soon'),
  dashboard: () => api.get('/inventory/dashboard'),
};

// Orders
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getByRetailer: (id: number) => api.get(`/orders?retailerId=${id}`),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: number, status: string) => api.put(`/orders/${id}/status`, { status }),
  stats: () => api.get('/orders/stats'),
};

// Checkout – complete payment (no gateway), returns order for receipt
function paymentHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface OrderPayload {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  totalAmount?: number;
  subtotal?: number;
  tax?: number;
  shippingAddress?: string;
  retailerName?: string;
  shopName?: string;
  contactPhone?: string;
  createdAt?: string;
  items?: { medicineName: string; quantity: number; unitPrice: number; totalPrice: number }[];
  [key: string]: unknown;
}

export const paymentAPI = {
  completeOrder: (data: {
    retailerId: number;
    retailerName: string;
    shippingAddress: string;
    notes?: string;
    shopName?: string;
    contactPhone?: string;
    items: { medicineId: number; medicineName: string; quantity: number; unitPrice: number }[];
  }) => api.post<OrderPayload>('/payment/complete', data, { headers: paymentHeaders() }),
};

// Deliveries
export const deliveriesAPI = {
  getAll: () => api.get('/deliveries'),
  getByPerson: (id: number) => api.get(`/deliveries/assigned/${id}`),
  getById: (id: number) => api.get(`/deliveries/${id}`),
  create: (data: any) => api.post('/deliveries', data),
  updateStatus: (id: number, status: string, notes?: string) => api.put(`/deliveries/${id}/status`, { status, notes }),
  stats: () => api.get('/deliveries/stats'),
};

// Retailers
export const retailersAPI = {
  getAll: () => api.get('/retailers'),
  getAllAdmin: () => api.get('/retailers/admin'),
  getById: (id: number) => api.get(`/retailers/${id}`),
  getByUser: (userId: number) => api.get(`/retailers/user/${userId}`),
  create: (data: any) => api.post('/retailers', data),
  update: (id: number, data: any) => api.put(`/retailers/${id}`, data),
  toggleActive: (id: number) => api.patch(`/retailers/${id}/toggle-active`),
  toggleVerified: (id: number) => api.patch(`/retailers/${id}/toggle-verified`),
};

// Admin
export const adminAPI = {
  getAuditLogs: () => api.get('/admin/audit-logs'),
  createAuditLog: (data: any) => api.post('/admin/audit-logs', data),
  validateBatches: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/batch/validate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadBatches: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/batch/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  clearInventory: () => api.delete('/admin/inventory/clear'),
};

export default api;
