import api from './api';

export const bookingService = {
  getAll: () => api.get('/bookings'),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  getJobCards: () => api.get('/bookings/jobs'),
  assignJobCard: (data) => api.post('/bookings/jobs', data),
  settleJobPayout: (jobId) => api.post(`/bookings/jobs/${jobId}/settle`),
};

export default bookingService;
