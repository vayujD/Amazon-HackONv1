const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true
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
  reviewId: {
    type: String,
    required: true,
    unique: true
  },
  reviewerId: {
    type: String,
    required: true
  },
  reviewText: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // ML Model Outputs
  mlPredictions: {
    isFake: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100
    },
    sentiment: {
      type: String,
      enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative']
    },
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1
    },
    // Updated to handle detailed suspicious patterns with confidence scores
    suspiciousPatterns: [{
      bot_activity: {
        confidence: { type: Number, min: 0, max: 1 },
        detected: { type: Boolean, default: false }
      },
      burst_reviews: {
        confidence: { type: Number, min: 0, max: 1 },
        detected: { type: Boolean, default: false }
      },
      copy_paste: {
        confidence: { type: Number, min: 0, max: 1 },
        detected: { type: Boolean, default: false }
      }
    }],
    // Additional ML model outputs for detailed analysis
    burstReviewDetected: {
      type: Boolean,
      default: false
    },
    burstReviewConfidence: {
      type: Number,
      min: 0,
      max: 1
    },
    copyPasteDetected: {
      type: Boolean,
      default: false
    },
    copyPasteConfidence: {
      type: Number,
      min: 0,
      max: 1
    },
    botActivityDetected: {
      type: Boolean,
      default: false
    },
    botActivityConfidence: {
      type: Number,
      min: 0,
      max: 1
    },
    reviewAuthenticity: {
      type: Number,
      min: 0,
      max: 100
    },
    reviewerCredibility: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  // Metadata
  reviewDate: {
    type: Date,
    required: true
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  // Processing Status
  processedByML: {
    type: Boolean,
    default: false
  },
  mlProcessedAt: {
    type: Date
  },
  // Flags
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String
  },
  flagDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'flagged', 'removed', 'under_review'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ 'mlPredictions.isFake': 1 });
reviewSchema.index({ 'mlPredictions.riskScore': 1 });
reviewSchema.index({ 'mlPredictions.burstReviewDetected': 1 });
reviewSchema.index({ 'mlPredictions.copyPasteDetected': 1 });
reviewSchema.index({ 'mlPredictions.botActivityDetected': 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ reviewDate: -1 });

module.exports = mongoose.model('Review', reviewSchema); 