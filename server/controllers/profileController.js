const User = require('../models/User');
const Listing = require('../models/Listing');
const ExpressError = require('../utils/ExpressError');

/** GET /api/profile/me */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('savedListings', 'title image price location country listingType');

    const myListings = await Listing.find({ owner: req.user._id })
      .select('title image price location country listingType viewCount reviews createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { ...user.toObject(), myListings },
    });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/profile/me */
exports.updateProfile = async (req, res, next) => {
  try {
    const { phone, college, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { phone, college, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) {
    next(err);
  }
};

/** POST /api/profile/save/:listingId — toggle saved listing */
exports.toggleSave = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const lid = req.params.listingId;

    const idx = user.savedListings.findIndex(id => id.toString() === lid);
    if (idx > -1) {
      user.savedListings.splice(idx, 1);
    } else {
      user.savedListings.push(lid);
    }
    await user.save();

    res.json({ success: true, saved: idx === -1, savedListings: user.savedListings });
  } catch (err) {
    next(err);
  }
};
