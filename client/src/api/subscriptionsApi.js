import api from './axiosInstance';

export const getMySubscription       = ()       => api.get('/subscriptions/my');
export const getPlans                = ()       => api.get('/subscriptions/plans');
export const createSubscriptionOrder = (planId) => api.post('/subscriptions/order', { planId });
export const verifySubscriptionPay   = (data)   => api.post('/subscriptions/verify', data);
export const downgradeToFree         = ()       => api.patch('/subscriptions/downgrade');
export const getAllSubscriptions      = (params) => api.get('/subscriptions/all', { params });
export const getSubscriptionStats    = ()       => api.get('/subscriptions/stats');
