const paymentService = require('../services/paymentService');
const ExpressError   = require('../utils/ExpressError');

// ── Create Razorpay Order ─────────────────────────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return next(new ExpressError(400, 'bookingId is required'));
    const { order, booking } = await paymentService.createPaymentOrder(bookingId, req.user._id);
    res.json({
      success: true,
      data: {
        orderId:   order.id,
        amount:    order.amount,
        currency:  order.currency,
        bookingId: booking._id,
        keyId:     process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    next(err.statusCode ? new ExpressError(err.statusCode, err.message) : err);
  }
};

// ── Verify Payment ────────────────────────────────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingId) {
      return next(new ExpressError(400, 'Missing required payment verification fields'));
    }
    const booking = await paymentService.verifyPayment({
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      bookingId, tenantId: req.user._id,
    });
    res.json({ success: true, message: 'Payment verified and booking confirmed!', data: booking });
  } catch (err) {
    next(err.statusCode ? new ExpressError(err.statusCode, err.message) : err);
  }
};

// ── Get Payment Key (safe to expose) ─────────────────────────────────────────
exports.getPaymentKey = async (req, res) => {
  res.json({ success: true, keyId: process.env.RAZORPAY_KEY_ID });
};
