const User = require('../models/User');

const adminController = {
  // Get all lenders
  getLenders: async (req, res) => {
    try {
      const lenders = await User.find({ role: 'lender' })
        .select('-password')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: lenders.length,
        data: lenders
      });
    } catch (error) {
      console.error('Error fetching lenders:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all borrowers
  getBorrowers: async (req, res) => {
    try {
      const borrowers = await User.find({ role: 'borrower' })
        .select('-password')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: borrowers.length,
        data: borrowers
      });
    } catch (error) {
      console.error('Error fetching borrowers:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({})
        .select('-password')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update user status/role
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { role, phoneNumber, walletId, balance } = req.body;

      const updateData = {};
      if (role) updateData.role = role;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (walletId !== undefined) updateData.walletId = walletId;
      if (balance !== undefined) updateData.balance = balance;

      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Prevent admin from deleting themselves
      if (id === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({});
      const totalLenders = await User.countDocuments({ role: 'lender' });
      const totalBorrowers = await User.countDocuments({ role: 'borrower' });
      const totalAdmins = await User.countDocuments({ role: 'admin' });

      const stats = {
        totalUsers,
        totalLenders,
        totalBorrowers,
        totalAdmins,
        usersWithoutRole: totalUsers - totalLenders - totalBorrowers - totalAdmins
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Transfer money between wallets
  transferMoney: async (req, res) => {
    try {
      const { from, to, amount } = req.body;
      const transferAmount = parseFloat(amount);

      // Find source and destination users by walletId
      const fromUser = await User.findOne({ walletId: from });
      const toUser = await User.findOne({ walletId: to });

      if (!fromUser) {
        return res.status(404).json({ message: 'Source wallet not found' });
      }

      if (!toUser) {
        return res.status(404).json({ message: 'Destination wallet not found' });
      }

      // Check if source wallet has sufficient balance
      if (fromUser.balance < transferAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Perform the transfer
      fromUser.balance -= transferAmount;
      toUser.balance += transferAmount;

      // Save both users
      await fromUser.save();
      await toUser.save();

      res.json({
        success: true,
        message: 'Transfer completed successfully',
        data: {
          from: {
            walletId: fromUser.walletId,
            name: fromUser.name,
            newBalance: fromUser.balance
          },
          to: {
            walletId: toUser.walletId,
            name: toUser.name,
            newBalance: toUser.balance
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

module.exports = adminController;