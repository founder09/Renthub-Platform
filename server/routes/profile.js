const express         = require('express');
const router          = express.Router();
const profileController = require('../controllers/profileController');
const { isLoggedIn }  = require('../middlewares/auth');

router.get('/',                        isLoggedIn, profileController.getProfile);
router.put('/',                        isLoggedIn, profileController.updateProfile);
router.post('/save/:listingId',        isLoggedIn, profileController.toggleSave);

module.exports = router;
