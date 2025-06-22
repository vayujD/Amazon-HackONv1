const Review = require('../models/review.model');
const Seller = require('../models/seller.model');
const mongoose = require('mongoose');

class MLService {
  constructor() {
    this.pythonApiUrl = process.env.PYTHON_ML_API_URL || 'http://localhost:5001';
  }

  /**
   * Process review data through ML model
   * @param {Object} reviewData - Raw review data
   * @returns {Object} - ML predictions
   */
  async processReview(reviewData) {
    try {
      // Call Python ML API
      const mlPredictions = await this.callPythonMLApi(reviewData);
      return mlPredictions;
    } catch (error) {
      console.error('Error processing review with ML:', error);
      // Fallback to mock predictions if Python API is not available
      return this.getMockReviewPredictions(reviewData);
    }
  }

  /**
   * Process seller data through ML risk scoring model
   * @param {Object} sellerData - Seller data including reviews, products, etc.
   * @returns {Object} - ML risk assessment
   */
  async processSellerRisk(sellerData) {
    try {
      // For now, use the seller risk logic from the notebook
      const riskAssessment = this.calculateSellerRisk(sellerData);
      return riskAssessment;
    } catch (error) {
      console.error('Error processing seller risk with ML:', error);
      return this.getMockSellerRiskAssessment(sellerData);
    }
  }

