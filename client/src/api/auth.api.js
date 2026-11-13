import api from './axios';
export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const register = (data) => api.post('/api/auth/register', data);
export const refreshToken = (refreshToken) => api.post('/api/auth/refresh', { refreshToken });
export const logout = () => api.post('/api/auth/logout');
