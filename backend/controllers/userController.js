const User = require('../models/User');

// @desc    Get all users except the current user
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .populate('contacts', 'name avatar email isOnline')
      .populate('connectionRequests', 'name avatar email isOnline')
      .populate('sentRequests', 'name avatar email isOnline');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('contacts', 'name avatar email isOnline')
      .populate('connectionRequests', 'name avatar email isOnline')
      .populate('sentRequests', 'name avatar email isOnline');
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        contacts: user.contacts,
        connectionRequests: user.connectionRequests,
        sentRequests: user.sentRequests
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.file) {
        user.avatar = req.file.path; // Image uploaded to Cloudinary
      } else if (req.body.avatar) {
        user.avatar = req.body.avatar; // Dicebear URL string
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send connection request
// @route   POST /api/users/request/:id
// @access  Private
const requestContact = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (targetUser.connectionRequests.includes(currentUserId) || targetUser.contacts.includes(currentUserId)) {
      return res.status(400).json({ message: "Request already sent or already contacts" });
    }

    targetUser.connectionRequests.push(currentUserId);
    currentUser.sentRequests.push(targetUserId);

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({ message: "Request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept connection request
// @route   POST /api/users/accept/:id
// @access  Private
const acceptContact = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser.connectionRequests.includes(targetUserId)) {
      return res.status(400).json({ message: "No connection request found" });
    }

    // Remove from requests, add to contacts
    currentUser.connectionRequests = currentUser.connectionRequests.filter(id => id.toString() !== targetUserId.toString());
    currentUser.contacts.push(targetUserId);

    targetUser.sentRequests = targetUser.sentRequests.filter(id => id.toString() !== currentUserId.toString());
    targetUser.contacts.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: "Request accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject connection request
// @route   POST /api/users/reject/:id
// @access  Private
const rejectContact = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    currentUser.connectionRequests = currentUser.connectionRequests.filter(id => id.toString() !== targetUserId.toString());
    targetUser.sentRequests = targetUser.sentRequests.filter(id => id.toString() !== currentUserId.toString());

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: "Request rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserProfile,
  updateUserProfile,
  requestContact,
  acceptContact,
  rejectContact
};
