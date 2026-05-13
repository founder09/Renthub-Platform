const bookingService = require('../services/bookingService');
const ExpressError = require('../utils/ExpressError');

// ── Create Booking (Tenant) ───────────────────────────────────────────────────
exports.createBooking = async (req, res, next) => {
  try {
    const { propertyId, checkInDate, checkOutDate, numberOfGuests } = req.body;
    const booking = await bookingService.createBooking({
      tenantId: req.user._id,
      propertyId,
      checkInDate,
      checkOutDate,
      numberOfGuests: Number(numberOfGuests),
    });
    res.status(201).json({ success: true, message: 'Booking request submitted', data: booking });
  } catch (err) {
    next(err.statusCode ? new ExpressError(err.statusCode, err.message) : err);
  }
};

// ── Get Tenant's Bookings ─────────────────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await bookingService.getTenantBookings(req.user._id, {
      status, page: Number(page) || 1, limit: Number(limit) || 10,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ── Get Owner's Bookings ──────────────────────────────────────────────────────
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await bookingService.getOwnerBookings(req.user._id, {
      status, page: Number(page) || 1, limit: Number(limit) || 10,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Get All Bookings ───────────────────────────────────────────────────
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await bookingService.getAllBookings({
      status, page: Number(page) || 1, limit: Number(limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ── Get Single Booking ────────────────────────────────────────────────────────
exports.getBookingById = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(req.params.id)
      .populate('propertyId', 'title image location price listingType securityDeposit')
      .populate('tenantId', 'username avatar email phone')
      .populate('ownerId', 'username avatar email phone');
    if (!booking) return next(new ExpressError(404, 'Booking not found'));

    // Only allow owner, tenant, or admin
    const uid = req.user._id.toString();
    if (
      booking.tenantId._id.toString() !== uid &&
      booking.ownerId._id.toString() !== uid &&
      req.user.role !== 'admin'
    ) {
      return next(new ExpressError(403, 'Not authorized'));
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// ── Accept Booking (Owner) ────────────────────────────────────────────────────
exports.acceptBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.acceptBooking(req.params.id, req.user._id);
    res.json({ success: true, message: 'Booking accepted', data: booking });
  } catch (err) {
    next(err.statusCode ? new ExpressError(err.statusCode, err.message) : err);
  }
};

// ── Reject Booking (Owner) ────────────────────────────────────────────────────
exports.rejectBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.rejectBooking(req.params.id, req.user._id, req.body.note || '');
    res.json({ success: true, message: 'Booking rejected', data: booking });
  } catch (err) {
    next(err.statusCode ? new ExpressError(err.statusCode, err.message) : err);
  }
};

// ── Cancel Booking ────────────────────────────────────────────────────────────
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user._id, req.user.role);
    res.json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (err) {
    next(err.statusCode ? new ExpressError(err.statusCode, err.message) : err);
  }
};
