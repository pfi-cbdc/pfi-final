const express = require('express');
const { body } = require('express-validator');
const borrowerController = require('../controllers/borrowerController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get borrower profile
router.get('/profile', authMiddleware, borrowerController.getProfile);

// Update borrower profile
router.put('/profile', [
  authMiddleware,
  body('phoneNumber').optional().isMobilePhone(),
  body('walletId').optional().isString().trim(),
  body('creditScore').optional().isInt({ min: 600, max: 900 }),
  body('appScore').optional().isInt({ min: 700, max: 900 }),
  body('loanTenure').optional().isIn(['1M', '3M', '6M', '9M']),
  body('rateOfInterest').optional().isIn([12, 24, 36, 48]),
  body('repaymentType').optional().isIn(['Daily', 'Weekly', 'Monthly']),
  body('riskCategory').optional().isIn(['Low', 'Medium', 'High']),
  body('borrowerType').optional().isIn(['Salaried', 'SelfEmployed']),
  body('monthlyIncome').optional().isIn(['Upto 25000', '25000-50000', '50000-100000', '100000-500000']),
  body('loanAmount').optional().isIn(['Upto 25000', '25000-50000', '50000-100000']),
  body('description').optional().isString().trim().isLength({ max: 500 })
], borrowerController.updateProfile);

module.exports = router;