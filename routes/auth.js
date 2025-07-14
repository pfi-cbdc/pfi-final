const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        borrowerProfile: user.borrowerProfile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        borrowerProfile: user.borrowerProfile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      borrowerProfile: req.user.borrowerProfile
    }
  });
});

router.put('/role', [
  authMiddleware,
  body('role').isIn(['lender', 'borrower'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { role },
      { new: true }
    ).select('-password');

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        borrowerProfile: user.borrowerProfile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/borrower-profile', [
  authMiddleware,
  body('creditScore').optional().isInt({ min: 600, max: 900 }),
  body('appScore').optional().isInt({ min: 700, max: 900 }),
  body('loanTenure').optional().isIn(['1M', '3M', '6M', '9M']),
  body('rateOfInterest').optional().isIn([12, 24, 36, 48]),
  body('repaymentType').optional().isIn(['Daily', 'Weekly', 'Monthly']),
  body('riskCategory').optional().isIn(['Low', 'Medium', 'High']),
  body('borrowerType').optional().isIn(['Salaried', 'SelfEmployed']),
  body('monthlyIncome').optional().isIn(['Upto 25000', '25000-50000', '50000-100000', '100000-500000']),
  body('loanAmount').optional().isIn(['Upto 25000', '25000-50000', '50000-100000'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'borrower') {
      return res.status(403).json({ message: 'Only borrowers can update borrower profile' });
    }

    const borrowerProfileData = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { borrowerProfile: borrowerProfileData },
      { new: true }
    ).select('-password');

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        borrowerProfile: user.borrowerProfile
      }
    });
  } catch (error) {
    console.error('Borrower profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;