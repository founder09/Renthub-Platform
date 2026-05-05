const Notification = require('../models/Notification');
const ExpressError = require('../utils/ExpressError');

// ── Get My Notifications ──────────────────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find({ recipientId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('senderId', 'username avatar'),
      Notification.countDocuments({ recipientId: req.user._id, isRead: false }),
      Notification.countDocuments({ recipientId: req.user._id }),
    ]);
    res.json({
      success: true,
      data: { notifications, unreadCount, total, page: Number(page), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get Unread Count ──────────────────────────────────────────────────────────
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipientId: req.user._id, isRead: false });
    res.json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
};

// ── Mark Single Notification as Read ─────────────────────────────────────────
exports.markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return next(new ExpressError(404, 'Notification not found'));
    res.json({ success: true, data: notif });
  } catch (err) {
    next(err);
  }
};

// ── Mark All as Read ──────────────────────────────────────────────────────────
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// ── Delete a Notification ─────────────────────────────────────────────────────
exports.deleteNotification = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndDelete({ _id: req.params.id, recipientId: req.user._id });
    if (!notif) return next(new ExpressError(404, 'Notification not found'));
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};
