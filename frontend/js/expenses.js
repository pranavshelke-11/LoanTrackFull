// =============================================
// expenses.js - EXPENSES PAGE (real backend)
// =============================================

let allExpenses = [];

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('expenseForm');
  form.addEventListener('submit', handleAddExpense);
  await loadExpenses();
});

// ===== LOAD EXPENSES FROM BACKEND =====
async function loadExpenses() {
  try {
    const data = await Expenses.getAll();
    allExpenses = data.expenses || [];
    renderExpenses(allExpenses, data.total || 0);
  } catch (err) {
    showToast('Could not load expenses: ' + err.message);
  }
}

// ===== RENDER EXPENSES LIST =====
function renderExpenses(expenses, total) {
  const list    = document.getElementById('list');
  const totalEl = document.getElementById('total');

  totalEl.textContent = formatINR(total);

  if (expenses.length === 0) {
    list.innerHTML = '<li style="color:var(--muted);padding:12px 0;list-style:none;">No expenses yet. Add one above!</li>';
    return;
  }

  list.innerHTML = expenses.map(exp => `
    <li class="expense-item">
      <div class="expense-info">
        <span class="expense-cat">${exp.category}</span>
        <span class="expense-note">${exp.note || ''}</span>
        <span class="expense-date">${formatDate(exp.date)}</span>
      </div>
      <div class="expense-right">
        <span class="expense-amount">₹${formatINR(exp.amount)}</span>
        <button class="btn-ghost red-ghost small" onclick="removeExpense('${exp._id}', this)">Delete</button>
      </div>
    </li>`).join('');
}

// ===== ADD EXPENSE =====
async function handleAddExpense(e) {
  e.preventDefault();

  const amount   = document.getElementById('amount').value;
  const category = document.getElementById('category').value;
  const note     = document.getElementById('note').value;
  const btn      = e.target.querySelector('button[type="submit"]');

  if (!category) {
    showToast('Please select a category.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Adding...';

  try {
    await Expenses.add({ amount, category, note });
    e.target.reset();
    showToast('Expense added!');
    await loadExpenses();
  } catch (err) {
    showToast('Failed to add expense: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Add';
  }
}

// ===== REMOVE EXPENSE =====
async function removeExpense(id, btn) {
  btn.disabled = true;
  btn.textContent = '...';

  try {
    await Expenses.remove(id);
    showToast('Expense deleted.');
    await loadExpenses();
  } catch (err) {
    showToast('Failed to delete: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Delete';
  }
}
