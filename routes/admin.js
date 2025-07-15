const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Dashboard stats
router.get('/dashboard', adminAuth, adminController.getDashboardStats);

// User management routes
router.get('/users', adminAuth, adminController.getAllUsers);
router.get('/users/:id', adminAuth, adminController.getUserById);
router.put('/users/:id', [
  adminAuth,
  body('role').optional().isIn(['lender', 'borrower', 'admin']),
  body('phoneNumber').optional().isMobilePhone(),
  body('walletId').optional().isString().trim(),
  body('balance').optional().isNumeric()
], adminController.updateUser);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

// Lender management routes
router.get('/lenders', adminAuth, adminController.getLenders);

// Borrower management routes
router.get('/borrowers', adminAuth, adminController.getBorrowers);

// Transfer money between wallets
router.post('/transfer', [
  adminAuth,
  body('from').isString().trim().notEmpty(),
  body('to').isString().trim().notEmpty(),
  body('amount').isNumeric().isFloat({ gt: 0 })
], adminController.transferMoney);

module.exports = router;