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

export default api;