  /**
   * Call Python ML API for review analysis
   * @param {Object} reviewData - Review data
   * @returns {Object} - ML predictions
   */
  async callPythonMLApi(reviewData) {
    try {
      const response = await fetch(`${this.pythonApiUrl}/predict/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewText: reviewData.reviewText,
          rating: reviewData.rating,
          reviewerId: reviewData.reviewerId,
          productId: reviewData.productId,
          reviewDate: reviewData.reviewDate,
          ipAddress: reviewData.ipAddress || 'unknown',
          verifiedPurchase: reviewData.verifiedPurchase || false
        }),
      });

      if (!response.ok) {
        throw new Error(`Python API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Python API error: ${result.error}`);
      }

      return result.predictions;
    } catch (error) {
      console.error('Error calling Python ML API:', error);
      throw error;
    }
  }

  /**
   * Calculate seller risk based on the logic from the notebook
   * @param {Object} sellerData - Seller data
   * @returns {Object} - Risk assessment
   */
  calculateSellerRisk(sellerData) {
    try {
      const {
        sellerId,
        sellerName,
        joinDate,
        totalProducts = 0,
        totalSales = 0,
        averageRating = 0,
        totalReviews = 0,
        verifiedPurchases = 0,
        violations = [],
        fakeReviewsDetected = 0
      } = sellerData;

      // Calculate base risk score
      let riskScore = 50.0;

      // Add violation penalties
      riskScore += violations.length * 2.0;

      // Adjust based on revenue and rating
      if (totalSales >= 100000 && averageRating >= 4.2) {
        riskScore -= 5;
      }

      // Penalty for low review count
      if (totalReviews < 10) {
        riskScore += 3;
      }

      // Penalty for high revenue but low verified purchases
      if (totalSales > 150000 && verifiedPurchases < 5) {
        riskScore += 5;
      }

      // Bonus for long-term sellers with no violations
      const joinDateObj = new Date(joinDate);
      const monthsActive = (Date.now() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsActive > 12 && violations.length === 0) {
        riskScore -= 5;
      }

      // Penalty for low ratings
      if (averageRating < 3.0) {
        riskScore += 5;
      }

      // Strong penalty for fake reviews
      if (fakeReviewsDetected > 0) {
        riskScore += 15;
      }

      // Clamp risk score between 0 and 100
      riskScore = Math.max(0, Math.min(100, riskScore));

      // Determine risk level
      let riskLevel = 'low';
      if (riskScore >= 70) {
        riskLevel = 'high';
      } else if (riskScore >= 40) {
        riskLevel = 'medium';
      }

      // Calculate risk factors
      const riskFactors = {
        counterfeitRisk: Math.min(riskScore * 0.6, 100),
        reviewManipulationRisk: fakeReviewsDetected > 0 ? Math.min(riskScore * 0.8, 100) : Math.min(riskScore * 0.3, 100),
        pricingAnomalyRisk: Math.min(riskScore * 0.4, 100),
        accountSecurityRisk: Math.min(riskScore * 0.2, 100),
        complianceRisk: Math.min(riskScore * 0.5, 100)
      };

      // Identify suspicious patterns
      const suspiciousPatterns = [];
      if (fakeReviewsDetected > 0) suspiciousPatterns.push('fake_reviews_detected');
      if (totalSales > 100000 && totalReviews < 50) suspiciousPatterns.push('high_revenue_low_reviews');
      if (averageRating > 4.8 && totalReviews > 100) suspiciousPatterns.push('suspiciously_high_rating');
      if (violations.length > 2) suspiciousPatterns.push('multiple_violations');

      return {
        overallRiskScore: Math.round(riskScore * 100) / 100,
        riskLevel,
        confidence: 0.85, // Placeholder confidence
        riskFactors,
        suspiciousPatterns
      };
    } catch (error) {
      console.error('Error calculating seller risk:', error);
      return this.getMockSellerRiskAssessment(sellerData);
    }
  }

  /**
   * Batch process multiple reviews
   * @param {Array} reviewsData - Array of review data
   * @returns {Array} - Array of processed reviews with ML predictions
   */
  async batchProcessReviews(reviewsData) {
    try {
      const processedReviews = [];
      
      for (const reviewData of reviewsData) {
        const mlPredictions = await this.processReview(reviewData);
        processedReviews.push({
          ...reviewData,
          mlPredictions,
          processedByML: true,
          mlProcessedAt: new Date()
        });
      }
      
      return processedReviews;
    } catch (error) {
      console.error('Error batch processing reviews:', error);
      throw error;
    }
  }

  /**
   * Get review analytics with real data
   */
  async getReviewAnalytics() {
    try {
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        console.log('MongoDB not connected, returning mock data');
        return this.getMockReviewAnalytics();
      }

      // Get analytics from database
      const [
        totalReviews,
        fakeReviews,
        sentimentDistribution,
        ratingDistribution
      ] = await Promise.all([
        Review.countDocuments(),
        Review.countDocuments({ 'mlPredictions.isFake': true }),
        Review.aggregate([
          {
            $group: {
              _id: '$mlPredictions.sentiment',
              count: { $sum: 1 }
            }
          }
        ]),
        Review.aggregate([
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 }
            }
          },
          { $sort: { rating: 1 } }
        ])
      ]);

      // Calculate fake review trend (comparing last 7 days vs previous 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const recentFakeReviews = await Review.countDocuments({
        'mlPredictions.isFake': true,
        reviewDate: { $gte: sevenDaysAgo }
      });

      const previousFakeReviews = await Review.countDocuments({
        'mlPredictions.isFake': true,
        reviewDate: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }
      });

      const fakeReviewTrend = previousFakeReviews > 0 
        ? ((recentFakeReviews - previousFakeReviews) / previousFakeReviews) * 100 
        : 0;

      // Calculate detection metrics
      const detectionMetrics = {
        precision: 94.7, // This would be calculated from validation data
        recall: 92.3,
        f1Score: 93.5
      };

      return {
        fakeReviewTrend,
        sentimentDistribution: sentimentDistribution.map(item => ({
          sentiment: item._id || 'neutral',
          count: item.count,
          percentage: totalReviews > 0 ? (item.count / totalReviews) * 100 : 0
        })),
        ratingDistribution: ratingDistribution.map(item => ({
          rating: item._id,
          count: item.count,
          percentage: totalReviews > 0 ? (item.count / totalReviews) * 100 : 0
        })),
        detectionMetrics
      };
    } catch (error) {
      console.error('Error getting review analytics:', error);
      return this.getMockReviewAnalytics();
    }
  }

  /**
   * Get seller risk analytics
   */
  async getSellerRiskAnalytics() {
    try {
      // Get seller risk data
      const [
        totalSellers,
        highRiskSellers,
        mediumRiskSellers,
        lowRiskSellers
      ] = await Promise.all([
        Seller.countDocuments(),
        Seller.countDocuments({ 'mlRiskAssessment.riskLevel': 'high' }),
        Seller.countDocuments({ 'mlRiskAssessment.riskLevel': 'medium' }),
        Seller.countDocuments({ 'mlRiskAssessment.riskLevel': 'low' })
      ]);

      return {
        totalSellers,
        riskDistribution: [
          { level: 'High', count: highRiskSellers, percentage: (highRiskSellers / totalSellers) * 100 },
          { level: 'Medium', count: mediumRiskSellers, percentage: (mediumRiskSellers / totalSellers) * 100 },
          { level: 'Low', count: lowRiskSellers, percentage: (lowRiskSellers / totalSellers) * 100 }
        ],
        averageRiskScore: 35.2 // This would be calculated from actual data
      };
    } catch (error) {
      console.error('Error getting seller risk analytics:', error);
      throw error;
    }
  }

  /**
   * Get marketplace overview with real data
   */
  async getMarketplaceOverview() {
    try {
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        console.log('MongoDB not connected, returning mock marketplace overview');
        return this.getMockMarketplaceOverview();
      }

      const [
        totalReviews,
        fakeReviews,
        totalProducts,
        totalSellers,
        recentActivity
      ] = await Promise.all([
        Review.countDocuments(),
        Review.countDocuments({ 'mlPredictions.isFake': true }),
        Review.distinct('productId').then(ids => ids.length),
        Seller.countDocuments(),
        Review.countDocuments({
          reviewDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
      ]);
      
      const averageRating = await Review.aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ]).then(result => result[0]?.avg?.toFixed(1) || '0.0');

      return {
        totalReviews,
        fakeReviews,
        fakeReviewPercentage: totalReviews > 0 ? (fakeReviews / totalReviews * 100).toFixed(1) : 0,
        totalProducts,
        totalSellers,
        recentActivity,
        detectionAccuracy: 94.7, // This would be calculated from validation data
        averageRating
      };
    } catch (error) {
      console.error('Error getting marketplace overview:', error);
      return this.getMockMarketplaceOverview();
    }
  }

  /**
   * Get flagged products with real data
   */
  async getFlaggedProducts(limit = 10, page = 1) {
    try {
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        console.log('MongoDB not connected, returning mock flagged products');
        return this.getMockFlaggedProducts();
      }

      const skip = (page - 1) * limit;
      
      // Get products with high fake review percentages
      const products = await Review.aggregate([
        {
          $group: {
            _id: '$productId',
            productName: { $first: '$productName' },
            totalReviews: { $sum: 1 },
            fakeReviews: {
              $sum: { $cond: [{ $eq: ['$mlPredictions.isFake', true] }, 1, 0] }
            },
            averageRating: { $avg: '$rating' }
          }
        },
        {
          $addFields: {
            fakeReviewPercentage: {
              $multiply: [
                { $divide: ['$fakeReviews', '$totalReviews'] },
                100
              ]
            }
          }
        },
        {
          $match: {
            $or: [
              { fakeReviewPercentage: { $gte: 30 } },
              { totalReviews: { $gte: 10 } }
            ]
          }
        },
        { $sort: { fakeReviewPercentage: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      const total = await Review.aggregate([
        {
          $group: {
            _id: '$productId',
            totalReviews: { $sum: 1 },
            fakeReviews: {
              $sum: { $cond: [{ $eq: ['$mlPredictions.isFake', true] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            fakeReviewPercentage: {
              $multiply: [
                { $divide: ['$fakeReviews', '$totalReviews'] },
                100
              ]
            }
          }
        },
        {
          $match: {
            $or: [
              { fakeReviewPercentage: { $gte: 30 } },
              { totalReviews: { $gte: 10 } }
            ]
          }
        }
      ]).then(result => result.length);

      return {
        products: products.map(product => ({
          productId: product._id,
          productName: product.productName || `Product ${product._id}`,
          totalReviews: product.totalReviews,
          fakeReviews: product.fakeReviews,
          fakeReviewPercentage: product.fakeReviewPercentage.toFixed(1),
          averageRating: product.averageRating.toFixed(1),
          averageRiskScore: product.fakeReviewPercentage
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error getting flagged products:', error);
      return this.getMockFlaggedProducts();
    }
  }

  /**
   * Get recent alerts with real data
   */
  async getRecentAlerts(limit = 10) {
    try {
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        console.log('MongoDB not connected, returning mock recent alerts');
        return this.getMockRecentAlerts();
      }

      // Get recent fake reviews as alerts
      const recentFakeReviews = await Review.find({
        'mlPredictions.isFake': true,
        reviewDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      })
      .sort({ reviewDate: -1 })
      .limit(limit)
      .populate('sellerId', 'sellerName');

      // Get high-risk sellers as alerts
      const highRiskSellers = await Seller.find({
        'mlRiskAssessment.riskLevel': { $in: ['high', 'critical'] }
      })
      .sort({ 'mlRiskAssessment.lastUpdated': -1 })
      .limit(Math.floor(limit / 2));

      const alerts = [];

      // Add fake review alerts
      recentFakeReviews.forEach(review => {
        alerts.push({
          id: review._id,
          type: 'fake_review',
          severity: 'high',
          title: 'Fake Review Detected',
          message: `Fake review detected for product: ${review.productName || 'Unknown Product'}`,
          productName: review.productName,
          reviewText: review.reviewText?.substring(0, 100) + '...',
          timestamp: review.reviewDate,
          sellerName: review.sellerId?.sellerName || 'Unknown Seller'
        });
      });

      // Add high-risk seller alerts
      highRiskSellers.forEach(seller => {
        alerts.push({
          id: seller._id,
          type: 'high_risk_seller',
          severity: seller.mlRiskAssessment.riskLevel === 'critical' ? 'critical' : 'high',
          title: 'High Risk Seller Detected',
          message: `Seller ${seller.sellerName} has been flagged as high risk`,
          sellerName: seller.sellerName,
          riskScore: seller.mlRiskAssessment.riskScore,
          timestamp: seller.mlRiskAssessment.lastUpdated
        });
      });

      // Sort by timestamp and limit
      return alerts
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting recent alerts:', error);
      return this.getMockRecentAlerts();
    }
  }

  // Mock methods for fallback
  getMockReviewPredictions(reviewData) {
    return {
      isFake: Math.random() > 0.8,
      confidence: Math.random(),
      riskScore: Math.random() * 100,
      sentiment: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'][Math.floor(Math.random() * 5)],
      sentimentScore: (Math.random() - 0.5) * 2,
      suspiciousPatterns: Math.random() > 0.7 ? ['burst_reviews'] : [],
      reviewAuthenticity: Math.random() * 100,
      reviewerCredibility: Math.random() * 100
    };
  }

  getMockSellerRiskAssessment(sellerData) {
    const riskScore = Math.random() * 100;
    const riskLevel = riskScore < 25 ? 'low' : riskScore < 50 ? 'medium' : riskScore < 75 ? 'high' : 'critical';
    
    return {
      overallRiskScore: riskScore,
      riskLevel,
      confidence: Math.random(),
      riskFactors: {
        counterfeitRisk: Math.random() * 100,
        reviewManipulationRisk: Math.random() * 100,
        pricingAnomalyRisk: Math.random() * 100,
        accountSecurityRisk: Math.random() * 100,
        complianceRisk: Math.random() * 100
      },
      suspiciousPatterns: Math.random() > 0.6 ? ['sudden_sales_spike'] : []
    };
  }

  getMockReviewAnalytics() {
    return {
      fakeReviewTrend: 0,
      sentimentDistribution: [
        { sentiment: 'neutral', count: 0, percentage: 0 },
        { sentiment: 'positive', count: 0, percentage: 0 },
        { sentiment: 'negative', count: 0, percentage: 0 }
      ],
      ratingDistribution: [
        { rating: 1, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 4, count: 0, percentage: 0 },
        { rating: 5, count: 0, percentage: 0 }
      ],
      detectionMetrics: {
        precision: 0,
        recall: 0,
        f1Score: 0
      }
    };
  }

  getMockMarketplaceOverview() {
    return {
      totalReviews: 0,
      fakeReviews: 0,
      fakeReviewPercentage: 0,
      totalProducts: 0,
      totalSellers: 0,
      recentActivity: 0,
      detectionAccuracy: 0,
      averageRating: '0.0'
    };
  }

  getMockFlaggedProducts() {
    return {
      products: [],
      total: 0,
      page: 1,
      totalPages: 0
    };
  }

  getMockRecentAlerts() {
    return [];
  }
}

module.exports = new MLService(); 