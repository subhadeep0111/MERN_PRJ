import api from './axios';
export const getAllUsers = () => api.get('/api/users');
export const createUser = (data) => api.post('/api/users', data);
export const updateUser = (id, data) => api.put(`/api/users/${id}`, data);
export const deactivateUser = (id) => api.delete(`/api/users/${id}`);
