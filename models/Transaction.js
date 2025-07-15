const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['wallet_load', 'lend_money', 'admin_transfer'],
    required: true
  },
  from: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    walletId: String,
    name: String,
    balanceBefore: Number,
    balanceAfter: Number
  },
  to: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    walletId: String,
    name: String,
    balanceBefore: Number,
    balanceAfter: Number
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ 'from.userId': 1, createdAt: -1 });
transactionSchema.index({ 'to.userId': 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);