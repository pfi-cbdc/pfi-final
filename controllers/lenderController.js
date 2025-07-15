const { validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

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

      // Store original balances for transaction log
      const lenderBalanceBefore = lender.balance;
      const borrowerBalanceBefore = borrower.balance;

      // Perform the transfer
      lender.balance -= transferAmount;
      borrower.balance += transferAmount;

      // Save both users
      await lender.save();
      await borrower.save();

      // Log the transaction
      await Transaction.create({
        type: 'lend_money',
        from: {
          userId: lender._id,
          walletId: lender.walletId,
          name: lender.name,
          balanceBefore: lenderBalanceBefore,
          balanceAfter: lender.balance
        },
        to: {
          userId: borrower._id,
          walletId: borrower.walletId,
          name: borrower.name,
          balanceBefore: borrowerBalanceBefore,
          balanceAfter: borrower.balance
        },
        amount: transferAmount,
        description: `Lender ${lender.name} lent ₹${transferAmount} to borrower ${borrower.name}`
      });

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
  },

  // Load wallet from admin pool
  loadWallet: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.user.role !== 'lender') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { amount } = req.body;
      const loadAmount = parseFloat(amount);
      const lenderId = req.user._id;

      // Get lender
      const lender = await User.findById(lenderId);
      if (!lender) {
        return res.status(404).json({ message: 'Lender not found' });
      }

      // Find admin user (pool wallet)
      const admin = await User.findOne({ role: 'admin' });
      if (!admin) {
        return res.status(404).json({ message: 'Admin pool wallet not found' });
      }

      // Check if admin has sufficient balance
      if (admin.balance < loadAmount) {
        return res.status(400).json({ message: 'Insufficient balance in admin pool wallet' });
      }

      // Store original balances for transaction log
      const adminBalanceBefore = admin.balance;
      const lenderBalanceBefore = lender.balance;

      // Perform the transfer from admin to lender
      admin.balance -= loadAmount;
      lender.balance += loadAmount;

      // Save both users
      await admin.save();
      await lender.save();

      // Log the transaction
      await Transaction.create({
        type: 'wallet_load',
        from: {
          userId: admin._id,
          walletId: admin.walletId,
          name: admin.name,
          balanceBefore: adminBalanceBefore,
          balanceAfter: admin.balance
        },
        to: {
          userId: lender._id,
          walletId: lender.walletId,
          name: lender.name,
          balanceBefore: lenderBalanceBefore,
          balanceAfter: lender.balance
        },
        amount: loadAmount,
        description: `Lender ${lender.name} loaded ₹${loadAmount} from admin pool`
      });

      res.json({
        success: true,
        message: 'Wallet loaded successfully',
        data: {
          lender: {
            walletId: lender.walletId,
            name: lender.name,
            newBalance: lender.balance
          },
          admin: {
            walletId: admin.walletId,
            name: admin.name,
            newBalance: admin.balance
          },
          amount: loadAmount
        }
      });
    } catch (error) {
      console.error('Error loading wallet:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get transaction history for lender
  getTransactions: async (req, res) => {
    try {
      if (req.user.role !== 'lender') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const lenderId = req.user._id;
      const { page = 1, limit = 50, type } = req.query;
      
      // Build query to find transactions where user is either sender or receiver
      const query = {
        $or: [
          { 'from.userId': lenderId },
          { 'to.userId': lenderId }
        ]
      };

      // Filter by type if specified
      if (type) {
        query.type = type;
      }

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('from.userId', 'name email role')
        .populate('to.userId', 'name email role');

      const total = await Transaction.countDocuments(query);

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = lenderController;