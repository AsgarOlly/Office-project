import api from './api';

export const productService = {
  getAll: (category) => api.get(`/products${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  getByBarcode: (barcode) => api.get(`/products/barcode/${encodeURIComponent(barcode)}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
};

export default productService;
