import api from './axiosInstance';

export const getNotifications = (params) => api.get('/notifications', { params });
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => api.patch('/notifications/mark-all-read');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
