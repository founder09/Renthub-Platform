require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// ─── Security & Logging Packages ───────────────────────────────────────────────
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const connectDB = require('./config/db');
const ExpressError = require('./utils/ExpressError');

const listingRoutes          = require('./routes/listings');
const reviewRoutes           = require('./routes/reviews');
const userRoutes             = require('./routes/auth'); // Renamed from users to auth
const profileRoutes          = require('./routes/profile');
const bookingRoutes          = require('./routes/bookings');
const paymentRoutes          = require('./routes/payments');
const notificationRoutes     = require('./routes/notifications');
const subscriptionRoutes     = require('./routes/subscriptions');
const analyticsRoutes        = require('./routes/analytics');
const aiRoutes               = require('./routes/ai');

// Initialize cache (logs whether Redis or in-memory)
require('./cache/cacheClient');

const app = express();

// Connect to MongoDB
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' })); // Body parser limit for security
app.use(cookieParser());
app.use(mongoSanitize()); // Prevent NoSQL injection
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  max: 5000, // Increased for development to prevent 429 errors
  windowMs: 5 * 60 * 1000, // 5 minutes
  message: { success: false, message: 'Too many requests from this IP, please try again later!' }
});
app.use('/api', limiter);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          userRoutes);
app.use('/api/listings',      listingRoutes);
app.use('/api/listings',      reviewRoutes);        // nested: /api/listings/:id/reviews
app.use('/api/profile',       profileRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/ai',            aiRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Route not found'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong' } = err;
  console.error(`[ERROR] ${statusCode} - ${message}`);
  res.status(statusCode).json({ success: false, message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
