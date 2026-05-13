const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const notifSvc = require('./notificationService');

/**
 * Calculate total amount for a booking.
 * Uses monthly price and number of months derived from dates.
 */
function calcTotalAmount(pricePerMonth, securityDeposit, checkInDate, checkOutDate) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const msPerMonth = msPerDay * 30;
  const days = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / msPerDay);
  const months = Math.max(1, Math.ceil(days / 30));
  const rent = pricePerMonth * months;
  return { months, rent, totalAmount: rent + securityDeposit };
}

/**
 * Check if the given dates overlap with any existing accepted/pending booking.
 */
async function isPropertyAvailable(propertyId, checkInDate, checkOutDate, excludeBookingId = null) {
  const query = {
    propertyId,
    bookingStatus: { $in: ['pending', 'accepted'] },
    $or: [
      { checkInDate: { $lt: new Date(checkOutDate) }, checkOutDate: { $gt: new Date(checkInDate) } },
    ],
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  const conflict = await Booking.findOne(query);
  return !conflict;
}

/**
 * Create a new booking request (tenant).
 */
async function createBooking({ tenantId, propertyId, checkInDate, checkOutDate, numberOfGuests }) {
  const listing = await Listing.findById(propertyId).populate('owner');
  if (!listing) throw { statusCode: 404, message: 'Property not found' };

  // Business rules
  if (listing.owner._id.toString() === tenantId.toString()) {
    throw { statusCode: 400, message: 'You cannot book your own property' };
  }
  if (new Date(checkInDate) >= new Date(checkOutDate)) {
    throw { statusCode: 400, message: 'Check-out date must be after check-in date' };
  }
  if (new Date(checkInDate) < new Date()) {
    throw { statusCode: 400, message: 'Check-in date cannot be in the past' };
  }
  if (numberOfGuests > (listing.maxGuests || 1)) {
    throw { statusCode: 400, message: `This property allows max ${listing.maxGuests} guests` };
  }

  const available = await isPropertyAvailable(propertyId, checkInDate, checkOutDate);
  if (!available) {
    throw { statusCode: 409, message: 'Property is not available for selected dates' };
  }

  const { totalAmount } = calcTotalAmount(
    listing.price,
    listing.securityDeposit || 0,
    checkInDate,
    checkOutDate
  );

  const booking = await Booking.create({
    tenantId,
    ownerId: listing.owner._id,
    propertyId: listing._id,
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
    numberOfGuests,
    pricePerMonth: listing.price,
    securityDeposit: listing.securityDeposit || 0,
    totalAmount,
  });

  // Send notifications
  await notifSvc.notifyBookingSubmitted({ tenantId, ownerId: listing.owner._id, booking, listing });

  return booking;
}

/**
 * Owner accepts a booking.
 */
async function acceptBooking(bookingId, ownerId) {
  const booking = await Booking.findById(bookingId).populate('propertyId');
  if (!booking) throw { statusCode: 404, message: 'Booking not found' };
  if (booking.ownerId.toString() !== ownerId.toString()) {
    throw { statusCode: 403, message: 'Not authorized' };
  }
  if (booking.bookingStatus !== 'pending') {
    throw { statusCode: 400, message: `Cannot accept a booking with status "${booking.bookingStatus}"` };
  }

  booking.bookingStatus = 'accepted';
  await booking.save();

  await notifSvc.notifyBookingAccepted({
    tenantId: booking.tenantId, ownerId, booking, listing: booking.propertyId,
  });

  return booking;
}

/**
 * Owner rejects a booking.
 */
async function rejectBooking(bookingId, ownerId, note = '') {
  const booking = await Booking.findById(bookingId).populate('propertyId');
  if (!booking) throw { statusCode: 404, message: 'Booking not found' };
  if (booking.ownerId.toString() !== ownerId.toString()) {
    throw { statusCode: 403, message: 'Not authorized' };
  }
  if (booking.bookingStatus !== 'pending') {
    throw { statusCode: 400, message: `Cannot reject a booking with status "${booking.bookingStatus}"` };
  }

  booking.bookingStatus = 'rejected';
  booking.rejectionNote = note;
  await booking.save();

  await notifSvc.notifyBookingRejected({
    tenantId: booking.tenantId, ownerId, booking, listing: booking.propertyId, note,
  });

  return booking;
}

/**
 * Cancel a booking (tenant or owner).
 */
async function cancelBooking(bookingId, userId, role) {
  const booking = await Booking.findById(bookingId).populate('propertyId');
  if (!booking) throw { statusCode: 404, message: 'Booking not found' };

  const isTenant = booking.tenantId.toString() === userId.toString();
  const isOwner = booking.ownerId.toString() === userId.toString();
  const isAdmin = role === 'admin';

  if (!isTenant && !isOwner && !isAdmin) {
    throw { statusCode: 403, message: 'Not authorized to cancel this booking' };
  }
  if (['cancelled', 'completed', 'rejected'].includes(booking.bookingStatus)) {
    throw { statusCode: 400, message: `Booking is already ${booking.bookingStatus}` };
  }

  const cancelledBy = isTenant ? 'tenant' : isOwner ? 'owner' : 'admin';
  booking.bookingStatus = 'cancelled';
  booking.cancelledBy = cancelledBy;
  await booking.save();

  await notifSvc.notifyBookingCancelled({
    cancelledBy, tenantId: booking.tenantId, ownerId: booking.ownerId,
    booking, listing: booking.propertyId,
  });

  return booking;
}

/**
 * Get all bookings for a tenant.
 */
async function getTenantBookings(tenantId, { status, page = 1, limit = 10 } = {}) {
  const query = { tenantId };
  if (status) query.bookingStatus = status;
  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('propertyId', 'title image location price listingType')
      .populate('ownerId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(query),
  ]);
  return { bookings, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Get all bookings for an owner.
 */
async function getOwnerBookings(ownerId, { status, page = 1, limit = 10 } = {}) {
  const query = { ownerId };
  if (status) query.bookingStatus = status;
  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('propertyId', 'title image location price listingType')
      .populate('tenantId', 'username avatar email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(query),
  ]);
  return { bookings, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Admin: get all bookings.
 */
async function getAllBookings({ status, page = 1, limit = 20 } = {}) {
  const query = {};
  if (status) query.bookingStatus = status;
  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('propertyId', 'title location')
      .populate('tenantId', 'username email')
      .populate('ownerId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(query),
  ]);
  return { bookings, total, page, totalPages: Math.ceil(total / limit) };
}

module.exports = {
  createBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  getTenantBookings,
  getOwnerBookings,
  getAllBookings,
  isPropertyAvailable,
  calcTotalAmount,
};
