import axios from 'axios';

// Use environment variable if deployed, otherwise fallback to local backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({ baseURL: API_BASE });

// ─── Event Types ───────────────────────────────────────────────────
export const getEventTypes = () => api.get('/event-types').then(r => r.data);
export const getPublicEventType = (username, slug) =>
  api.get(`/event-types/${username}/${slug}`).then(r => r.data);
export const createEventType = (data) => api.post('/event-types', data).then(r => r.data);
export const updateEventType = (id, data) => api.put(`/event-types/${id}`, data).then(r => r.data);
export const deleteEventType = (id) => api.delete(`/event-types/${id}`).then(r => r.data);

// ─── Availability ──────────────────────────────────────────────────
export const getAvailability = () => api.get('/availability').then(r => r.data);
export const updateAvailability = (data) => api.put('/availability', data).then(r => r.data);

// ─── Bookings ──────────────────────────────────────────────────────
export const getBookings = (filter) =>
  api.get('/bookings', { params: { filter } }).then(r => r.data);
export const getAvailableSlots = (eventTypeId, date) =>
  api.get('/bookings/slots', { params: { eventTypeId, date } }).then(r => r.data);
export const createBooking = (data) => api.post('/bookings', data).then(r => r.data);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`).then(r => r.data);
export const rescheduleBooking = (id, data) =>
  api.patch(`/bookings/${id}/reschedule`, data).then(r => r.data);
export const getBookingByToken = (token) =>
  api.get(`/bookings/reschedule/${token}`).then(r => r.data);

// ─── Questions ─────────────────────────────────────────────────────
export const getQuestions = (eventTypeId) =>
  api.get('/questions', { params: { eventTypeId } }).then(r => r.data);
export const createQuestion = (data) => api.post('/questions', data).then(r => r.data);
export const updateQuestion = (id, data) => api.put(`/questions/${id}`, data).then(r => r.data);
export const deleteQuestion = (id) => api.delete(`/questions/${id}`).then(r => r.data);

// ─── Date Overrides ────────────────────────────────────────────────
export const getDateOverrides = () => api.get('/date-overrides').then(r => r.data);
export const createDateOverride = (data) => api.post('/date-overrides', data).then(r => r.data);
export const deleteDateOverride = (id) => api.delete(`/date-overrides/${id}`).then(r => r.data);
