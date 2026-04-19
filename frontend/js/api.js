// =============================================
// api.js - THE BRIDGE BETWEEN FRONTEND & BACKEND
// =============================================
// This file contains ALL the functions that talk to your backend.
// Instead of faking data, every function now makes a real HTTP request.

const API_URL = 'https://loantrack-backend.onrender.com/';

// ===== HELPER: Get auth token from storage =====
function getToken() {
  return localStorage.getItem('lt_token');
}

// ===== HELPER: Get logged-in user info =====
function getUser() {
  const u = localStorage.getItem('lt_user');
  return u ? JSON.parse(u) : null;
}

// ===== HELPER: Save login data =====
function saveLoginData(token, user) {
  localStorage.setItem('lt_token', token);
  localStorage.setItem('lt_user', JSON.stringify(user));
}

// ===== HELPER: Clear login data (logout) =====
function clearLoginData() {
  localStorage.removeItem('lt_token');
  localStorage.removeItem('lt_user');
}

// ===== HELPER: Check if user is logged in =====
// If not logged in, redirect to login page
function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = '../index.html';
    return false;
  }
  return true;
}

// ===== HELPER: Make API requests =====
// This handles sending data to the backend and getting responses
async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };

  // Add auth token for protected routes
  const token = getToken();
  if (token) headers['authorization'] = token;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (err) {
    // If it's a network error (backend not running), show a clear message
    if (err.name === 'TypeError') {
      throw new Error('Cannot connect to server. Make sure backend is running on port 5000.');
    }
    throw err;
  }
}

// =============================================
// AUTH API FUNCTIONS
// =============================================
const Auth = {
  async login(email, password) {
    const data = await apiRequest('/auth/login', 'POST', { email, password });
    saveLoginData(data.token, data.user);
    return data;
  },

  async register(firstName, lastName, email, mobile, password) {
    return await apiRequest('/auth/register', 'POST', { firstName, lastName, email, mobile, password });
  },

  logout() {
    clearLoginData();
    window.location.href = '../index.html';
  }
};

// =============================================
// LOANS API FUNCTIONS
// =============================================
const Loans = {
  async getAll() {
    return await apiRequest('/loans');
  },

  async add(loanData) {
    return await apiRequest('/loans', 'POST', loanData);
  },

  async update(id, loanData) {
    return await apiRequest(`/loans/${id}`, 'PUT', loanData);
  },

  async remove(id) {
    return await apiRequest(`/loans/${id}`, 'DELETE');
  }
};

// =============================================
// EMI API FUNCTIONS
// =============================================
const EMIs = {
  async getAll(status = 'all') {
    return await apiRequest(`/emis?status=${status}`);
  },

  async markPaid(id) {
    return await apiRequest(`/emis/${id}/pay`, 'PUT');
  }
};

// =============================================
// EXPENSES API FUNCTIONS
// =============================================
const Expenses = {
  async getAll() {
    return await apiRequest('/expenses');
  },

  async add(expenseData) {
    return await apiRequest('/expenses', 'POST', expenseData);
  },

  async remove(id) {
    return await apiRequest(`/expenses/${id}`, 'DELETE');
  }
};

// =============================================
// PROFILE API FUNCTIONS
// =============================================
const Profile = {
  async get() {
    return await apiRequest('/profile');
  },

  async update(profileData) {
    return await apiRequest('/profile', 'PUT', profileData);
  },

  async changePassword(currentPassword, newPassword) {
    return await apiRequest('/profile/password', 'PUT', { currentPassword, newPassword });
  }
};

// =============================================
// HELPERS
// =============================================
// Format number to Indian currency format
function formatINR(num) {
  return Number(num || 0).toLocaleString('en-IN');
}

// Format date to readable format
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Calculate days until a date
function daysUntil(dateStr) {
  const today = new Date();
  const due = new Date(dateStr);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diff;
}
