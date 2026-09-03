import axios from 'axios';

const BASE = '/api';

export const slotsAPI = {
  getAll: () => axios.get(`${BASE}/slots`),
  getById: (id) => axios.get(`${BASE}/slots/${id}`),
  create: (data) => axios.post(`${BASE}/slots`, data),
  update: (id, data) => axios.put(`${BASE}/slots/${id}`, data),
  delete: (id) => axios.delete(`${BASE}/slots/${id}`),
  checkCompat: (vegetables, quantityLitres) => axios.post(`${BASE}/slots/check-compat`, { vegetables, quantityLitres }),
  addVegetables: (id, data) => axios.post(`${BASE}/slots/${id}/add-vegetables`, data),
};

export const alertsAPI = {
  getAll: () => axios.get(`${BASE}/alerts`),
  create: (data) => axios.post(`${BASE}/alerts`, data),
  dismiss: (id) => axios.delete(`${BASE}/alerts/${id}`),
};