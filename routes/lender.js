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

module.exports = router;