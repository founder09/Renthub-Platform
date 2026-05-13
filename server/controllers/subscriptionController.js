const subSvc = require('../services/subscriptionService');
const { PLANS } = require('../models/Subscription');
const ExpressError = require('../utils/ExpressError');
const crypto = require('crypto');

// ── Get current user's subscription ──────────────────────────────────────────
exports.getMySubscription = async (req, res, next) => {
  try {
    const { subscription, plan, isActive } = await subSvc.getSubscriptionDetails(req.user._id);
    res.json({ success: true, data: { subscription, plan, isActive, allPlans: PLANS } });
  } catch (err) { next(err); }
};

// ── Get all plans (public) ────────────────────────────────────────────────────
exports.getPlans = async (req, res) => {
  res.json({ success: true, data: { plans: PLANS } });
};

// ── Create Razorpay order for subscription ────────────────────────────────────
exports.createSubscriptionOrder = async (req, res, next) => {
  try {
    const { planId } = req.body;
    if (!planId) return next(new ExpressError(400, 'planId is required'));
    const result = await subSvc.createSubscriptionOrder(req.user._id, planId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err.statusCode ? new ExpressError(err.statusCode, err.message) : err);
  }
};

// ── Verify subscription payment ───────────────────────────────────────────────
exports.verifySubscriptionPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !planId) {
      return next(new ExpressError(400, 'Missing required payment fields'));
    }
    const result = await subSvc.verifySubscriptionPayment({
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      userId: req.user._id, planId,
    });
    res.json({ success: true, message: `Upgraded to ${result.plan.name} plan!`, data: result });
  } catch (err) {
    next(err.statusCode ? new ExpressError(err.statusCode, err.message) : err);
  }
};

// ── Admin: get all subscriptions ──────────────────────────────────────────────
exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await subSvc.getAllSubscriptions({ page: Number(page) || 1, limit: Number(limit) || 20 });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ── Admin: subscription stats ─────────────────────────────────────────────────
exports.getSubscriptionStats = async (req, res, next) => {
  try {
    const stats = await subSvc.getSubscriptionStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

// ── Downgrade to free ─────────────────────────────────────────────────────────
exports.downgradeToFree = async (req, res, next) => {
  try {
    const sub = await subSvc.getOrCreateSubscription(req.user._id);
    sub.planId = 'free';
    sub.status = 'active';
    sub.endDate = null;
    sub.billingCycle = 'lifetime';
    sub.paymentStatus = 'unpaid';
    await sub.save();
    res.json({ success: true, message: 'Downgraded to Free plan', data: { plan: PLANS.free } });
  } catch (err) { next(err); }
};
