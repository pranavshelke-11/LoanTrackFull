// =============================================
// emi.js - EMI TRACKER PAGE (real backend)
// =============================================

let allEMIs = [];

document.addEventListener('DOMContentLoaded', async () => {
  calculateEMI(); // run calculator on load
  await loadEMIs();
});

// ===== LOAD ALL EMIs FROM BACKEND =====
async function loadEMIs() {
  const tbody = document.getElementById('emiTableBody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:20px;">Loading...</td></tr>';

  try {
    const data = await EMIs.getAll();
    allEMIs = data.emis || [];

    // Update summary stats
    if (data.summary) {
      const el = document.getElementById('emiSummaryNextDue');
      if (el && data.summary.nextDueDate) {
        el.textContent = `Next EMI: ₹${formatINR(data.summary.nextDueAmount)} due ${formatDate(data.summary.nextDueDate)}`;
      }
    }

    renderEMITable(allEMIs);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--danger);padding:20px;">Could not load EMIs: ${err.message}</td></tr>`;
  }
}

// ===== RENDER EMI TABLE =====
function renderEMITable(emis) {
  const tbody = document.getElementById('emiTableBody');

  if (emis.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:20px;">No EMI records found. Add a loan first.</td></tr>';
    return;
  }

  tbody.innerHTML = emis.map((emi, idx) => {
    const statusClass = { paid: 'paid', pending: 'pending', overdue: 'pending', upcoming: 'upcoming' }[emi.status] || 'upcoming';
    const label = emi.status.charAt(0).toUpperCase() + emi.status.slice(1);

    const actionBtn = emi.status === 'paid'
      ? `<button class="btn-ghost small">Receipt</button>`
      : emi.status === 'pending' || emi.status === 'overdue'
        ? `<button class="btn-primary small" onclick="markEMIPaid('${emi._id}', this)">Pay Now</button>`
        : `<button class="btn-ghost small">Details</button>`;

    return `
      <tr id="emi-row-${emi._id}">
        <td>${idx + 1}</td>
        <td>${emi.loanName || 'Loan'}</td>
        <td>${formatDate(emi.dueDate)}</td>
        <td>₹${formatINR(emi.emiAmount)}</td>
        <td>₹${formatINR(emi.principal)}</td>
        <td>₹${formatINR(emi.interest)}</td>
        <td><span class="status ${statusClass}" id="emi-status-${emi._id}">${label}</span></td>
        <td>${actionBtn}</td>
      </tr>`;
  }).join('');
}

// ===== MARK EMI AS PAID =====
async function markEMIPaid(id, btn) {
  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    await EMIs.markPaid(id);

    // Update the row UI without reloading
    const statusEl = document.getElementById(`emi-status-${id}`);
    if (statusEl) {
      statusEl.textContent = 'Paid';
      statusEl.className = 'status paid';
    }
    btn.textContent = 'Receipt';
    btn.className = 'btn-ghost small';
    btn.disabled = false;
    btn.onclick = null;

    showToast('EMI marked as paid!');
  } catch (err) {
    showToast('Failed to mark EMI as paid: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Pay Now';
  }
}

// ===== FILTER EMI TABLE =====
function filterMonth(val) {
  const filtered = val === 'all'
    ? allEMIs
    : allEMIs.filter(e => e.status === val || (val === 'overdue' && e.status === 'overdue'));
  renderEMITable(filtered);
}

// ===== EMI CALCULATOR (no backend needed - pure math) =====
function calculateEMI() {
  const P = parseFloat(document.getElementById('calcPrincipal').value) || 0;
  const annualRate = parseFloat(document.getElementById('calcRate').value) || 0;
  const N = parseInt(document.getElementById('calcTenure').value) || 1;

  const r = annualRate / 12 / 100;
  let emi = 0;

  if (r === 0) {
    emi = P / N;
  } else {
    emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
  }

  const totalPayment = emi * N;
  const totalInterest = totalPayment - P;

  document.getElementById('emiResult').textContent = '₹' + formatINR(Math.round(emi));
  document.getElementById('totalInterest').textContent = 'Total Interest: ₹' + formatINR(Math.round(totalInterest));
}
