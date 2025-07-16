const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  walletId: {
    type: String,
    unique: true,
    sparse: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  role: {
    type: String,
    enum: ['lender', 'borrower', 'admin'],
    required: false
  },
  borrowerProfile: {
    creditScore: {
      type: Number,
      min: 600,
      max: 900
    },
    appScore: {
      type: Number,
      min: 700,
      max: 900
    },
    loanTenure: {
      type: String,
      enum: ['1M', '3M', '6M', '9M']
    },
    rateOfInterest: {
      type: Number,
      enum: [12, 24, 36, 48]
    },
    repaymentType: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly']
    },
    riskCategory: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    borrowerType: {
      type: String,
      enum: ['Salaried', 'SelfEmployed']
    },
    monthlyIncome: {
      type: String,
      enum: ['Upto 25000', '25000-50000', '50000-100000', '100000-500000']
    },
    loanAmount: {
      type: String,
      enum: ['Upto 25000', '25000-50000', '50000-100000']
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);