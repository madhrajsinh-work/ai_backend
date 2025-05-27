const express = require('express');
const { signup, signin, sendOTP, verifyOTP } = require('../controllers/authController');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/signup', upload.single('image'), signup);
router.post('/signin', signin);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP)

module.exports = router;
