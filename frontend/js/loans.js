// =============================================
// loans.js - MY LOANS PAGE (real backend)
// =============================================

let allLoans = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadLoans();
});

// ===== LOAD ALL LOANS FROM BACKEND =====
async function loadLoans() {
  const grid = document.getElementById('loansGrid');
  grid.innerHTML = '<p style="color:var(--muted);padding:20px;">Loading loans...</p>';

  try {
    const data = await Loans.getAll();
    allLoans = data.loans || [];
    renderLoans(allLoans);
  } catch (err) {
    showToast('Could not load loans: ' + err.message);
    grid.innerHTML = '<p style="color:var(--danger);padding:20px;">Failed to load loans. Make sure backend is running.</p>';
  }
}

// ===== RENDER LOAN CARDS =====
function renderLoans(loans) {
  const grid = document.getElementById('loansGrid');

  if (loans.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted);">
        <p style="font-size:16px;margin-bottom:12px;">No loans found.</p>
        <button class="btn-primary" onclick="showModal()">+ Add Your First Loan</button>
      </div>`;
    return;
  }

  const colors = ['blue-fill', 'green-fill', 'orange-fill', 'blue-fill'];

  grid.innerHTML = loans.map((loan, i) => {
    const outstanding = loan.outstanding || loan.principal;
    const repaidPct = loan.principal > 0
      ? Math.round(((loan.principal - outstanding) / loan.principal) * 100)
      : 0;
    const isActive = loan.status === 'active';
    const color = colors[i % colors.length];

    return `
      <div class="loan-card" data-status="${loan.status}" data-id="${loan._id}">
        <div class="loan-card-top">
          <div>
            <h4 class="loan-type">${loan.loanType}</h4>
            <p class="loan-bank">${loan.bankName}${loan.accountNo ? ' · A/C ' + loan.accountNo : ''}</p>
          </div>
          <span class="status-badge ${isActive ? 'active-badge' : 'closed-badge'}">
            ${isActive ? 'Active' : 'Closed'}
          </span>
        </div>
        <div class="loan-amount-row">
          <div><p class="al">Principal</p><p class="av">₹${formatINR(loan.principal)}</p></div>
          <div><p class="al">Outstanding</p><p class="av red-text">₹${formatINR(outstanding)}</p></div>
          <div><p class="al">Rate</p><p class="av">${loan.interestRate}% p.a.</p></div>
        </div>
        <div>
          <div class="util-label-row">
            <span>${isActive ? 'Repaid' : 'Completed'}</span>
            <span>${repaidPct}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${color}" style="width:${repaidPct}%"></div>
          </div>
        </div>
        <div class="loan-card-footer">
          <span>Tenure: ${loan.tenureMonths} months · EMI: ₹${formatINR(loan.emiAmount)}</span>
          <div class="loan-actions">
            <button class="btn-ghost red-ghost" onclick="deleteLoan('${loan._id}', this)">Remove</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ===== FILTER LOANS =====
function filterLoans(status, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const filtered = status === 'all'
    ? allLoans
    : allLoans.filter(l => l.status === status);

  renderLoans(filtered);
}

// ===== MODAL: SHOW / HIDE =====
function showModal() {
  document.getElementById('addLoanModal').classList.add('open');
  document.getElementById('modalOverlay').classList.add('open');
}

function hideModal() {
  document.getElementById('addLoanModal').classList.remove('open');
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('loanForm').reset();
}

// ===== ADD LOAN (sends to backend) =====
async function addLoan(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const loanData = {
    loanType:     document.getElementById('loanType').value,
    bankName:     document.getElementById('bankName').value,
    accountNo:    document.getElementById('accountNo').value,
    principal:    document.getElementById('principal').value,
    interestRate: document.getElementById('interestRate').value,
    tenureMonths: document.getElementById('tenureMonths').value,
    startDate:    document.getElementById('startDate').value
  };

  try {
    await Loans.add(loanData);
    hideModal();
    showToast('Loan added successfully!');
    await loadLoans(); // refresh the list
  } catch (err) {
    showToast('Failed to add loan: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Add Loan';
  }
}

// ===== DELETE LOAN =====
async function deleteLoan(id, btn) {
  if (!confirm('Are you sure you want to remove this loan? This will also delete all associated EMIs.')) return;

  btn.disabled = true;
  btn.textContent = 'Removing...';

  try {
    await Loans.remove(id);
    showToast('Loan removed successfully.');
    await loadLoans();
  } catch (err) {
    showToast('Failed to remove loan: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Remove';
  }
}
