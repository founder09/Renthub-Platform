/**
 * Subscription Middleware — Feature Gating
 *
 * requireSubscription('pro')    → needs at least Pro plan
 * requireFeature('aiFeatures')  → needs feature flag enabled
 * checkListingLimit             → prevents free users exceeding 2 listings
 */
const { getOrCreateSubscription } = require('../services/subscriptionService');
const { PLANS }   = require('../models/Subscription');
const ExpressError = require('../utils/ExpressError');

const PLAN_HIERARCHY = { free: 0, pro: 1, business: 2 };

/**
 * Require at least a certain plan tier.
 * @param {'pro'|'business'} minPlan
 */
exports.requireSubscription = (minPlan) => async (req, res, next) => {
  try {
    const sub  = await getOrCreateSubscription(req.user._id);
    const plan = PLANS[sub.planId] || PLANS.free;

    if (!sub.isActive()) {
      return next(new ExpressError(403, 'Your subscription has expired. Please renew to continue.'));
    }

    const userLevel = PLAN_HIERARCHY[sub.planId] || 0;
    const minLevel  = PLAN_HIERARCHY[minPlan]    || 1;

    if (userLevel < minLevel) {
      return next(new ExpressError(403, `This feature requires the ${PLANS[minPlan]?.name || minPlan} plan. Please upgrade.`));
    }

    req.subscription = sub;
    req.plan         = plan;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Require a specific feature flag (e.g. 'aiFeatures', 'featuredListings').
 */
exports.requireFeature = (feature) => async (req, res, next) => {
  try {
    const sub  = await getOrCreateSubscription(req.user._id);
    const plan = PLANS[sub.planId] || PLANS.free;

    if (!plan.features[feature]) {
      return next(new ExpressError(403, `Feature "${feature}" is not available on your current plan. Please upgrade to Pro or Business.`));
    }

    req.subscription = sub;
    req.plan         = plan;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Check if user can create a new listing.
 * Attaches { canCreate, remaining } to req for use in controller.
 */
exports.checkListingLimit = async (req, res, next) => {
  try {
    const { canCreateListing } = require('../services/subscriptionService');
    const result = await canCreateListing(req.user._id);

    if (!result.allowed) {
      return res.status(403).json({
        success:     false,
        message:     result.message,
        currentPlan: result.currentPlan,
        upgradeUrl:  '/pricing',
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Attach subscription info to req without blocking.
 * Useful for analytics/UI hints.
 */
exports.attachSubscription = async (req, res, next) => {
  try {
    if (req.user) {
      const sub    = await getOrCreateSubscription(req.user._id);
      req.subscription = sub;
      req.plan         = PLANS[sub.planId] || PLANS.free;
    }
    next();
  } catch {
    next();
  }
};
