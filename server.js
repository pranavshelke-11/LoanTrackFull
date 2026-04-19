// =============================================
// LOANTRACK - MAIN SERVER FILE
// =============================================
// This is the heart of your backend.
// It starts the server, connects to the database,
// and sets up all the API routes.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ===== MIDDLEWARE =====
// These lines allow your frontend to talk to this backend
app.use(cors());
app.use(express.json()); // allows backend to read JSON data from frontend

// ===== ROUTES =====
// Each route file handles a specific part of the app
app.use('/api/auth',      require('./routes/auth'));       // login, register
app.use('/api/loans',     require('./routes/loans'));      // loans CRUD
app.use('/api/emis',      require('./routes/emis'));       // EMI payments
app.use('/api/expenses',  require('./routes/expenses'));   // expenses
app.use('/api/profile',   require('./routes/profile'));    // user profile

// ===== HEALTH CHECK =====
// Visit http://localhost:5000/api/health to confirm server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'LoanTrack API is running!', timestamp: new Date() });
});

// ===== CONNECT TO DATABASE & START SERVER =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 LoanTrack server running on http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('👉 Make sure your MONGO_URI in .env file is correct!');
    process.exit(1);
  });
