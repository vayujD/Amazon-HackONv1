const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  sellerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sellerName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  businessType: {
    type: String,
    enum: [
      'individual', 'business', 'corporation', 'Corporation', 'Sole Proprietorship', 'Partnership', 'LLC',
      'electronics', 'clothing', 'beauty', 'automotive', 'toys', 'home_garden', 'books', 'sports', 'health',
      'food', 'jewelry', 'furniture', 'fashion', 'accessories', 'garden', 'tools', 'pet_supplies', 'baby',
      'office', 'music', 'movies', 'games', 'art', 'collectibles', 'antiques', 'vintage', 'handmade',
      'digital', 'software', 'services', 'other'
    ],
    default: 'individual'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned', 'pending'],
    default: 'active'
  },
  // Risk Assessment Data
  riskAssessment: {
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    fakeReviews: {
      type: Number,
      default: 0
    },
    fakeReviewPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    // Delivery Violations Tracking
    deliveryViolations: {
      totalOrders: { type: Number, default: 0 },
      fakeProductReceived: { type: Number, default: 0 },
      damagedProductReceived: { type: Number, default: 0 },
      wrongProductReceived: { type: Number, default: 0 },
      lateDelivery: { type: Number, default: 0 },
      missingItems: { type: Number, default: 0 },
      totalViolations: { type: Number, default: 0 },
      violationRate: { type: Number, default: 0, min: 0, max: 100 }
    },
    suspiciousPatterns: {
      burstReviews: { type: Number, default: 0 },
      copyPaste: { type: Number, default: 0 },
      botActivity: { type: Number, default: 0 },
      shortReviews: { type: Number, default: 0 }
    },
    riskFactors: [{
      type: String
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  // Historical Risk Data
  riskHistory: [{
    riskScore: Number,
    riskLevel: String,
    totalReviews: Number,
    fakeReviews: Number,
    fakeReviewPercentage: Number,
    suspiciousPatterns: {
      burstReviews: Number,
      copyPaste: Number,
      botActivity: Number,
      shortReviews: Number
    },
    riskFactors: [String],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Performance Metrics
  performance: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalSales: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    shippingTime: {
      type: Number,
      default: 0
    }
  },
  // Verification Status
  verification: {
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    businessVerified: { type: Boolean, default: false },
    documentsSubmitted: { type: Boolean, default: false },
    verificationDate: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
sellerSchema.index({ 'riskAssessment.riskScore': -1 });
sellerSchema.index({ 'riskAssessment.riskLevel': 1 });
sellerSchema.index({ status: 1 });

// Method to update risk assessment
sellerSchema.methods.updateRiskAssessment = function(riskData) {
  // Store current risk data in history
  this.riskHistory.push({
    riskScore: this.riskAssessment.riskScore,
    riskLevel: this.riskAssessment.riskLevel,
    totalReviews: this.riskAssessment.totalReviews,
    fakeReviews: this.riskAssessment.fakeReviews,
    fakeReviewPercentage: this.riskAssessment.fakeReviewPercentage,
    suspiciousPatterns: { ...this.riskAssessment.suspiciousPatterns },
    riskFactors: [...this.riskAssessment.riskFactors],
    timestamp: new Date()
  });

  // Keep only last 30 entries in history
  if (this.riskHistory.length > 30) {
    this.riskHistory = this.riskHistory.slice(-30);
  }

  // Update current risk assessment
  this.riskAssessment = {
    ...this.riskAssessment,
    ...riskData,
    lastUpdated: new Date()
  };

  return this.save();
};

// Method to get risk trend
sellerSchema.methods.getRiskTrend = function() {
  if (this.riskHistory.length < 2) {
    return 'stable';
  }

  const recent = this.riskHistory[this.riskHistory.length - 1].riskScore;
  const previous = this.riskHistory[this.riskHistory.length - 2].riskScore;
  
  if (recent > previous + 10) return 'increasing';
  if (recent < previous - 10) return 'decreasing';
  return 'stable';
};

module.exports = mongoose.model('Seller', sellerSchema); 