import api from './api';

export const employeeService = {
  getAll: () => api.get('/employees'),
  create: (data) => api.post('/employees', data),
  getAttendance: (date) => api.get(`/employees/attendance${date ? `?date=${encodeURIComponent(date)}` : ''}`),
  recordAttendance: (data) => api.post('/employees/attendance', data),
  getPayrollSummary: () => api.get('/employees/payroll'),
};

export default employeeService;
