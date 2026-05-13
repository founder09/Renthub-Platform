import api from './axiosInstance'

export const getAllListings = (params) => api.get('/listings', { params })
export const getListing = (id) => api.get(`/listings/${id}`)
export const createListing = (data) => api.post('/listings', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const updateListing = (id, data) => api.put(`/listings/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const deleteListing = (id) => api.delete(`/listings/${id}`)
export const getPrivateListing = (id) => api.get(`/listings/${id}/private`)
