const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const { isLoggedIn } = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login',    authController.login);
router.post('/logout',   authController.logout);
router.get('/me',        isLoggedIn, authController.getMe);

module.exports = router;
