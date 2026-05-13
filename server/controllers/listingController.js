const Listing = require('../models/Listing');
const ExpressError = require('../utils/ExpressError');
const { cloudinary, uploadToCloudinary } = require('../config/cloudConfig');
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mongoose = require('mongoose');

const geocodingClient = mbxGeoCoding({ accessToken: process.env.MAP_TOKEN });

// ─── Private fields stripped from public responses ────────────────────────────
// ownerContact and fullAddress are NEVER returned in public listing queries.
const PRIVATE_FIELDS = '-ownerContact -fullAddress';

/** GET /api/listings — Advanced Search with pagination, sorting & filters */
exports.index = async (req, res, next) => {
  try {
    const {
      search, country, nearCollege, listingType, gender,
      minPrice, maxPrice, amenities, sort,
      page = 1, limit = 12,
    } = req.query;

    const filter = {};

    // Text search — title or location
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (country) filter.country = { $regex: country, $options: 'i' };
    if (nearCollege) filter.nearCollege = nearCollege;
    if (listingType) filter.listingType = listingType;
    if (gender && gender !== 'Any') filter.gender = gender;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Amenities — comma-separated list; property must contain ALL selected
    if (amenities) {
      const arr = amenities.split(',').map(a => a.trim()).filter(Boolean);
      if (arr.length) filter.amenities = { $all: arr };
    }

    // Sort options
    const SORT_MAP = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      top_rated: { 'reviews.length': -1, viewCount: -1 },
    };
    const sortOption = SORT_MAP[sort] || SORT_MAP.newest;

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .select(PRIVATE_FIELDS)
        .populate('owner', 'username isVerified avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Listing.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        listings,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/listings/:id  — public show, strips private contact */
exports.show = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ExpressError(400, 'Invalid listing ID'));
    }

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .select(PRIVATE_FIELDS)                                          // ← strips ownerContact & fullAddress
      .populate({ path: 'reviews', populate: { path: 'author', select: 'username isVerified avatar' } })
      .populate('owner', 'username isVerified avatar college');

    if (!listing) return next(new ExpressError(404, 'Listing not found'));
    res.json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
};

/** GET /api/listings/:id/private  — owner-only, returns full contact info */
exports.showPrivate = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ExpressError(400, 'Invalid listing ID'));
    }

    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'username isVerified avatar college');

    if (!listing) return next(new ExpressError(404, 'Listing not found'));

    // Only the owner can see private contact details
    if (!listing.owner._id.equals(req.user._id)) {
      return next(new ExpressError(403, 'Access denied'));
    }

    res.json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
};

/** POST /api/listings */
exports.create = async (req, res, next) => {
  try {
    if (req.user.role === 'owner' && !req.user.isVerified) {
      return next(new ExpressError(403, 'Your account is pending verification by an admin. You cannot create listings yet.'));
    }

    // ── Subscription gating: check listing limit ───────────────────────────
    const { canCreateListing } = require('../services/subscriptionService');
    const limitCheck = await canCreateListing(req.user._id);
    if (!limitCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: limitCheck.message,
        currentPlan: limitCheck.currentPlan,
        upgradeUrl: '/dashboard/subscription',
      });
    }
    // ──────────────────────────────────────────────────────────────────────

    const geoResponse = await geocodingClient
      .forwardGeocode({ query: req.body.location, limit: 1 })
      .send();

    const geometry = geoResponse.body.features[0]?.geometry;
    if (!geometry) return next(new ExpressError(400, 'Location not found on map'));

    // Parse amenities
    let amenities = req.body.amenities || [];
    if (typeof amenities === 'string') amenities = amenities.split(',').filter(Boolean);

    // Parse houseRules
    let houseRules = req.body.houseRules || [];
    if (typeof houseRules === 'string') houseRules = houseRules.split(',').filter(Boolean);

    // Build ownerContact from body
    const ownerContact = {
      name: req.body.contactName || '',
      phone: req.body.contactPhone || '',
      email: req.body.contactEmail || '',
      whatsapp: req.body.contactWhatsapp || '',
    };

    const listing = new Listing({
      ...req.body,
      amenities,
      houseRules,
      ownerContact,
      owner: req.user._id,
      geometry,
    });

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(f => uploadToCloudinary(f.buffer));
      const results = await Promise.all(uploadPromises);
      listing.image = { url: results[0].secure_url, filename: results[0].public_id };
      listing.roomImages = results.slice(1).map(r => ({ url: r.secure_url, filename: r.public_id }));
    }

    await listing.save();
    res.status(201).json({ success: true, message: 'Listing created', data: listing });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/listings/:id */
exports.update = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ExpressError(400, 'Invalid listing ID'));
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(new ExpressError(404, 'Listing not found'));

    if (!listing.owner.equals(req.user._id)) {
      return next(new ExpressError(403, 'You are not the owner of this listing'));
    }

    let amenities = req.body.amenities || listing.amenities;
    if (typeof amenities === 'string') amenities = amenities.split(',').filter(Boolean);

    let houseRules = req.body.houseRules || listing.houseRules;
    if (typeof houseRules === 'string') houseRules = houseRules.split(',').filter(Boolean);

    // Merge ownerContact
    const ownerContact = {
      name: req.body.contactName || listing.ownerContact?.name || '',
      phone: req.body.contactPhone || listing.ownerContact?.phone || '',
      email: req.body.contactEmail || listing.ownerContact?.email || '',
      whatsapp: req.body.contactWhatsapp || listing.ownerContact?.whatsapp || '',
    };

    Object.assign(listing, { ...req.body, amenities, houseRules, ownerContact });

    if (req.body.location) {
      const geoResponse = await geocodingClient
        .forwardGeocode({ query: req.body.location, limit: 1 })
        .send();
      listing.geometry = geoResponse.body.features[0]?.geometry || listing.geometry;
    }

    if (req.files && req.files.length > 0) {
      if (listing.image?.filename) await cloudinary.uploader.destroy(listing.image.filename);
      if (listing.roomImages?.length) {
        await Promise.all(listing.roomImages.map(img => cloudinary.uploader.destroy(img.filename)));
      }

      const uploadPromises = req.files.map(f => uploadToCloudinary(f.buffer));
      const results = await Promise.all(uploadPromises);

      listing.image = { url: results[0].secure_url, filename: results[0].public_id };
      listing.roomImages = results.slice(1).map(r => ({ url: r.secure_url, filename: r.public_id }));
    }

    await listing.save();
    res.json({ success: true, message: 'Listing updated', data: listing });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/listings/:id */
exports.destroy = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ExpressError(400, 'Invalid listing ID'));
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(new ExpressError(404, 'Listing not found'));

    if (!listing.owner.equals(req.user._id)) {
      return next(new ExpressError(403, 'You are not the owner of this listing'));
    }

    if (listing.image?.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }
    if (listing.roomImages?.length) {
      await Promise.all(listing.roomImages.map(img => cloudinary.uploader.destroy(img.filename)));
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
};
