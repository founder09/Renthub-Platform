const User = require('../models/User');
const ExpressError = require('../utils/ExpressError');

exports.getUnverifiedOwners = async (req, res, next) => {
  try {
    const owners = await User.find({ role: 'owner', isVerified: false }).select('-password');
    res.json({ success: true, owners });
  } catch (err) {
    next(err);
  }
};

exports.verifyOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const owner = await User.findById(id);
    if (!owner || owner.role !== 'owner') {
      return next(new ExpressError(404, 'Owner not found'));
    }
    owner.isVerified = true;
    await owner.save();
    res.json({ success: true, message: 'Owner verified successfully', owner });
  } catch (err) {
    next(err);
  }
};

exports.rejectOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const owner = await User.findById(id);
    if (!owner || owner.role !== 'owner') {
      return next(new ExpressError(404, 'Owner not found'));
    }
    // Delete the unverified owner
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'Owner rejected and account removed' });
  } catch (err) {
    next(err);
  }
};
