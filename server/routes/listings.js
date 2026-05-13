const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudConfig');
const listingController = require('../controllers/listingController');
const { isLoggedIn, authorizeRoles } = require('../middlewares/auth');
const { validateListing } = require('../middlewares/validate');

const upload = multer({ storage });

router.get('/', listingController.index);
router.get('/:id', listingController.show);
router.get('/:id/private', isLoggedIn, listingController.showPrivate);  // owner-only

router.post(
  '/',
  isLoggedIn,
  authorizeRoles('owner', 'admin'),
  upload.array('images', 5),
  validateListing,
  listingController.create
);

router.put(
  '/:id',
  isLoggedIn,
  authorizeRoles('owner', 'admin'),
  upload.array('images', 5),
  validateListing,
  listingController.update
);

router.delete('/:id', isLoggedIn, authorizeRoles('owner', 'admin'), listingController.destroy);

module.exports = router;
