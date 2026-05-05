const Subscription = require('../models/Subscription');
const { PLANS }    = require('../models/Subscription');
const Razorpay     = require('razorpay');
const crypto       = require('crypto');
const notifSvc     = require('./notificationService');
const cache        = require('../cache/cacheClient');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
});

/**
 * Get or create a subscription for a user.
 * New users always start on the free plan.
 */
async function getOrCreateSubscription(userId) {
  let sub = await Subscription.findOne({ userId });
  if (!sub) {
    sub = await Subscription.create({ userId, planId: 'free', status: 'active' });
  }
  return sub;
}

/**
 * Get subscription with plan details (enriched).
 */
async function getSubscriptionDetails(userId) {
  const sub  = await getOrCreateSubscription(userId);
  const plan = PLANS[sub.planId] || PLANS.free;
  return { subscription: sub, plan, isActive: sub.isActive() };
}

/**
 * Create a Razorpay order for a subscription upgrade.
 */
async function createSubscriptionOrder(userId, planId) {
  const plan = PLANS[planId];
  if (!plan) throw { statusCode: 400, message: 'Invalid plan' };
  if (plan.price === 0) throw { statusCode: 400, message: 'Free plan does not require payment' };

  const sub = await getOrCreateSubscription(userId);
  if (sub.planId === planId && sub.isActive()) {
    throw { statusCode: 400, message: `Already on ${plan.name} plan` };
  }

  const order = await razorpay.orders.create({
    amount:   plan.price * 100, // paise
    currency: 'INR',
    receipt:  `SUB-${userId}-${planId}-${Date.now()}`,
    notes:    { userId: userId.toString(), planId },
  });

  // Temporarily store planId on sub for verification
  sub.razorpayOrderId = order.id;
  await sub.save();

  return { order, plan, keyId: process.env.RAZORPAY_KEY_ID };
}

/**
 * Verify subscription payment and activate plan.
 */
async function verifySubscriptionPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, planId }) {
  // Signature check
  const body     = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy')
    .update(body)
    .digest('hex');

  if (expected !== razorpaySignature) {
    throw { statusCode: 400, message: 'Subscription payment verification failed' };
  }

  const plan  = PLANS[planId];
  const sub   = await getOrCreateSubscription(userId);

  // Calculate end date
  const now = new Date();
  let endDate = null;
  if (plan.billingCycle === 'monthly') {
    endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (plan.billingCycle === 'yearly') {
    endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  sub.planId            = planId;
  sub.status            = 'active';
  sub.startDate         = now;
  sub.endDate           = endDate;
  sub.billingCycle      = plan.billingCycle;
  sub.paymentStatus     = 'paid';
  sub.razorpayOrderId   = razorpayOrderId;
  sub.razorpayPaymentId = razorpayPaymentId;
  sub.transactionId     = razorpayPaymentId;
  await sub.save();

  // Clear subscription cache
  await cache.del(`subscription:${userId}`);

  // Notify
  try {
    await notifSvc.createNotification({
      recipientId: userId,
      type:        'PAYMENT_SUCCESS',
      title:       `🎉 Welcome to ${plan.name} Plan!`,
      message:     `Your subscription to ${plan.name} has been activated. Enjoy premium features!`,
      actionUrl:   '/dashboard/subscription',
    });
  } catch { /* non-blocking */ }

  return { subscription: sub, plan };
}

/**
 * Check if user can create a new listing (enforces free plan limit).
 */
async function canCreateListing(userId) {
  const sub  = await getOrCreateSubscription(userId);
  const plan = PLANS[sub.planId] || PLANS.free;

  if (plan.features.maxListings === -1) return { allowed: true };

  const Listing = require('../models/Listing');
  const count   = await Listing.countDocuments({ owner: userId });
  if (count >= plan.features.maxListings) {
    return {
      allowed: false,
      message: `Free plan allows maximum ${plan.features.maxListings} listings. Upgrade to Pro for unlimited listings.`,
      currentPlan: plan.id,
    };
  }
  return { allowed: true };
}

/**
 * Get all subscriptions (admin).
 */
async function getAllSubscriptions({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [subs, total] = await Promise.all([
    Subscription.find()
      .populate('userId', 'username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Subscription.countDocuments(),
  ]);

  // Enrich with plan info
  const data = subs.map(s => ({
    ...s.toObject(),
    plan: PLANS[s.planId] || PLANS.free,
    isActive: s.isActive(),
  }));

  return { subscriptions: data, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Admin stats for subscription analytics.
 */
async function getSubscriptionStats() {
  const [planCounts, revenueAgg] = await Promise.all([
    Subscription.aggregate([
      { $group: { _id: '$planId', count: { $sum: 1 } } },
    ]),
    Subscription.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$planId', count: { $sum: 1 } } },
    ]),
  ]);

  const byPlan = {};
  planCounts.forEach(p => { byPlan[p._id] = p.count; });

  const MRR = revenueAgg.reduce((acc, p) => {
    const plan = PLANS[p._id];
    if (plan) acc += plan.price * p.count;
    return acc;
  }, 0);

  return {
    planDistribution: byPlan,
    totalSubscribers: await Subscription.countDocuments({ status: 'active' }),
    paidSubscribers:  await Subscription.countDocuments({ paymentStatus: 'paid' }),
    mrrEstimate:      MRR,
  };
}

module.exports = {
  getOrCreateSubscription,
  getSubscriptionDetails,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  canCreateListing,
  getAllSubscriptions,
  getSubscriptionStats,
};
