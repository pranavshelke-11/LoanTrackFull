// =============================================
// ROUTE: emis.js
// =============================================
// Handles: Get all EMIs, Mark EMI as paid
// URLs:
//   GET   /api/emis           → get all EMIs for logged-in user
//   PUT   /api/emis/:id/pay   → mark an EMI as paid

const express = require('express');
const router = express.Router();
const EMI = require('../models/EMI');
const Loan = require('../models/Loan');
const auth = require('../middleware/authMiddleware');

// ===== GET ALL EMIs =====
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.userId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const emis = await EMI.find(filter).sort({ dueDate: 1 });

    // Summary
    const totalPaid = emis.filter(e => e.status === 'paid').reduce((s, e) => s + e.emiAmount, 0);
    const nextDue = emis.find(e => e.status === 'pending' || e.status === 'upcoming');

    res.json({
      emis,
      summary: {
        totalPaid,
        nextDueAmount: nextDue ? nextDue.emiAmount : 0,
        nextDueDate: nextDue ? nextDue.dueDate : null
      }
    });
  } catch (err) {
    console.error('Get EMIs error:', err);
    res.status(500).json({ message: 'Could not fetch EMIs.' });
  }
});

// ===== MARK EMI AS PAID =====
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const emi = await EMI.findOne({ _id: req.params.id, userId: req.userId });
    if (!emi) {
      return res.status(404).json({ message: 'EMI not found.' });
    }

    emi.status = 'paid';
    emi.paidDate = new Date();
    await emi.save();

    // Update the loan's outstanding balance and amount repaid
    const loan = await Loan.findById(emi.loanId);
    if (loan) {
      loan.amountRepaid = (loan.amountRepaid || 0) + (emi.principal || 0);
      loan.outstanding = Math.max(0, loan.outstanding - (emi.principal || 0));

      // If fully repaid, mark loan as closed
      if (loan.outstanding <= 0) {
        loan.status = 'closed';
      }
      await loan.save();
    }

    res.json({ message: 'EMI marked as paid!', emi });
  } catch (err) {
    console.error('Pay EMI error:', err);
    res.status(500).json({ message: 'Could not update EMI.' });
  }
});

module.exports = router;
