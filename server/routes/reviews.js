const express = require('express');
const router = express.Router({ mergeParams: true }); // inherit :id from parent
const reviewController = require('../controllers/reviewController');
const { isLoggedIn } = require('../middlewares/auth');
const { validateReview } = require('../middlewares/validate');

// POST   /api/listings/:id/reviews
router.post('/:id/reviews', isLoggedIn, validateReview, reviewController.createReview);

// DELETE /api/listings/:id/reviews/:reviewId
router.delete('/:id/reviews/:reviewId', isLoggedIn, reviewController.destroyReview);

module.exports = router;
