const Review       = require('../models/Review');
const Listing      = require('../models/Listing');
const ExpressError = require('../utils/ExpressError');

/** POST /api/listings/:id/reviews */
exports.createReview = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(new ExpressError(404, 'Listing not found'));

    const review = new Review({
      ...req.body,
      author: req.user._id,
    });

    listing.reviews.push(review._id);
    await review.save();
    await listing.save();

    await review.populate('author', 'username');

    res.status(201).json({ success: true, message: 'Review added', data: review });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/listings/:id/reviews/:reviewId */
exports.destroyReview = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) return next(new ExpressError(404, 'Review not found'));

    // Only the review author can delete it
    if (!review.author.equals(req.user._id)) {
      return next(new ExpressError(403, 'You did not write this review'));
    }

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
