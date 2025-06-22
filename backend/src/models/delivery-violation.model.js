const mongoose = require('mongoose');

const deliveryViolationSchema = new mongoose.Schema({
  violationId: {
    type: String,
    unique: true
  },
  sellerId: {
    type: String,
    required: true,
    index: true
  },
  sellerName: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  customerId: {
    type: String,
    required: true
  },
  violationType: {
    type: String,
    enum: ['fake_product', 'damaged_product', 'wrong_product', 'late_delivery', 'missing_items'],
    required: true
  },
  violationDescription: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  orderValue: {
    type: Number,
    default: 0
  },
  orderDate: {
    type: Date,
    required: true
  },
  violationDate: {
    type: Date,
    required: true
  },
  resolutionStatus: {
    type: String,
    enum: ['pending', 'resolved', 'refunded', 'replaced', 'ignored'],
    default: 'pending'
  },
  resolutionDate: {
    type: Date
  },
  customerCompensation: {
    type: Number,
    default: 0
  },
  sellerPenalty: {
    type: Number,
    default: 0
  },
  evidence: {
    customerPhotos: [String],
    customerDescription: String,
    sellerResponse: String,
    platformInvestigation: String
  },
  impactScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
deliveryViolationSchema.index({ sellerId: 1, violationDate: -1 });
deliveryViolationSchema.index({ violationType: 1, severity: 1 });
deliveryViolationSchema.index({ resolutionStatus: 1 });

// Pre-save middleware to update timestamps
deliveryViolationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate violation ID
deliveryViolationSchema.pre('save', function(next) {
  if (!this.violationId) {
    this.violationId = `VIOL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('DeliveryViolation', deliveryViolationSchema); 