const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/subscriptionController');
const { isLoggedIn, authorizeRoles } = require('../middlewares/auth');

// Public — list plans
router.get('/plans', ctrl.getPlans);

// User routes
router.get('/my', isLoggedIn, ctrl.getMySubscription);
router.post('/order', isLoggedIn, ctrl.createSubscriptionOrder);
router.post('/verify', isLoggedIn, ctrl.verifySubscriptionPayment);
router.patch('/downgrade', isLoggedIn, ctrl.downgradeToFree);

// Admin routes
router.get('/all', isLoggedIn, authorizeRoles('admin'), ctrl.getAllSubscriptions);
router.get('/stats', isLoggedIn, authorizeRoles('admin'), ctrl.getSubscriptionStats);

module.exports = router;
