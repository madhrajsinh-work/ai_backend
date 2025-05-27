const express = require('express');
const { saveChatMessage, getChatMessages } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/save', authMiddleware, saveChatMessage);
router.get('/history', authMiddleware, getChatMessages);

module.exports = router;
    