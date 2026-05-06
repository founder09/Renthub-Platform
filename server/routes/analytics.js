const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/analyticsController');
const { isLoggedIn, authorizeRoles } = require('../middlewares/auth');

router.get('/owner',  isLoggedIn, authorizeRoles('owner', 'admin'), ctrl.getOwnerAnalytics);
router.get('/tenant', isLoggedIn, ctrl.getTenantAnalytics);
router.get('/admin',  isLoggedIn, authorizeRoles('admin'), ctrl.getAdminAnalytics);
router.post('/cache/invalidate', isLoggedIn, authorizeRoles('admin'), ctrl.invalidateCache);

module.exports = router;
