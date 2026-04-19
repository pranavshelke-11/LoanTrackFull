// =============================================
// ROUTE: loans.js
// =============================================
// Handles: Get all loans, Add loan, Update loan, Delete loan
// URLs:
//   GET    /api/loans        → get all loans for logged-in user
//   POST   /api/loans        → add a new loan
//   PUT    /api/loans/:id    → update a loan
//   DELETE /api/loans/:id    → remove a loan

const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const EMI = require('../models/EMI');
const auth = require('../middleware/authMiddleware');

// ===== GET ALL LOANS =====
router.get('/', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.userId }).sort({ createdAt: -1 });

    // Calculate summary stats
    const totalPrincipal = loans.reduce((sum, l) => sum + l.principal, 0);
    const totalOutstanding = loans.reduce((sum, l) => sum + (l.outstanding || l.principal), 0);
    const totalRepaid = loans.reduce((sum, l) => sum + (l.amountRepaid || 0), 0);
    const activeLoans = loans.filter(l => l.status === 'active').length;

    res.json({
      loans,
      summary: {
        totalPrincipal,
        totalOutstanding,
        totalRepaid,
        activeLoans
      }
    });
  } catch (err) {
    console.error('Get loans error:', err);
    res.status(500).json({ message: 'Could not fetch loans.' });
  }
});

// ===== ADD A NEW LOAN =====
router.post('/', auth, async (req, res) => {
  try {
    const { loanType, bankName, accountNo, principal, interestRate, tenureMonths, startDate } = req.body;

    if (!loanType || !bankName || !principal || !interestRate || !tenureMonths || !startDate) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const loan = new Loan({
      userId: req.userId,
      loanType,
      bankName,
      accountNo,
      principal: Number(principal),
      interestRate: Number(interestRate),
      tenureMonths: Number(tenureMonths),
      startDate: new Date(startDate),
      outstanding: Number(principal)
    });

    await loan.save();

    // Auto-generate upcoming EMI records for next 3 months
    const emiRecords = [];
    const start = new Date(startDate);
    for (let i = 0; i < 3; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + i + 1);

      const r = loan.interestRate / 12 / 100;
      const interest = Math.round(loan.outstanding * r);
      const principalPart = Math.round(loan.emiAmount - interest);

      emiRecords.push({
        userId: req.userId,
        loanId: loan._id,
        loanName: `${loanType} - ${bankName}`,
        dueDate,
        emiAmount: loan.emiAmount,
        principal: principalPart,
        interest,
        status: i === 0 ? 'pending' : 'upcoming'
      });
    }

    await EMI.insertMany(emiRecords);

    res.status(201).json({ message: 'Loan added successfully!', loan });
  } catch (err) {
    console.error('Add loan error:', err);
    res.status(500).json({ message: 'Could not add loan.' });
  }
});

// ===== UPDATE A LOAN =====
router.put('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.userId });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found.' });
    }

    Object.assign(loan, req.body);
    await loan.save();

    res.json({ message: 'Loan updated successfully!', loan });
  } catch (err) {
    console.error('Update loan error:', err);
    res.status(500).json({ message: 'Could not update loan.' });
  }
});

// ===== DELETE A LOAN =====
router.delete('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.userId });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found.' });
    }

    await Loan.deleteOne({ _id: req.params.id });
    // Also delete all EMIs belonging to this loan
    await EMI.deleteMany({ loanId: req.params.id });

    res.json({ message: 'Loan removed successfully.' });
  } catch (err) {
    console.error('Delete loan error:', err);
    res.status(500).json({ message: 'Could not remove loan.' });
  }
});

module.exports = router;
