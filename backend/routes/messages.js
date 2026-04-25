const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

router.post('/', protect, upload.single('image'), sendMessage);
router.get('/:conversationId', protect, getMessages);

module.exports = router;
