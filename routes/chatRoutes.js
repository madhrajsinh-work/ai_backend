const express = require('express');
const { saveChatMessage, getChatMessages, getAIMediatedConversations } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');


const router = express.Router();

router.post('/save', authMiddleware, saveChatMessage);
router.get('/history', authMiddleware, getChatMessages);
router.get('/conversations', authMiddleware, (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  next();
}, getAIMediatedConversations);

module.exports = router;
    