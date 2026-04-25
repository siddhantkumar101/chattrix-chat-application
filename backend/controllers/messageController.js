const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  const { receiverId, content, conversationId } = req.body;
  const senderId = req.user._id;

  try {
    const sender = await User.findById(senderId);
    const isContact = sender.contacts.some(contactId => contactId.toString() === receiverId.toString());
    
    if (!isContact) {
      return res.status(403).json({ message: "You can only message your contacts. Please send a connection request first." });
    }

    let convId = conversationId;

    // FormData sends null as string "null" — treat that as no conversation
    if (!convId || convId === 'null' || convId === 'undefined') {
      convId = null;
    }

    // If no conversationId, find or create one
    if (!convId) {
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
        });
      }
      convId = conversation._id;
    }

    const newMessage = await Message.create({
      conversation: convId,
      sender: senderId,
      receiver: receiverId,
      content,
      image: req.file ? req.file.path : null,
    });

    // Update last message in conversation
    await Conversation.findByIdAndUpdate(convId, {
      lastMessage: newMessage._id,
    });

    // Populate sender and receiver for the response
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
