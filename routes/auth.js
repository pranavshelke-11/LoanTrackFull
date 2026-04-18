// =============================================
// ROUTE: auth.js
// =============================================
// Handles: Register new user, Login existing user
// URLs:
//   POST /api/auth/register  → create account
//   POST /api/auth/login     → sign in

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ===== REGISTER =====
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password } = req.body;

    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    // Check if this email already has an account
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash (encrypt) the password before saving - NEVER store plain passwords
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new user in the database
    const user = new User({
      firstName,
      lastName,
      email,
      mobile,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: 'Account created successfully! Please login.' });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ===== LOGIN =====
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter your email and password.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email.' });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password. Please try again.' });
    }

    // Create a login token (expires in 7 days)
    const token = jwt.sign(
      { id: user._id, name: user.firstName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        initials: (user.firstName[0] + user.lastName[0]).toUpperCase()
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
