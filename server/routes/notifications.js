const express = require('express');
const router  = express.Router();
const notifCtrl = require('../controllers/notificationController');
const { isLoggedIn } = require('../middlewares/auth');

router.get('/',              isLoggedIn, notifCtrl.getNotifications);
router.get('/unread-count',  isLoggedIn, notifCtrl.getUnreadCount);
router.patch('/mark-all-read', isLoggedIn, notifCtrl.markAllAsRead);
router.patch('/:id/read',    isLoggedIn, notifCtrl.markAsRead);
router.delete('/:id',        isLoggedIn, notifCtrl.deleteNotification);

module.exports = router;
