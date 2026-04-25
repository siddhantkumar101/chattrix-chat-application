const express = require('express');
const router = express.Router();
const { getUsers, getUserProfile, updateUserProfile, requestContact, acceptContact, rejectContact } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

router.get('/', protect, getUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

router.post('/request/:id', protect, requestContact);
router.post('/accept/:id', protect, acceptContact);
router.post('/reject/:id', protect, rejectContact);

module.exports = router;
