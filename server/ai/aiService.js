/**
 * AI Service — Smart property recommendations, description generation, fraud detection.
 *
 * Uses Google Gemini (if GEMINI_API_KEY is set) for description generation.
 * Recommendation engine is rule-based + scoring (no LLM needed).
 * All LLM calls are gracefully skipped if API key is missing.
 */
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const cache = require('../cache/cacheClient');

// ── Gemini client (lazy init) ─────────────────────────────────────────────────
let genAI = null;

function getGenAI() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAI) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

// ── 1. SMART PROPERTY RECOMMENDATIONS ────────────────────────────────────────

/**
 * Score-based recommendation engine.
 * Factors: price match, location match, amenities overlap, college proximity, rating.
 */
async function getSmartRecommendations({ userId, budget, location, amenities = [], college, listingType, limit = 6 }) {
  const cacheKey = `recommendations:${userId || 'guest'}:${budget}:${location}:${college}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  // Build a loose filter
  const filter = {};
  if (listingType) filter.listingType = listingType;
  if (budget) filter.price = { $lte: Number(budget) * 1.3 }; // 30% buffer

  const listings = await Listing.find(filter)
    .populate('owner', 'username isVerified avatar')
    .populate({ path: 'reviews', select: 'rating' })
    .limit(100)
    .lean();

  // Scoring
  const scored = listings.map(l => {
    let score = 0;

    // Budget match (higher score if within budget)
    if (budget) {
      if (l.price <= Number(budget)) score += 30;
      else if (l.price <= Number(budget) * 1.15) score += 15;
    }

    // Location match
    if (location && l.location.toLowerCase().includes(location.toLowerCase())) score += 25;

    // College match
    if (college && l.nearCollege === college) score += 20;

    // Amenities overlap
    if (amenities.length > 0 && l.amenities) {
      const overlap = amenities.filter(a => l.amenities.includes(a)).length;
      score += Math.min(overlap * 5, 20);
    }

    // Rating boost
    const avgRating = l.reviews?.length
      ? l.reviews.reduce((s, r) => s + r.rating, 0) / l.reviews.length
      : 0;
    score += avgRating * 3;

    // Featured boost
    if (l.isFeatured) score += 5;

    // View count signal
    score += Math.min(l.viewCount / 100, 5);

    return { ...l, _score: score, avgRating: avgRating.toFixed(1) };
  });

  const recommendations = scored
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...rest }) => rest);

  await cache.set(cacheKey, recommendations, 3 * 60); // 3 min
  return recommendations;
}

// ── 2. AI DESCRIPTION GENERATOR ──────────────────────────────────────────────

const DESCRIPTION_PROMPT_TEMPLATE = (property) => `
You are a professional real estate copywriter specializing in student accommodation in India.
Write a compelling, SEO-friendly property description for the following accommodation.
Make it warm, trustworthy, and persuasive. Use clear paragraphs. Max 180 words.

Property Details:
- Title: ${property.title}
- Type: ${property.listingType}
- Location: ${property.location}, ${property.country}
- Near College: ${property.nearCollege || 'N/A'}
- Price: ₹${property.price}/month
- Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}
- Max Guests: ${property.maxGuests}
- Gender Preference: ${property.gender}
- Amenities: ${(property.amenities || []).join(', ') || 'Basic amenities'}
- Security Deposit: ₹${property.securityDeposit || 0}

Generate a professional description that highlights the best features and appeals to students.
Do NOT include the price, address, or contact details in the description.
`.trim();

async function generatePropertyDescription(propertyDetails) {
  const ai = getGenAI();

  // Fallback: rule-based description if no API key
  if (!ai) {
    return generateRuleBasedDescription(propertyDetails);
  }

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = DESCRIPTION_PROMPT_TEMPLATE(propertyDetails);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return { description: text, aiGenerated: true, model: 'gemini-1.5-flash' };
  } catch (err) {
    console.error('[AI] Description generation failed:', err.message);
    return generateRuleBasedDescription(propertyDetails);
  }
}

function generateRuleBasedDescription({ title, listingType, location, nearCollege, amenities = [], price, bedrooms, bathrooms, gender }) {
  const amenityList = amenities.slice(0, 4).join(', ');
  const genderNote = gender && gender !== 'Any' ? `Exclusively for ${gender.toLowerCase()} students.` : 'Open to all students.';
  const collegeNote = nearCollege ? `Conveniently located near ${nearCollege}.` : '';

  const desc = `Welcome to ${title}, a well-maintained ${listingType.toLowerCase()} in ${location}. ${collegeNote} This comfortable space offers ${bedrooms} bedroom(s) and ${bathrooms} bathroom(s), perfect for students seeking a peaceful and productive living environment.

