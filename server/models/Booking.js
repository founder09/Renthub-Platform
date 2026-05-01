const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => `BKG-${nanoid(8).toUpperCase()}`,
  },

  // ── Relations ─────────────────────────────────────────────────────────────
  tenantId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },

  // ── Dates ─────────────────────────────────────────────────────────────────
  checkInDate:  { type: Date, required: true },
  checkOutDate: { type: Date, required: true },

  // ── Guests ────────────────────────────────────────────────────────────────
  numberOfGuests: { type: Number, required: true, min: 1 },

  // ── Pricing ───────────────────────────────────────────────────────────────
  pricePerMonth:   { type: Number, required: true },
  securityDeposit: { type: Number, default: 0 },
  totalAmount:     { type: Number, required: true }, // pricePerMonth * months + securityDeposit

  // ── Status ────────────────────────────────────────────────────────────────
  bookingStatus: {
    type:    String,
    enum:    ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type:    String,
    enum:    ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },

  // ── Payment ───────────────────────────────────────────────────────────────
  razorpayOrderId:   { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
  transactionId:     { type: String, default: null }, // alias / display id

  // ── Cancellation ──────────────────────────────────────────────────────────
  cancelledBy:     { type: String, enum: ['tenant', 'owner', 'admin'], default: null },
  cancellationNote: { type: String, default: '' },

  // ── Rejection ─────────────────────────────────────────────────────────────
  rejectionNote: { type: String, default: '' },
}, { timestamps: true });

// ── Indexes for query performance ─────────────────────────────────────────────
bookingSchema.index({ tenantId: 1 });
bookingSchema.index({ ownerId: 1 });
bookingSchema.index({ propertyId: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
