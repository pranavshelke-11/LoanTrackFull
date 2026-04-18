// =============================================
// MODEL: EMI.js
// =============================================
// This defines the structure of each EMI payment.
// When a user marks an EMI as paid, it's saved here.

const mongoose = require('mongoose');

const EMISchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loanId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  loanName:     { type: String },           // e.g. "Home Loan - SBI"
  dueDate:      { type: Date, required: true },
  emiAmount:    { type: Number, required: true },
  principal:    { type: Number },           // principal portion of this EMI
  interest:     { type: Number },           // interest portion of this EMI

  status: {
    type: String,
    enum: ['upcoming', 'pending', 'paid', 'overdue'],
    default: 'upcoming'
  },

  paidDate:   { type: Date },               // when user actually paid
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('EMI', EMISchema);
