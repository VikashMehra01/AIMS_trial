const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, unique: true, sparse: true }, // Optional, unique if present
  email: { type: String, unique: true, required: true },
  password: { type: String }, // Optional for Google Auth users
  pfp: { type: String },
  department: { type: String },
  degree: { type: String },
  yearOfEntry: { type: String },
  googleId: { type: String }, // For Google Auth
  role: { type: String, enum: ['student', 'admin', 'instructor', 'faculty_advisor'], default: 'student' },

  // 2FA Fields
  otp: { type: String },
  otpExpires: { type: Date },
  trustedDevices: [{
    token: { type: String, required: true },
    expires: { type: Date, required: true },
    lastUsed: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
