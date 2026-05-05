const analyticsSvc = require('../analytics/analyticsService');
const ExpressError = require('../utils/ExpressError');

// ── Owner analytics ───────────────────────────────────────────────────────────
exports.getOwnerAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsSvc.getOwnerAnalytics(req.user._id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── Tenant analytics ──────────────────────────────────────────────────────────
exports.getTenantAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsSvc.getTenantAnalytics(req.user._id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── Admin analytics ───────────────────────────────────────────────────────────
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsSvc.getAdminAnalytics();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── Invalidate analytics cache ────────────────────────────────────────────────
exports.invalidateCache = async (req, res, next) => {
  try {
    const cache = require('../cache/cacheClient');
    await cache.delPattern('analytics:*');
    res.json({ success: true, message: 'Analytics cache cleared' });
  } catch (err) { next(err); }
};
