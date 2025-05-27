const express = require('express');
const router = express.Router();
const { askGpt4o } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/ask',authMiddleware, askGpt4o);

module.exports = router;
