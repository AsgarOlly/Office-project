import api from './api';

export const customerService = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  getMeasurements: (customerId) => api.get(`/customers/${customerId}/measurements`),
  saveMeasurements: (customerId, data) => api.post(`/customers/${customerId}/measurements`, data),
};

export default customerService;
