const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  image: { type: String },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false } 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
