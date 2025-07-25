const express = require('express');
const { body } = require('express-validator');
const lenderController = require('../controllers/lenderController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get lender profile
router.get('/profile', authMiddleware, lenderController.getProfile);

// Update lender profile
router.put('/profile', [
  authMiddleware,
  body('phoneNumber').optional().isMobilePhone(),
  body('walletId').optional().isString().trim()
], lenderController.updateProfile);

// Get borrowers for lender
router.get('/borrowers', authMiddleware, lenderController.getBorrowers);

// Transfer money from lender to borrower
router.post('/transfer', [
  authMiddleware,
  body('to').isString().trim().notEmpty(),
  body('amount').isNumeric().isFloat({ gt: 0 })
], lenderController.transferMoney);

// Load wallet from admin pool
router.post('/load-wallet', [
  authMiddleware,
  body('amount').isNumeric().isFloat({ gt: 0 })
], lenderController.loadWallet);

// Get transaction history
router.get('/transactions', authMiddleware, lenderController.getTransactions);

module.exports = router;