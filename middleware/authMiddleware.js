// =============================================
// MIDDLEWARE: authMiddleware.js
// =============================================
// This file acts like a security guard.
// Before anyone can access protected routes (like loans, EMIs),
// they must have a valid login token.

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from the request headers
  const token = req.headers['authorization'];

  // If no token is provided, reject the request
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Please login first.' });
  }

  try {
    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user's ID to the request so routes can use it
    req.userId = decoded.id;
    req.userName = decoded.name;

    // Let the request continue to the actual route
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token. Please login again.' });
  }
};
