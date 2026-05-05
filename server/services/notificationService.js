const Notification = require('../models/Notification');

/**
 * Create a notification and persist it.
 */
async function createNotification({ recipientId, senderId = null, type, title, message, relatedBooking = null, relatedListing = null, actionUrl = '' }) {
  try {
    const notification = await Notification.create({
      recipientId, senderId, type, title, message,
      relatedBooking, relatedListing, actionUrl,
    });
    return notification;
  } catch (err) {
    console.error('[NotificationService] Failed to create notification:', err.message);
  }
}

/**
 * Notify tenant their booking was submitted.
 */
async function notifyBookingSubmitted({ tenantId, ownerId, booking, listing }) {
  await Promise.all([
    createNotification({
      recipientId: tenantId,
      senderId: ownerId,
      type: 'BOOKING_SUBMITTED',
      title: 'Booking Request Sent!',
      message: `Your booking request for "${listing.title}" has been submitted. Waiting for owner approval.`,
      relatedBooking: booking._id,
      relatedListing: listing._id,
      actionUrl: '/dashboard/bookings',
    }),
    createNotification({
      recipientId: ownerId,
      senderId: tenantId,
      type: 'NEW_BOOKING_REQUEST',
      title: 'New Booking Request',
      message: `You have a new booking request for "${listing.title}". Review and respond.`,
      relatedBooking: booking._id,
      relatedListing: listing._id,
      actionUrl: '/dashboard/bookings',
    }),
  ]);
}

async function notifyBookingAccepted({ tenantId, ownerId, booking, listing }) {
  await createNotification({
    recipientId: tenantId,
    senderId: ownerId,
    type: 'BOOKING_ACCEPTED',
    title: 'Booking Accepted! 🎉',
    message: `Great news! Your booking for "${listing.title}" has been accepted. Complete payment to confirm.`,
    relatedBooking: booking._id,
    relatedListing: listing._id,
    actionUrl: '/dashboard/bookings',
  });
}

async function notifyBookingRejected({ tenantId, ownerId, booking, listing, note }) {
  await createNotification({
    recipientId: tenantId,
    senderId: ownerId,
    type: 'BOOKING_REJECTED',
    title: 'Booking Request Declined',
    message: `Your booking request for "${listing.title}" was declined.${note ? ` Reason: ${note}` : ''}`,
    relatedBooking: booking._id,
    relatedListing: listing._id,
    actionUrl: '/dashboard/bookings',
  });
}

async function notifyPaymentSuccess({ tenantId, ownerId, booking, listing }) {
  await Promise.all([
    createNotification({
      recipientId: tenantId,
      type: 'PAYMENT_SUCCESS',
      title: 'Payment Successful! ✅',
      message: `Payment of ₹${booking.totalAmount.toLocaleString('en-IN')} for "${listing.title}" was successful. Booking confirmed!`,
      relatedBooking: booking._id,
      relatedListing: listing._id,
      actionUrl: '/dashboard/bookings',
    }),
    createNotification({
      recipientId: ownerId,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Received 💰',
      message: `You received payment of ₹${booking.totalAmount.toLocaleString('en-IN')} for "${listing.title}".`,
      relatedBooking: booking._id,
      relatedListing: listing._id,
      actionUrl: '/dashboard/bookings',
    }),
  ]);
}

async function notifyBookingCancelled({ cancelledBy, tenantId, ownerId, booking, listing }) {
  const isTenantCancel = cancelledBy === 'tenant';
  await Promise.all([
    createNotification({
      recipientId: isTenantCancel ? ownerId : tenantId,
      type: isTenantCancel ? 'BOOKING_CANCELLED_BY_TENANT' : 'BOOKING_CANCELLED',
      title: 'Booking Cancelled',
      message: `The booking for "${listing.title}" has been cancelled by the ${cancelledBy}.`,
      relatedBooking: booking._id,
      relatedListing: listing._id,
      actionUrl: '/dashboard/bookings',
    }),
  ]);
}

module.exports = {
  createNotification,
  notifyBookingSubmitted,
  notifyBookingAccepted,
  notifyBookingRejected,
  notifyPaymentSuccess,
  notifyBookingCancelled,
};
