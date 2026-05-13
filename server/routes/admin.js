const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isLoggedIn, authorizeRoles } = require('../middlewares/auth');

router.use(isLoggedIn, authorizeRoles('admin'));

router.get('/unverified-owners', adminController.getUnverifiedOwners);
router.put('/verify-owner/:id', adminController.verifyOwner);
router.delete('/reject-owner/:id', adminController.rejectOwner);

module.exports = router;
