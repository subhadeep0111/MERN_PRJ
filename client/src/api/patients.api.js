import api from './axios';
export const getAllPatients = (params) => api.get('/api/patients', { params });
export const getPatientById = (id) => api.get(`/api/patients/${id}`);
export const createPatient = (data) => api.post('/api/patients', data);
export const updatePatient = (id, data) => api.put(`/api/patients/${id}`, data);
export const deactivatePatient = (id) => api.delete(`/api/patients/${id}`);
