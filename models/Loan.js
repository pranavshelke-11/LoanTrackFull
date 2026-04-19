// =============================================
// MODEL: Loan.js
// =============================================
// This defines the structure of a Loan in the database.
// Every loan a user adds will be saved with these fields.

const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  // userId links this loan to the logged-in user
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  loanType:     { type: String, required: true },  // e.g. Home Loan, Personal Loan
  bankName:     { type: String, required: true },  // e.g. SBI Bank
  accountNo:    { type: String },                  // e.g. ****4321
  principal:    { type: Number, required: true },  // Original loan amount
  interestRate: { type: Number, required: true },  // % per annum
  tenureMonths: { type: Number, required: true },  // e.g. 240 months
  startDate:    { type: Date, required: true },

  // These are calculated automatically
  emiAmount:    { type: Number },                  // Monthly EMI
  outstanding:  { type: Number },                  // Remaining balance
  amountRepaid: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },

  createdAt: { type: Date, default: Date.now }
});

// Auto-calculate EMI before saving
LoanSchema.pre('save', function (next) {
  const P = this.principal;
  const r = this.interestRate / 12 / 100;
  const N = this.tenureMonths;

  if (r === 0) {
    this.emiAmount = P / N;
  } else {
    this.emiAmount = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
  }
  this.emiAmount = Math.round(this.emiAmount);

  if (this.outstanding === undefined) {
    this.outstanding = this.principal;
  }

  next();
});

module.exports = mongoose.model('Loan', LoanSchema);
