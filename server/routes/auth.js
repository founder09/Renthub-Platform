const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudConfig');
const upload = multer({ storage });
const authController = require('../controllers/authController');
const { isLoggedIn } = require('../middlewares/auth');

router.post('/register', upload.single('ownerProof'), authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', isLoggedIn, authController.getMe);

module.exports = router;
