/**
 * Analytics Service — MongoDB aggregation pipelines for owner, tenant, and admin.
 * Results are cached to prevent repeated heavy queries.
 */
const Booking      = require('../models/Booking');
const Listing      = require('../models/Listing');
const User         = require('../models/User');
const Notification = require('../models/Notification');
const cache        = require('../cache/cacheClient');

const CACHE_TTL = 5 * 60; // 5 minutes

// ── OWNER ANALYTICS ──────────────────────────────────────────────────────────

async function getOwnerAnalytics(ownerId) {
  const cacheKey = `analytics:owner:${ownerId}`;
  const cached   = await cache.get(cacheKey);
  if (cached) return cached;

  const ownerObjId = ownerId;

  const [
    bookingStats,
    monthlyEarnings,
    topListings,
    recentBookings,
    listingCount,
    cancellationRate,
  ] = await Promise.all([

    // Booking status distribution
    Booking.aggregate([
      { $match: { ownerId: ownerObjId } },
      { $group: { _id: '$bookingStatus', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    ]),

    // Monthly earnings for last 6 months
    Booking.aggregate([
      {
        $match: {
          ownerId: ownerObjId,
          paymentStatus: 'paid',
          createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue:  { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Top-performing listings by booking count
    Booking.aggregate([
      { $match: { ownerId: ownerObjId, bookingStatus: { $in: ['accepted', 'completed'] } } },
      { $group: { _id: '$propertyId', bookingCount: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'listings', localField: '_id', foreignField: '_id',
          as: 'listing',
        },
      },
      { $unwind: { path: '$listing', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title:        '$listing.title',
          location:     '$listing.location',
          image:        '$listing.image',
          price:        '$listing.price',
          bookingCount: 1,
          revenue:      1,
        },
      },
    ]),

    // Recent 5 bookings
    Booking.find({ ownerId: ownerObjId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('propertyId', 'title image location')
      .populate('tenantId', 'username avatar'),

    // Total listings
    Listing.countDocuments({ owner: ownerObjId }),

    // Cancellation rate
    Booking.aggregate([
      { $match: { ownerId: ownerObjId } },
      {
        $group: {
          _id: null,
          total:     { $sum: 1 },
          cancelled: { $sum: { $cond: [{ $eq: ['$bookingStatus', 'cancelled'] }, 1, 0] } },
        },
      },
    ]),
  ]);

  // Format monthly earnings for recharts
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const earningsChart = monthlyEarnings.map(m => ({
    month:    MONTHS[m._id.month - 1],
    revenue:  m.revenue,
    bookings: m.bookings,
  }));

  // Summary stats
  const totalRevenue  = bookingStats.reduce((s, b) => b._id === 'accepted' || b._id === 'completed' ? s + b.revenue : s, 0);
  const totalBookings = bookingStats.reduce((s, b) => s + b.count, 0);
  const pending       = bookingStats.find(b => b._id === 'pending')?.count || 0;
  const cancRate      = cancellationRate[0]
    ? ((cancellationRate[0].cancelled / cancellationRate[0].total) * 100).toFixed(1)
    : 0;

  const result = {
    summary: {
      totalListings:    listingCount,
      totalBookings,
      totalRevenue,
      pendingRequests:  pending,
      cancellationRate: Number(cancRate),
    },
    earningsChart,
    bookingStatusChart: bookingStats.map(b => ({ name: b._id, value: b.count })),
    topListings,
    recentBookings,
  };

  await cache.set(cacheKey, result, CACHE_TTL);
  return result;
}

// ── TENANT ANALYTICS ─────────────────────────────────────────────────────────

async function getTenantAnalytics(tenantId) {
  const cacheKey = `analytics:tenant:${tenantId}`;
  const cached   = await cache.get(cacheKey);
  if (cached) return cached;

  const [spendingStats, statusDist, monthlySpend, savedCount] = await Promise.all([
    Booking.aggregate([
      { $match: { tenantId, paymentStatus: 'paid' } },
      { $group: { _id: null, totalSpent: { $sum: '$totalAmount' }, bookingCount: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      { $match: { tenantId } },
      { $group: { _id: '$bookingStatus', count: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      {
        $match: {
          tenantId,
          paymentStatus: 'paid',
          createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          spent: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    User.findById(tenantId).select('savedListings').then(u => u?.savedListings?.length || 0),
  ]);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const result = {
    summary: {
      totalSpent:    spendingStats[0]?.totalSpent    || 0,
      totalBookings: spendingStats[0]?.bookingCount  || 0,
      savedListings: savedCount,
    },
    statusDistribution: statusDist.map(s => ({ name: s._id, value: s.count })),
    spendingChart: monthlySpend.map(m => ({
      month: MONTHS[m._id.month - 1],
      spent: m.spent,
    })),
  };

  await cache.set(cacheKey, result, CACHE_TTL);
  return result;
}

// ── ADMIN ANALYTICS ───────────────────────────────────────────────────────────

async function getAdminAnalytics() {
  const cacheKey = 'analytics:admin:global';
  const cached   = await cache.get(cacheKey);
  if (cached) return cached;

  const [
    platformStats,
    monthlyBookings,
    userGrowth,
    topCities,
    revenueByPlan,
  ] = await Promise.all([
    Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Booking.countDocuments({ bookingStatus: 'pending' }),
    ]),

    Booking.aggregate([
      {
        $match: { createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } },
      },
      {
        $group: {
          _id:      { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          bookings: { $sum: 1 },
          revenue:  { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    User.aggregate([
      {
        $match: { createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } },
      },
      {
        $group: {
          _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          users: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    Listing.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    // Revenue by listing type
    Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $lookup: {
          from: 'listings', localField: 'propertyId', foreignField: '_id',
          as: 'listing',
        },
      },
      { $unwind: { path: '$listing', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id:     '$listing.listingType',
          revenue: { $sum: '$totalAmount' },
          count:   { $sum: 1 },
        },
      },
    ]),
  ]);

  const [totalUsers, totalListings, totalBookings, totalRevenueAgg, pendingBookings] = platformStats;

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formatMonthly = (arr, field) =>
    arr.map(m => ({ month: MONTHS[m._id.month - 1], [field]: m[field] }));

  const result = {
    summary: {
      totalUsers,
      totalListings,
      totalBookings,
      totalRevenue:    totalRevenueAgg[0]?.total || 0,
      pendingBookings,
    },
    bookingsChart:   formatMonthly(monthlyBookings, 'bookings'),
    revenueChart:    formatMonthly(monthlyBookings, 'revenue'),
    userGrowthChart: formatMonthly(userGrowth, 'users'),
    topCities:       topCities.map(c => ({ city: c._id || 'Unknown', count: c.count })),
    revenueByType:   revenueByPlan.map(r => ({ name: r._id || 'Other', revenue: r.revenue, count: r.count })),
  };

  await cache.set(cacheKey, result, CACHE_TTL);
  return result;
}

/** Invalidate analytics cache for a user (call after booking/listing changes). */
async function invalidateAnalytics(ownerId, tenantId) {
  await Promise.all([
    ownerId  ? cache.del(`analytics:owner:${ownerId}`)   : Promise.resolve(),
    tenantId ? cache.del(`analytics:tenant:${tenantId}`) : Promise.resolve(),
    cache.del('analytics:admin:global'),
  ]);
}

module.exports = { getOwnerAnalytics, getTenantAnalytics, getAdminAnalytics, invalidateAnalytics };
