import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add Bearer token and selected language to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mediclear_token');
    const language = localStorage.getItem('mediclear_language') || 'English';

    if (!config.headers) {
      config.headers = {};
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['X-Language'] = language;

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mediclear_token');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getCurrentUser = () => api.get('/auth/me');

// Medical Report & OCR APIs
export const uploadReport = (formData) => {
  const language = localStorage.getItem('mediclear_language') || 'English';
  if (formData instanceof FormData) {
    formData.append('language', language);
  }
  const token = localStorage.getItem('mediclear_token');
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return api.post('/reports/upload', formData, { headers });
};
export const analyzeSampleReport = () => api.post('/reports/sample');
export const getUserReports = () => api.get('/reports');
export const getReportById = (id) => api.get(`/reports/${id}`);

// Symptom Checker APIs
export const checkSymptoms = (symptomData) => api.post('/symptoms/check', symptomData);
export const getSymptomHistory = () => api.get('/symptoms/history');

// Prescription APIs
export const analyzePrescription = (data) => {
  const language = localStorage.getItem('mediclear_language') || 'English';
  if (data instanceof FormData) {
    data.append('language', language);
    return api.post('/prescriptions/analyze', data);
  }
  return api.post('/prescriptions/analyze', { ...data, language });
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
