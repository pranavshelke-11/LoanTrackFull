// =============================================
// MODEL: Expense.js
// =============================================
// This stores all expense entries added by the user.

const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:   { type: Number, required: true },
  category: { type: String, required: true },  // Food, Travel, Bills, Shopping
  note:     { type: String },
  date:     { type: Date, default: Date.now },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
