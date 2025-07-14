const { validationResult } = require('express-validator');
const User = require('../models/User');

const borrowerController = {
  updateProfile: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.user.role !== 'borrower') {
        return res.status(403).json({ message: 'Only borrowers can update borrower profile' });
      }

      const { phoneNumber, walletId, ...borrowerProfileData } = req.body;
      
      const updateData = {};
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (walletId !== undefined) updateData.walletId = walletId;
      if (Object.keys(borrowerProfileData).length > 0) {
        updateData.borrowerProfile = borrowerProfileData;
      }
      
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
          balance: user.balance,
          borrowerProfile: user.borrowerProfile
        }
      });
    } catch (error) {
      console.error('Borrower profile update error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getProfile: (req, res) => {
    if (req.user.role !== 'borrower') {
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
        balance: req.user.balance,
        borrowerProfile: req.user.borrowerProfile
      }
    });
  }
};

module.exports = borrowerController;