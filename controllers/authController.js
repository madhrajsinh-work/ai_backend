const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOtpToWhatsApp, generateOTP } = require('../utils/sendOtp');

const otpStore = new Map();

exports.signup = async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    const image = req.file ? req.file.path : null;

    if (!username || !phone || !password || !image) {
      return res.status(400).json({ message: 'All fields including image are required' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or phone already exists' });
    }

    const verified = otpStore.get(phone + '_verified');
    if (!verified) {
      return res.status(400).json({ message: 'Phone number not verified. Please verify before signup.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      username,
      phone,
      image,
      password: hashedPassword,
      isVerified: true, 
    });

    otpStore.delete(phone + '_verified');

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        phone: newUser.phone,
        image: newUser.image,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [{ username: identifier }, { phone: identifier }]
    });

    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { username: user.username, phone: user.phone, image: user.image } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('username phone image');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendOTP = async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ message: 'Phone number required' });

  const otp = generateOTP();
  otpStore.set(phone, otp);

  try {
    await sendOtpToWhatsApp(phone, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP on WhatsApp', error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  const storedOtp = otpStore.get(phone);
  if (storedOtp && storedOtp === otp) {
    otpStore.delete(phone); 
    otpStore.set(phone + '_verified', true); 

    return res.status(200).json({ verified: true, message: 'Phone verified' });
  }

  return res.status(400).json({ verified: false, message: 'Invalid or expired OTP' });
};
