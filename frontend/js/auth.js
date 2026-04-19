// =============================================
// auth.js - LOGIN & REGISTER (connected to real backend)
// =============================================

// ===== TAB SWITCHER =====
function switchTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  const panel = document.getElementById(tab + 'Form');
  if (panel) panel.classList.add('active');
}

// ===== HANDLE LOGIN =====
async function handleLogin(e) {
  e.preventDefault();

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  const btn      = e.target.querySelector('button[type="submit"]');

  if (!email || !password) {
    showToast('Please enter your email and password.');
    return;
  }

  // Disable button to prevent double-click
  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    await Auth.login(email, password);
    showToast('Login successful! Redirecting...');
    setTimeout(() => {
      window.location.href = 'pages/dashboard.html';
    }, 1000);
  } catch (err) {
    showToast(err.message || 'Login failed. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

// ===== HANDLE REGISTER =====
async function handleRegister(e) {
  e.preventDefault();

  const inputs    = e.target.querySelectorAll('input');
  const firstName = inputs[0].value.trim();
  const lastName  = inputs[1].value.trim();
  const email     = inputs[2].value.trim();
  const mobile    = inputs[3].value.trim();
  const password  = inputs[4].value;
  const btn       = e.target.querySelector('button[type="submit"]');

  if (!firstName || !lastName || !email || !password) {
    showToast('Please fill in all required fields.');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Creating account...';

  try {
    await Auth.register(firstName, lastName, email, mobile, password);
    showToast('Account created! Please login.');
    btn.disabled = false;
    btn.textContent = 'Create Account';
    // Switch to login tab
    const loginTab = document.querySelectorAll('.tab')[0];
    setTimeout(() => switchTab('login', loginTab), 1200);
  } catch (err) {
    showToast(err.message || 'Registration failed. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

// ===== TOAST for auth page =====
function showToast(msg) {
  let t = document.getElementById('globalToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'globalToast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}

// ===== IF ALREADY LOGGED IN, skip auth page =====
document.addEventListener('DOMContentLoaded', () => {
  if (getToken()) {
    window.location.href = 'pages/dashboard.html';
  }
});
