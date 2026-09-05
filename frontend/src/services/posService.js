import api from './api';

export const posService = {
  getOrders: () => api.get('/pos/orders'),
  checkout: (orderData) => api.post('/pos/checkout', orderData),
  getAnalytics: () => api.get('/pos/analytics'),
};

export default posService;
