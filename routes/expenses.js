// =============================================
// ROUTE: expenses.js
// =============================================
// Handles: Get all expenses, Add expense, Delete expense
// URLs:
//   GET    /api/expenses        → get all expenses
//   POST   /api/expenses        → add expense
//   DELETE /api/expenses/:id    → remove expense

const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/authMiddleware');

// ===== GET ALL EXPENSES =====
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({ createdAt: -1 });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group by category for summary
    const byCategory = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    res.json({ expenses, total, byCategory });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ message: 'Could not fetch expenses.' });
  }
});

// ===== ADD EXPENSE =====
router.post('/', auth, async (req, res) => {
  try {
    const { amount, category, note } = req.body;

    if (!amount || !category) {
      return res.status(400).json({ message: 'Amount and category are required.' });
    }

    const expense = new Expense({
      userId: req.userId,
      amount: Number(amount),
      category,
      note
    });

    await expense.save();
    res.status(201).json({ message: 'Expense added!', expense });
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ message: 'Could not add expense.' });
  }
});

// ===== DELETE EXPENSE =====
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    await Expense.deleteOne({ _id: req.params.id });
    res.json({ message: 'Expense deleted.' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ message: 'Could not delete expense.' });
  }
});

module.exports = router;