${amenityList ? `Key amenities include ${amenityList}, ensuring a comfortable stay.` : ''} ${genderNote}

Priced affordably at ₹${price?.toLocaleString('en-IN')}/month, this property offers excellent value. The space is maintained in great condition and offers a safe, secure environment for students. Book now to secure your spot!`;

  return { description: desc.trim(), aiGenerated: false, model: 'rule-based' };
}

// ── 3. SMART SEARCH SUGGESTIONS ──────────────────────────────────────────────

async function getSearchSuggestions(query) {
  if (!query || query.length < 2) return [];

  const cacheKey = `suggestions:${query.toLowerCase()}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const regex = new RegExp(query, 'i');
  const listings = await Listing.find({
    $or: [{ title: regex }, { location: regex }, { nearCollege: regex }],
  })
    .select('title location nearCollege listingType')
    .limit(8)
    .lean();

  const suggestions = listings.map(l => ({
    id: l._id,
    label: l.title,
    sub: `${l.location} · ${l.listingType}`,
    type: 'listing',
  }));

  await cache.set(cacheKey, suggestions, 60); // 1 min
  return suggestions;
}

// ── 4. FRAUD DETECTION (rule-based) ──────────────────────────────────────────

async function analyzeListingForFraud(listing) {
  const flags = [];
  const reasons = [];

  // Suspiciously low price
  if (listing.price < 1000) {
    flags.push('suspicious_price');
    reasons.push('Price below ₹1,000 — unusually low');
  }

  // No description
  if (!listing.description || listing.description.length < 30) {
    flags.push('missing_description');
    reasons.push('No or very short description');
  }

  // Check for duplicate title from same owner
  const duplicates = await Listing.countDocuments({
    owner: listing.owner,
    title: listing.title,
    _id: { $ne: listing._id },
  });
  if (duplicates > 0) {
    flags.push('duplicate_listing');
    reasons.push('Duplicate title from the same owner');
  }

  return {
    isFlagged: flags.length > 0,
    flags,
    reasons,
    riskScore: flags.length * 33, // 0-99
  };
}

// ── 5. CHAT ASSISTANT PLACEHOLDER ────────────────────────────────────────────

async function chatAssistant(message, context = {}) {
  // Placeholder — architecture ready for LLM injection
  const responses = {
    greeting: 'Hi! I\'m RentHub AI. I can help you find accommodation, understand booking processes, and recommend properties.',
    pricing: 'Our properties range from ₹3,000 to ₹25,000/month depending on location and type.',
    booking: 'To book a property: click "Reserve", select your dates, and submit. The owner will accept within 24 hours.',
    recommendation: 'Tell me your budget and preferred location, and I\'ll suggest the best properties for you!',
    default: 'I\'m here to help! Ask me about properties, bookings, or pricing.',
  };

  const lower = message.toLowerCase();
  let reply = responses.default;

  if (lower.match(/hello|hi|hey/)) reply = responses.greeting;
  else if (lower.match(/price|cost|rent|budget/)) reply = responses.pricing;
  else if (lower.match(/book|reserve|stay/)) reply = responses.booking;
  else if (lower.match(/recommend|suggest|find|search/)) reply = responses.recommendation;

  return {
    message: reply,
    model: 'rule-based-v1',
    note: 'Full LLM integration ready via GEMINI_API_KEY',
  };
}

module.exports = {
  getSmartRecommendations,
  generatePropertyDescription,
  getSearchSuggestions,
  analyzeListingForFraud,
  chatAssistant,
};
