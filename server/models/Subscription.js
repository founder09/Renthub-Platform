const mongoose = require('mongoose');

/**
 * Subscription Plans — single source of truth.
 * Stored in-memory as a constant; no separate Plan collection needed.
 */
const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    billingCycle: 'lifetime',
    features: {
      maxListings: 2,
      analyticsAccess: 'basic',
      bookingManagement: 'basic',
      aiFeatures: false,
      featuredListings: false,
      prioritySupport: false,
      teamManagement: false,
    },
    badge: null,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 999,          // ₹999/month
    billingCycle: 'monthly',
    features: {
      maxListings: -1,   // unlimited
      analyticsAccess: 'advanced',
      bookingManagement: 'advanced',
      aiFeatures: true,
      featuredListings: true,
      prioritySupport: true,
      teamManagement: false,
    },
    badge: 'PRO',
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 2999,
    billingCycle: 'monthly',
    features: {
      maxListings: -1,
      analyticsAccess: 'enterprise',
      bookingManagement: 'advanced',
      aiFeatures: true,
      featuredListings: true,
      prioritySupport: true,
      teamManagement: true,
    },
    badge: 'BUSINESS',
  },
};

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  planId: { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
  status: { type: String, enum: ['active', 'expired', 'cancelled', 'trial'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },   // null = lifetime (free)
  billingCycle: { type: String, enum: ['monthly', 'yearly', 'lifetime'], default: 'lifetime' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  // Razorpay references
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  transactionId: { type: String, default: null },
  // Usage tracking
  listingsCount: { type: Number, default: 0 },
}, { timestamps: true });

// ── Helper: is the subscription currently active? ─────────────────────────────
subscriptionSchema.methods.isActive = function () {
  if (this.status !== 'active' && this.status !== 'trial') return false;
  if (!this.endDate) return true;                 // lifetime (free)
  return new Date() < new Date(this.endDate);
};

// ── Helper: get the resolved plan object ──────────────────────────────────────
subscriptionSchema.methods.getPlan = function () {
  return PLANS[this.planId] || PLANS.free;
};

subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
module.exports.PLANS = PLANS;
