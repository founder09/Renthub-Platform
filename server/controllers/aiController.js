const aiSvc        = require('../ai/aiService');
const ExpressError = require('../utils/ExpressError');

// ── Smart Recommendations ─────────────────────────────────────────────────────
exports.getRecommendations = async (req, res, next) => {
  try {
    const { budget, location, amenities, college, listingType, limit } = req.query;
    const amenityArr = amenities ? amenities.split(',').map(a => a.trim()).filter(Boolean) : [];

    const recommendations = await aiSvc.getSmartRecommendations({
      userId:      req.user?._id,
      budget,
      location,
      amenities:   amenityArr,
      college,
      listingType,
      limit:       Number(limit) || 6,
    });

    res.json({ success: true, data: recommendations, engine: 'RentHub AI v1' });
  } catch (err) { next(err); }
};

// ── AI Description Generator ──────────────────────────────────────────────────
exports.generateDescription = async (req, res, next) => {
  try {
    const propertyDetails = req.body;
    if (!propertyDetails.title) return next(new ExpressError(400, 'title is required'));

    const result = await aiSvc.generatePropertyDescription(propertyDetails);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ── Search Suggestions ────────────────────────────────────────────────────────
exports.getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    const suggestions = await aiSvc.getSearchSuggestions(q);
    res.json({ success: true, data: suggestions });
  } catch (err) { next(err); }
};

// ── Fraud Analysis ────────────────────────────────────────────────────────────
exports.analyzeFraud = async (req, res, next) => {
  try {
    const Listing = require('../models/Listing');
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(new ExpressError(404, 'Listing not found'));

    const result = await aiSvc.analyzeListingForFraud(listing);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ── Chat Assistant ────────────────────────────────────────────────────────────
exports.chat = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    if (!message) return next(new ExpressError(400, 'message is required'));
    const reply = await aiSvc.chatAssistant(message, context);
    res.json({ success: true, data: reply });
  } catch (err) { next(err); }
};
