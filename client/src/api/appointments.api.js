import api from './axios';
export const getAllAppointments = (params) => api.get('/api/appointments', { params });
export const getAppointmentById = (id) => api.get(`/api/appointments/${id}`);
export const createAppointment = (data) => api.post('/api/appointments', data);
export const updateAppointment = (id, data) => api.put(`/api/appointments/${id}`, data);
export const cancelAppointment = (id) => api.put(`/api/appointments/${id}/cancel`);
export const getAvailableSlots = (doctorId, date) => api.get('/api/appointments/slots', { params: { doctorId, date } });
