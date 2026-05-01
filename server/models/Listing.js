const mongoose = require('mongoose');
const Review   = require('./Review');

const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title:       { type: String, required: true },
  description: String,

  // ── Images ────────────────────────────────────────────────────────────────
  image: {
    url:      String,
    filename: String,
  },
  // Extra room photos (up to 4 more)
  roomImages: [{
    url:      String,
    filename: String,
  }],

  // ── Pricing ───────────────────────────────────────────────────────────────
  price:         Number,
  securityDeposit: { type: Number, default: 0 },

  // ── Location ──────────────────────────────────────────────────────────────
  location:    String,
  country:     String,
  fullAddress: { type: String, default: '' }, // stored, never publicly shown

  // ── Property Details ──────────────────────────────────────────────────────
  listingType: {
    type:    String,
    enum:    ['Room', 'PG', 'Flat', 'Hostel', 'Studio'],
    default: 'Room',
  },
  bedrooms:  { type: Number, default: 1, min: 0 },
  bathrooms: { type: Number, default: 1, min: 0 },
  maxGuests: { type: Number, default: 1, min: 1 },
  floorSize: { type: Number, default: 0 }, // sq ft

  // ── Rules & Availability ──────────────────────────────────────────────────
  houseRules:    { type: [String], default: [] },
  availableFrom: { type: Date, default: null },

  // ── Amenities & Filters ───────────────────────────────────────────────────
  amenities: {
    type:    [String],
    default: [],
  },
  nearCollege: { type: String, default: '' },
  gender:      { type: String, enum: ['Any', 'Male', 'Female'], default: 'Any' },
  isFeatured:  { type: Boolean, default: false },
  viewCount:   { type: Number, default: 0 },

  // ── Private Owner Contact (never sent in public API responses) ────────────
  ownerContact: {
    name:  { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
  },

  // ── Relations ─────────────────────────────────────────────────────────────
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  owner:   { type: Schema.Types.ObjectId, ref: 'User' },

  geometry: {
    type:        { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
}, { timestamps: true });

// Cascade delete reviews when a listing is deleted
listingSchema.post('findOneAndDelete', async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model('Listing', listingSchema);
