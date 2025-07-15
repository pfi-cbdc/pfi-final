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
  }
};

module.exports = lenderController;