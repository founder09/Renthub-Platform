const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const notifSvc = require('./notificationService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order for an accepted booking.
 */
async function createPaymentOrder(bookingId, tenantId) {
  const booking = await Booking.findById(bookingId).populate('propertyId');
  if (!booking) throw { statusCode: 404, message: 'Booking not found' };
  if (booking.tenantId.toString() !== tenantId.toString()) {
    throw { statusCode: 403, message: 'Not authorized' };
  }
  if (booking.bookingStatus !== 'accepted') {
    throw { statusCode: 400, message: 'Booking must be accepted before payment' };
  }
  if (booking.paymentStatus === 'paid') {
    throw { statusCode: 400, message: 'Booking is already paid' };
  }

  const order = await razorpay.orders.create({
    amount: Math.round(booking.totalAmount * 100), // Razorpay uses paise
    currency: 'INR',
    receipt: booking.bookingId,
    notes: {
      bookingId: booking.bookingId,
      propertyId: booking.propertyId._id.toString(),
      tenantId: tenantId.toString(),
    },
  });

  booking.razorpayOrderId = order.id;
  await booking.save();

  return { order, booking };
}

/**
 * Verify Razorpay payment signature and update booking.
 */
async function verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId, tenantId }) {
  const booking = await Booking.findById(bookingId).populate('propertyId');
  if (!booking) throw { statusCode: 404, message: 'Booking not found' };
  if (booking.tenantId.toString() !== tenantId.toString()) {
    throw { statusCode: 403, message: 'Not authorized' };
  }

  // Signature verification (HMAC SHA256)
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpaySignature) {
    throw { statusCode: 400, message: 'Payment verification failed — invalid signature' };
  }

  // Update booking
  booking.paymentStatus = 'paid';
  booking.bookingStatus = 'accepted'; // stays accepted; completed after stay
  booking.razorpayOrderId = razorpayOrderId;
  booking.razorpayPaymentId = razorpayPaymentId;
  booking.razorpaySignature = razorpaySignature;
  booking.transactionId = razorpayPaymentId;
  await booking.save();

  // Send notifications
  await notifSvc.notifyPaymentSuccess({
    tenantId: booking.tenantId,
    ownerId: booking.ownerId,
    booking,
    listing: booking.propertyId,
  });

  return booking;
}

module.exports = { createPaymentOrder, verifyPayment };
