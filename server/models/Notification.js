const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  // Tenant notifications
  'BOOKING_SUBMITTED',
  'BOOKING_ACCEPTED',
  'BOOKING_REJECTED',
  'PAYMENT_SUCCESS',
  'BOOKING_CANCELLED',
  // Owner notifications
  'NEW_BOOKING_REQUEST',
  'PAYMENT_RECEIVED',
  'BOOKING_CANCELLED_BY_TENANT',
  // Admin
  'SYSTEM_ALERT',
];

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  type:    { type: String, enum: NOTIFICATION_TYPES, required: true },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false },

  relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  relatedListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },

  // deep-link on frontend
  actionUrl: { type: String, default: '' },
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
