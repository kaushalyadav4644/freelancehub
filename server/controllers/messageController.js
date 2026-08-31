const { Message } = require('../models/index');

const getConversationId = (id1, id2) =>
  [id1.toString(), id2.toString()].sort().join('_');

// POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, jobId, attachments } = req.body;
    const conversationId = getConversationId(req.user._id, recipientId);

    const message = await Message.create({
      conversationId, content, jobId, attachments,
      senderId: req.user._id,
      recipientId,
    });

    await message.populate('senderId', 'name avatar');

    // Real-time emit
    if (req.io) {
      req.io.to(recipientId).emit('receive_message', message);
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/messages/:userId
exports.getConversation = async (req, res) => {
  try {
    const conversationId = getConversationId(req.user._id, req.params.userId);

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { conversationId, recipientId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/messages/conversations
exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.aggregate([
      { $match: { $or: [{ senderId: req.user._id }, { recipientId: req.user._id }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' } } },
    ]);

    const populated = await Message.populate(messages, [
      { path: 'lastMessage.senderId', select: 'name avatar' },
      { path: 'lastMessage.recipientId', select: 'name avatar' },
    ]);

    res.json({ success: true, conversations: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
