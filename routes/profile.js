// =============================================
// ROUTE: profile.js
// =============================================
// Handles: Get profile, Update profile, Change password
// URLs:
//   GET  /api/profile               → get user profile
//   PUT  /api/profile               → update profile info
//   PUT  /api/profile/password      → change password

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// ===== GET PROFILE =====
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password'); // never send password
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Could not fetch profile.' });
  }
});

// ===== UPDATE PROFILE =====
router.put('/', auth, async (req, res) => {
  try {
    const { firstName, lastName, mobile, pan, aadhaar, city, emailNotifications, smsAlerts, twoFactorAuth } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Update only the fields that were provided
    if (firstName)  user.firstName = firstName;
    if (lastName)   user.lastName = lastName;
    if (mobile)     user.mobile = mobile;
    if (pan)        user.pan = pan;
    if (aadhaar)    user.aadhaar = aadhaar;
    if (city)       user.city = city;

    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (smsAlerts !== undefined)          user.smsAlerts = smsAlerts;
    if (twoFactorAuth !== undefined)      user.twoFactorAuth = twoFactorAuth;

    await user.save();
    res.json({ message: 'Profile updated successfully!', user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Could not update profile.' });
  }
});

// ===== CHANGE PASSWORD =====
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Could not change password.' });
  }
});

module.exports = router;
