const express = require('express');
const router = express.Router();
const { askGpt4o } = require('../controllers/aiController');

router.post('/ask', askGpt4o);

module.exports = router;
