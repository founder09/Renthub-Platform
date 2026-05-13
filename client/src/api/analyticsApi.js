import api from './axiosInstance';

export const getOwnerAnalytics = () => api.get('/analytics/owner');
export const getTenantAnalytics = () => api.get('/analytics/tenant');
export const getAdminAnalytics = () => api.get('/analytics/admin');
