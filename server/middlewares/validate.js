const { listingSchema, reviewSchema } = require('../Schema');
const ExpressError = require('../utils/ExpressError');

/**
 * Validates req.body against the listing Joi schema.
 */
exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(', ');
    return next(new ExpressError(400, msg));
  }
  next();
};

/**
 * Validates req.body against the review Joi schema.
 */
exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(', ');
    return next(new ExpressError(400, msg));
  }
  next();
};
