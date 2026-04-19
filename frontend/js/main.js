// =============================================
// main.js - SHARED UTILITIES (used on every page)
// =============================================

// ===== SIDEBAR TOGGLE (mobile) =====
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ===== TOAST NOTIFICATIONS =====
function showToast(msg, type = 'default') {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== SET USER INFO IN TOPBAR =====
// Shows user's initials in the avatar and name in welcome message
function setUserUI() {
  const user = getUser();
  if (!user) return;

  // Set avatar initials
  document.querySelectorAll('.avatar').forEach(el => {
    el.textContent = user.initials || (user.firstName ? user.firstName[0] : 'U');
  });

  // Set welcome name if element exists
  const nameEl = document.getElementById('welcomeName');
  if (nameEl) nameEl.textContent = user.firstName || 'User';
}

// ===== LOGOUT =====
function handleLogout(e) {
  if (e) e.preventDefault();
  clearLoginData();
  window.location.href = getBasePath() + 'index.html';
}

// ===== GET BASE PATH (handles pages/ subfolder) =====
function getBasePath() {
  return window.location.pathname.includes('/pages/') ? '../' : '';
}

// ===== ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  // Protect all dashboard pages - redirect to login if not authenticated
  if (window.location.pathname.includes('/pages/')) {
    if (!requireAuth()) return;
    setUserUI();
  }

  // Attach logout to all logout links
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', handleLogout);
  });
});
