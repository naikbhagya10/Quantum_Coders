import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Bearer token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mediclear_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getCurrentUser = () => api.get('/auth/me');

// Medical Report & OCR APIs
export const uploadReport = (formData) => api.post('/reports/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const analyzeSampleReport = () => api.post('/reports/sample');
export const getUserReports = () => api.get('/reports');
export const getReportById = (id) => api.get(`/reports/${id}`);

// Symptom Checker APIs
export const checkSymptoms = (symptomData) => api.post('/symptoms/check', symptomData);
export const getSymptomHistory = () => api.get('/symptoms/history');

// Prescription APIs
export const analyzePrescription = (data) => {
  if (data instanceof FormData) {
    return api.post('/prescriptions/analyze', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post('/prescriptions/analyze', data);
};
export const getPrescriptions = () => api.get('/prescriptions');

// Appointment APIs
export const scheduleAppointment = (appointmentData) => api.post('/appointments', appointmentData);
export const getAppointments = () => api.get('/appointments');
export const cancelAppointment = (id) => api.put(`/appointments/${id}/cancel`);

// Nearby Healthcare Finder APIs
export const getNearbyHospitals = (params) => api.get('/nearby/hospitals', { params });

// Medical History API
export const getMedicalHistory = () => api.get('/history');

export default api;
