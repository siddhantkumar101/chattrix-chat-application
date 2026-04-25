const express = require('express');
const router = express.Router();
const { getUsers, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

router.get('/', protect, getUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

module.exports = router;
