const jwt          = require('jsonwebtoken');
const User         = require('../models/User');
const ExpressError = require('../utils/ExpressError');

/**
 * Protects routes — verifies the JWT from cookie or Authorization header.
 * Attaches the full user document (minus password) to req.user.
 */
exports.isLoggedIn = async (req, res, next) => {
  try {
    // Accept token from httpOnly cookie OR Bearer header
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return next(new ExpressError(401, 'Please login to continue'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new ExpressError(401, 'User no longer exists'));
    }
    next();
  } catch (err) {
    next(new ExpressError(401, 'Session expired — please login again'));
  }
};

/**
 * Grant access to specific roles.
 * Usage: authorizeRoles('admin', 'owner')
 */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ExpressError(401, 'Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ExpressError(403, `Role (${req.user.role}) is not allowed to access this resource.`));
    }
    next();
  };
};
