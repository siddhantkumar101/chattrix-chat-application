const Conversation = require('../models/Conversation');

// @desc    Get all conversations for current user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] },
    })
      .populate('participants', 'name email avatar isOnline')
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt',
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
};
