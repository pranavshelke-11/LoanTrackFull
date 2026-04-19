# 🏦 LoanTrack — Full Stack App (Frontend + Backend)

## What's Inside

```
LoanTrackFull/
├── backend/              ← Node.js + Express + MongoDB
│   ├── server.js         ← Main server file
│   ├── .env              ← Your secret config (edit this!)
│   ├── models/           ← Database structures
│   │   ├── User.js
│   │   ├── Loan.js
│   │   ├── EMI.js
│   │   └── Expense.js
│   ├── routes/           ← API endpoints
│   │   ├── auth.js       → /api/auth/login, /api/auth/register
│   │   ├── loans.js      → /api/loans
│   │   ├── emis.js       → /api/emis
│   │   ├── expenses.js   → /api/expenses
│   │   └── profile.js    → /api/profile
│   └── middleware/
│       └── authMiddleware.js
│
└── frontend/             ← HTML + CSS + JS (your original design)
    ├── index.html        ← Login / Register page
    ├── css/style.css
    ├── js/
    │   ├── api.js        ← All fetch() calls to backend
    │   ├── main.js       ← Shared utilities
    │   ├── sidebar.js    ← Sidebar generator
    │   ├── auth.js       ← Login/register logic
    │   ├── dashboard.js
    │   ├── loans.js
    │   ├── emi.js
    │   ├── expenses.js
    │   └── profile.js
    └── pages/
        ├── dashboard.html
        ├── loans.html
        ├── emi.html
        ├── repayment.html
        ├── expenses.html
        └── profile.html
```

---

## ✅ SETUP GUIDE (step by step)

### STEP 1 — Install Node.js
- Download from: https://nodejs.org (choose LTS)
- Install it. Then open Terminal and verify:
  ```
  node --version
  npm --version
  ```

### STEP 2 — Set Up MongoDB Atlas (Free Database)
1. Go to https://cloud.mongodb.com and sign up free
2. Create a free cluster (M0 Free Tier)
3. Create a database user: Security → Database Access → Add New User
4. Allow network access: Security → Network Access → Add IP Address → Allow from anywhere
5. Click "Connect" → "Drivers" → Copy the connection string
   It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`

### STEP 3 — Configure Your .env File
Open `backend/.env` and update:
```
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/loantrack
JWT_SECRET=any_long_random_string_here
PORT=5000
```

### STEP 4 — Install Backend Dependencies
Open Terminal, navigate to the backend folder:
```bash
cd backend
npm install
```

### STEP 5 — Start the Backend
```bash
node server.js
```
You should see:
```
✅ MongoDB connected successfully!
🚀 LoanTrack server running on http://localhost:5000
```

### STEP 6 — Open the Frontend
- Simply open `frontend/index.html` in your browser
- OR use a simple server extension like VS Code "Live Server"

### STEP 7 — Test It!
1. Register a new account on the login page
2. Login with your credentials
3. Add a loan → it saves to MongoDB!
4. Check EMI Tracker → real EMIs are auto-generated
5. Add expenses → saved to database

---

## 🔌 API Reference

| Method | URL | What it does |
|--------|-----|--------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/loans | Get all your loans |
| POST | /api/loans | Add a loan |
| DELETE | /api/loans/:id | Remove a loan |
| GET | /api/emis | Get all EMIs |
| PUT | /api/emis/:id/pay | Mark EMI as paid |
| GET | /api/expenses | Get all expenses |
| POST | /api/expenses | Add expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/profile | Get your profile |
| PUT | /api/profile | Update profile |
| PUT | /api/profile/password | Change password |

---

## ❓ Common Problems

**"Cannot connect to server"**
→ Make sure backend is running (`node server.js` in the backend folder)

**"MongoDB connection failed"**
→ Check your MONGO_URI in .env — username/password must be correct
→ Make sure your IP is whitelisted in MongoDB Atlas Network Access

**"User not found" or "Invalid token"**
→ Clear browser localStorage and login again

**Frontend shows blank / no data**
→ Open browser DevTools (F12) → Console tab → look for error messages
