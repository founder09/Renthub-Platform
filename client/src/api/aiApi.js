import api from './axiosInstance';

export const getRecommendations      = (params) => api.get('/ai/recommendations', { params });
export const generateDescription     = (data)   => api.post('/ai/generate-description', data);
export const getSearchSuggestions    = (q)       => api.get('/ai/suggestions', { params: { q } });
export const chat                    = (message, context) => api.post('/ai/chat', { message, context });
