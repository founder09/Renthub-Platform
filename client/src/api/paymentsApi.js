import api from './axiosInstance';

export const getPaymentKey   = () => api.get('/payments/key');
export const createOrder     = (bookingId) => api.post('/payments/order', { bookingId });
export const verifyPayment   = (data) => api.post('/payments/verify', data);
