import api from './axios';
export const getRecordsByPatient = (patientId) => api.get('/api/records', { params: { patientId } });
export const getRecordById = (id) => api.get(`/api/records/${id}`);
export const createRecord = (data) => api.post('/api/records', data);
export const updateRecord = (id, data) => api.put(`/api/records/${id}`, data);
export const addAttachment = (id, formData) => api.post(`/api/records/${id}/attachments`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
