const express = require('express');
const router = express.Router();
const bookingCtrl = require('../controllers/bookingController');
const { isLoggedIn, authorizeRoles } = require('../middlewares/auth');

// ── Tenant routes ─────────────────────────────────────────────────────────────
router.post('/', isLoggedIn, authorizeRoles('tenant', 'user', 'admin'), bookingCtrl.createBooking);
router.get('/my', isLoggedIn, bookingCtrl.getMyBookings);
router.get('/owner', isLoggedIn, authorizeRoles('owner', 'admin'), bookingCtrl.getOwnerBookings);
router.get('/all', isLoggedIn, authorizeRoles('admin'), bookingCtrl.getAllBookings);
router.get('/:id', isLoggedIn, bookingCtrl.getBookingById);
router.patch('/:id/accept', isLoggedIn, authorizeRoles('owner', 'admin'), bookingCtrl.acceptBooking);
router.patch('/:id/reject', isLoggedIn, authorizeRoles('owner', 'admin'), bookingCtrl.rejectBooking);
router.patch('/:id/cancel', isLoggedIn, bookingCtrl.cancelBooking);

module.exports = router;
