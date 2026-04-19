const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ===== CORS FIX =====
// Allow requests from your Render frontend + localhost for testing
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://loantrack-frontend.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      // Allow any onrender.com subdomain
      if (origin.endsWith('.onrender.com')) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ===== ROUTES =====
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/loans',    require('./routes/loans'));
app.use('/api/emis',     require('./routes/emis'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/profile',  require('./routes/profile'));

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'LoanTrack API is running!', timestamp: new Date() });
});

// ===== ROOT =====
app.get('/', (req, res) => {
  res.json({ message: 'LoanTrack Backend is live!' });
});

// ===== CONNECT DB & START =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    app.listen(process.env.PORT || 5000, () => {
      console.log(🚀 LoanTrack server running on port ${process.env.PORT || 5000});
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
