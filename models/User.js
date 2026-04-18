// =============================================
// MODEL: User.js
// =============================================
// This defines the structure of a User in the database.
// Think of it as a form template - every user saved will
// follow this exact structure.

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile:     { type: String, trim: true },
  password:   { type: String, required: true },
  pan:        { type: String, trim: true },
  aadhaar:    { type: String, trim: true },
  city:       { type: String, trim: true },

  // Notification settings
  emailNotifications: { type: Boolean, default: true },
  smsAlerts:          { type: Boolean, default: true },
  twoFactorAuth:      { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
