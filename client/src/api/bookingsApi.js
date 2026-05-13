import api from './axiosInstance';

export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = (params) => api.get('/bookings/my', { params });
export const getOwnerBookings = (params) => api.get('/bookings/owner', { params });
export const getAllBookings = (params) => api.get('/bookings/all', { params });
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const acceptBooking = (id) => api.patch(`/bookings/${id}/accept`);
export const rejectBooking = (id, data) => api.patch(`/bookings/${id}/reject`, data);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);
