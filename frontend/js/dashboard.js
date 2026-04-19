// =============================================
// dashboard.js - LOADS REAL DATA FROM BACKEND
// =============================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboard();
});

async function loadDashboard() {
  try {
    // Load loans and EMIs at the same time (faster)
    const [loansData, emiData] = await Promise.all([
      Loans.getAll(),
      EMIs.getAll()
    ]);

    renderStats(loansData.summary, emiData.summary);
    renderLoanBars(loansData.loans);
    renderRecentEMIs(emiData.emis);

  } catch (err) {
    showToast('Could not load dashboard data. ' + err.message);
    console.error(err);
  }
}

// ===== RENDER STAT CARDS =====
function renderStats(loanSummary, emiSummary) {
  const s = loanSummary || {};
  const e = emiSummary || {};

  const pct = s.totalPrincipal > 0
    ? Math.round((s.totalRepaid / s.totalPrincipal) * 100)
    : 0;

  const nextDue = e.nextDueDate ? daysUntil(e.nextDueDate) : null;
  const dueLabel = nextDue === null ? 'No upcoming EMIs'
    : nextDue <= 0 ? 'Overdue!'
    : `Due in ${nextDue} day${nextDue === 1 ? '' : 's'}`;

  document.getElementById('statTotalLoan').textContent    = '₹' + formatINR(s.totalPrincipal || 0);
  document.getElementById('statActiveLoans').textContent  = (s.activeLoans || 0) + ' Active Loans';
  document.getElementById('statRepaid').textContent       = '₹' + formatINR(s.totalRepaid || 0);
  document.getElementById('statRepaidPct').textContent    = pct + '% Complete';
  document.getElementById('statNextEMI').textContent      = '₹' + formatINR(e.nextDueAmount || 0);
  document.getElementById('statNextEMILabel').textContent = dueLabel;
  document.getElementById('statOutstanding').textContent  = '₹' + formatINR(s.totalOutstanding || 0);
  const remPct = s.totalPrincipal > 0
    ? Math.round((s.totalOutstanding / s.totalPrincipal) * 100) : 0;
  document.getElementById('statOutstandingPct').textContent = remPct + '% Remaining';
}

// ===== RENDER LOAN UTILIZATION BARS =====
function renderLoanBars(loans) {
  const container = document.getElementById('loanBarsContainer');
  if (!container) return;

  const active = (loans || []).filter(l => l.status === 'active');

  if (active.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px;">No active loans yet. <a href="loans.html" class="link">Add your first loan</a></p>';
    return;
  }

  const colors = ['blue-fill', 'green-fill', 'orange-fill'];

  container.innerHTML = active.map((loan, i) => {
    const utilized = loan.principal > 0
      ? Math.round(((loan.principal - (loan.outstanding || 0)) / loan.principal) * 100)
      : 0;
    const color = colors[i % colors.length];

    return `
      <div class="loan-bar-item">
        <div class="loan-bar-top">
          <span>${loan.loanType}</span>
          <span>₹${formatINR(loan.principal - (loan.outstanding || 0))} / ₹${formatINR(loan.principal)}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${color}" style="width:${utilized}%"></div>
        </div>
        <div class="loan-bar-bottom">
          <span>${utilized}% Repaid</span>
          <span class="chip">${loan.bankName}</span>
        </div>
      </div>`;
  }).join('');
}

// ===== RENDER RECENT EMIs =====
function renderRecentEMIs(emis) {
  const tbody = document.getElementById('recentEMIBody');
  if (!tbody) return;

  const recent = (emis || []).slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);">No EMIs yet</td></tr>';
    return;
  }

  tbody.innerHTML = recent.map(emi => {
    const statusClass = emi.status === 'paid' ? 'paid' : emi.status === 'pending' ? 'pending' : 'upcoming';
    const label = emi.status.charAt(0).toUpperCase() + emi.status.slice(1);
    return `
      <tr>
        <td>${emi.loanName || 'Loan'}</td>
        <td>₹${formatINR(emi.emiAmount)}</td>
        <td>${formatDate(emi.dueDate)}</td>
        <td><span class="status ${statusClass}">${label}</span></td>
      </tr>`;
  }).join('');
}
