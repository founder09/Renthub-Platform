import api from './axiosInstance'

export const createReview  = (listingId, data) =>
  api.post(`/listings/${listingId}/reviews`, data)

export const deleteReview  = (listingId, reviewId) =>
  api.delete(`/listings/${listingId}/reviews/${reviewId}`)
