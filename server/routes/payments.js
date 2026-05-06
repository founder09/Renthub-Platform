const express = require('express');
const router  = express.Router();
const paymentCtrl = require('../controllers/paymentController');
const { isLoggedIn } = require('../middlewares/auth');

router.get('/key',    isLoggedIn, paymentCtrl.getPaymentKey);
router.post('/order', isLoggedIn, paymentCtrl.createOrder);
router.post('/verify',isLoggedIn, paymentCtrl.verifyPayment);

module.exports = router;
