const router = require('express').Router();
const { sendMessage, getConversation, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getConversation);
module.exports = router;
