const { validationResult } = require('express-validator');
const User = require('../models/User');

const lenderController = {
  getProfile: (req, res) => {
    if (req.user.role !== 'lender') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        phoneNumber: req.user.phoneNumber,
        walletId: req.user.walletId,
        balance: req.user.balance
      }
    });
  },

  updateProfile: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.user.role !== 'lender') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { phoneNumber, walletId } = req.body;
      
      const updateData = {};
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (walletId !== undefined) updateData.walletId = walletId;
      
      const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true }
      ).select('-password');

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          phoneNumber: user.phoneNumber,
          walletId: user.walletId,
          balance: user.balance
        }
      });
    } catch (error) {
      console.error('Lender profile update error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getBorrowers: async (req, res) => {
    try {
      if (req.user.role !== 'lender') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const borrowers = await User.find({ role: 'borrower' })
        .select('-password')
        .sort({ createdAt: -1 });

      res.json({
        data: borrowers
      });
    } catch (error) {
      console.error('Get borrowers error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Transfer money from lender to borrower
  transferMoney: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.user.role !== 'lender') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { to, amount } = req.body;
      const transferAmount = parseFloat(amount);
      const lenderId = req.user._id;

      // Get lender (from user)
      const lender = await User.findById(lenderId);
      if (!lender) {
        return res.status(404).json({ message: 'Lender not found' });
      }

      // Find destination user by walletId
      const borrower = await User.findOne({ walletId: to });
      if (!borrower) {
        return res.status(404).json({ message: 'Borrower wallet not found' });
      }

      // Check if lender has sufficient balance
      if (lender.balance < transferAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Perform the transfer
      lender.balance -= transferAmount;
      borrower.balance += transferAmount;

      // Save both users
      await lender.save();
      await borrower.save();

      res.json({
        success: true,
        message: 'Transfer completed successfully',
        data: {
          from: {
            walletId: lender.walletId,
            name: lender.name,
            newBalance: lender.balance
          },
          to: {
            walletId: borrower.walletId,
            name: borrower.name,
            newBalance: borrower.balance
          },
          amount: transferAmount
        }
      });
    } catch (error) {
      console.error('Error transferring money:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = lenderController;