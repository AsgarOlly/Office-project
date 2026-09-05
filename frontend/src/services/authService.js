import api, { setAuthToken, removeAuthToken } from './api';

export const authService = {
  login: async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  getCurrentUser: () => api.get('/auth/me'),

  getAllUsers: () => api.get('/auth/users'),

  logout: () => {
    removeAuthToken();
    localStorage.removeItem('tc_auth_user');
  }
};

export default authService;
