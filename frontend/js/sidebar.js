// =============================================
// sidebar.js - Injects the sidebar HTML on every page
// =============================================
// Instead of copy-pasting the sidebar into every HTML file,
// we generate it with JS so it's consistent and easy to update.

function injectSidebar(activePage) {
  const nav = [
    { href: 'dashboard.html', icon: `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>`, label: 'Dashboard' },
    { href: 'loans.html',     icon: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`, label: 'My Loans' },
    { href: 'emi.html',       icon: `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`, label: 'EMI Tracker' },
    { href: 'repayment.html', icon: `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`, label: 'Repayment' },
    { href: 'expenses.html',  icon: `<path d="M3 3h18v18H3z"/><path d="M16 8h-8M16 12h-8M16 16h-8"/>`, label: 'Expenses' },
    { href: 'profile.html',   icon: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`, label: 'Profile' }
  ];

  const html = `
    <div class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="brand-name">LoanTrack</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${nav.map(item => `
          <a href="${item.href}" class="nav-item ${item.href === activePage ? 'active' : ''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>
            ${item.label}
          </a>`).join('')}
      </nav>
      <div class="sidebar-footer">
        <a href="#" class="nav-item logout logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </a>
      </div>
    </div>`;

  // Insert sidebar at top of body
  document.body.insertAdjacentHTML('afterbegin', html);
}
