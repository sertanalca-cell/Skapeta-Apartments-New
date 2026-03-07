import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email, password, role = 'admin') => {
    const response = await api.post('/auth/register', { email, password, role });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Apartments API
export const apartmentsAPI = {
  getAll: async () => {
    const response = await api.get('/apartments');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/apartments/${id}`);
    return response.data;
  },
  
  create: async (apartmentData) => {
    const response = await api.post('/apartments', apartmentData);
    return response.data;
  },
  
  update: async (id, apartmentData) => {
    const response = await api.put(`/apartments/${id}`, apartmentData);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/apartments/${id}`);
  },
};

// Gallery API
export const galleryAPI = {
  getAll: async (category = null) => {
    const params = category ? { category } : {};
    const response = await api.get('/gallery', { params });
    return response.data;
  },
  
  add: async (imageData) => {
    const response = await api.post('/gallery', imageData);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/gallery/${id}`);
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  uploadMultipleImages: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    const response = await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteImage: async (filename) => {
    await api.delete(`/upload/image/${filename}`);
  },
};

// Settings API
export const settingsAPI = {
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  
  update: async (settingsData) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  },
};

// Sightseeing API
export const sightseeingAPI = {
  getAll: async () => {
    const response = await api.get('/sightseeing');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/sightseeing/${id}`);
    return response.data;
  },
  
  create: async (placeData) => {
    const response = await api.post('/sightseeing', placeData);
    return response.data;
  },
  
  update: async (id, placeData) => {
    const response = await api.put(`/sightseeing/${id}`, placeData);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/sightseeing/${id}`);
  },
};

// Menu Items API
export const menuAPI = {
  getAll: async (availableOnly = false) => {
    const params = availableOnly ? { available_only: true } : {};
    const response = await api.get('/menu-items', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/menu-items/${id}`);
    return response.data;
  },
  
  create: async (menuData) => {
    const response = await api.post('/menu-items', menuData);
    return response.data;
  },
  
  update: async (id, menuData) => {
    const response = await api.put(`/menu-items/${id}`, menuData);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/menu-items/${id}`);
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  getByUserId: async (userId) => {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },
  
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  updateStatus: async (id, statusData) => {
    const response = await api.put(`/orders/${id}`, statusData);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/orders/${id}`);
  },
  
  closeDay: async () => {
    const response = await api.post('/orders/close-day');
    return response.data;
  },
  
  getClosedOrders: async (limit = 50) => {
    const response = await api.get(`/orders/closed?limit=${limit}`);
    return response.data;
  },
};

// Customer Auth API
export const customerAuthAPI = {
  login: async (firstName, lastName) => {
    const response = await api.post('/customer/login', {
      first_name: firstName,
      last_name: lastName,
    });
    return response.data;
  },
  
  register: async (firstName, lastName, phone = null) => {
    const response = await api.post('/customer/register', {
      first_name: firstName,
      last_name: lastName,
      phone,
    });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  trackVisit: async (page = '/') => {
    const response = await api.post('/analytics/visit', { page });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/analytics/stats');
    return response.data;
  },
};

// Booking Reservations API
export const bookingReservationsAPI = {
  getAll: async () => {
    const response = await api.get('/booking-reservations');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/booking-reservations/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/booking-reservations', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/booking-reservations/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/booking-reservations/${id}`);
  },
};

// Reports API
export const reportsAPI = {
  getMonthlyRevenue: async (month) => {
    const response = await api.get(`/reports/monthly-revenue?month=${month}`);
    return response.data;
  },
};

export default api;
