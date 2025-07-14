const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 1 })
], authController.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], authController.login);

router.post('/logout', authMiddleware, authController.logout);

router.get('/me', authMiddleware, authController.getMe);

router.put('/role', [
  authMiddleware,
  body('role').isIn(['lender', 'borrower'])
], authController.updateRole);

router.put('/profile', [
  authMiddleware,
  body('phoneNumber').optional().isMobilePhone(),
  body('walletId').optional().isString().trim()
], authController.updateProfile);


module.exports = router;