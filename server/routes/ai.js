const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/aiController');
const { isLoggedIn, authorizeRoles } = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

// AI-specific rate limiter — more restrictive
const aiLimiter = rateLimit({
  max: 20,
  windowMs: 10 * 60 * 1000,
  message: { success: false, message: 'Too many AI requests. Please wait.' },
});

// Public routes (guests can get recommendations & suggestions)
router.get('/recommendations', aiLimiter, ctrl.getRecommendations);
router.get('/suggestions',     aiLimiter, ctrl.getSearchSuggestions);
router.post('/chat',           aiLimiter, ctrl.chat);

// Protected routes
router.post('/generate-description', isLoggedIn, aiLimiter, ctrl.generateDescription);
router.get('/fraud/:id',             isLoggedIn, authorizeRoles('admin'), ctrl.analyzeFraud);

module.exports = router;
