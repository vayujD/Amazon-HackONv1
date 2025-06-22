const MLService = require('../services/ml.service');
const Review = require('../models/review.model');
const Seller = require('../models/seller.model');
const DeliveryViolation = require('../models/delivery-violation.model');
const mongoose = require('mongoose');

class MLController {
  /**
   * Process a single review with ML analysis
   */
  async processReview(req, res) {
    try {
      const reviewData = req.body;
      
      // Process with ML
      const mlPredictions = await MLService.processReview(reviewData);
      
      // Generate a unique review ID if not provided
      const reviewId = reviewData.reviewId || `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Map ML predictions to the new schema structure
      const mappedPredictions = {
        ...mlPredictions,
        // Map individual detection flags for easier querying
        burstReviewDetected: mlPredictions.suspiciousPatterns?.burst_reviews?.detected || false,
        burstReviewConfidence: mlPredictions.suspiciousPatterns?.burst_reviews?.confidence || 0,
        copyPasteDetected: mlPredictions.suspiciousPatterns?.copy_paste?.detected || false,
        copyPasteConfidence: mlPredictions.suspiciousPatterns?.copy_paste?.confidence || 0,
        botActivityDetected: mlPredictions.suspiciousPatterns?.bot_activity?.detected || false,
        botActivityConfidence: mlPredictions.suspiciousPatterns?.bot_activity?.confidence || 0,
        // Ensure suspiciousPatterns is properly formatted
        suspiciousPatterns: mlPredictions.suspiciousPatterns || {}
      };
      
      // Store the review with ML predictions
      const review = new Review({
        reviewId: reviewId,
        reviewText: reviewData.reviewText,
        rating: reviewData.rating,
        reviewerId: reviewData.reviewerId || 'anonymous',
        productId: reviewData.productId || 'unknown_product',
        productName: reviewData.productName || 'Unknown Product',
        sellerId: reviewData.sellerId || 'unknown_seller',
        sellerName: reviewData.sellerName || 'Unknown Seller',
        reviewDate: reviewData.reviewDate || new Date(),
        ipAddress: reviewData.ipAddress || 'unknown',
        verifiedPurchase: reviewData.verifiedPurchase || false,
        mlPredictions: mappedPredictions,
        processedByML: true,
        mlProcessedAt: new Date()
      });
      
      await review.save();
      
      res.json({
        success: true,
        message: 'Review processed and stored successfully',
        reviewId: review._id,
        predictions: mappedPredictions
      });
      
    } catch (error) {
      console.error('Error processing review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process review',
        error: error.message
      });
    }
  }

  /**
   * Process multiple reviews in batch
   */
  async processBatchReviews(req, res) {
    try {
      const { reviews } = req.body;
      
      if (!reviews || !Array.isArray(reviews)) {
        return res.status(400).json({
          success: false,
          message: 'Reviews array is required'
        });
      }
      
      const results = [];
      
      for (const reviewData of reviews) {
        try {
          // Process with ML
          const mlPredictions = await MLService.processReview(reviewData);
          
          // Generate a unique review ID if not provided
          const reviewId = reviewData.reviewId || `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Map ML predictions to the new schema structure
          const mappedPredictions = {
            ...mlPredictions,
            // Map individual detection flags for easier querying
            burstReviewDetected: mlPredictions.suspiciousPatterns?.burst_reviews?.detected || false,
            burstReviewConfidence: mlPredictions.suspiciousPatterns?.burst_reviews?.confidence || 0,
            copyPasteDetected: mlPredictions.suspiciousPatterns?.copy_paste?.detected || false,
            copyPasteConfidence: mlPredictions.suspiciousPatterns?.copy_paste?.confidence || 0,
            botActivityDetected: mlPredictions.suspiciousPatterns?.bot_activity?.detected || false,
            botActivityConfidence: mlPredictions.suspiciousPatterns?.bot_activity?.confidence || 0,
            // Ensure suspiciousPatterns is properly formatted
            suspiciousPatterns: mlPredictions.suspiciousPatterns || {}
          };
          
          // Store the review
          const review = new Review({
            reviewId: reviewId,
            reviewText: reviewData.reviewText,
            rating: reviewData.rating,
            reviewerId: reviewData.reviewerId || 'anonymous',
            productId: reviewData.productId || 'unknown_product',
            productName: reviewData.productName || 'Unknown Product',
            sellerId: reviewData.sellerId || 'unknown_seller',
            sellerName: reviewData.sellerName || 'Unknown Seller',
            reviewDate: reviewData.reviewDate || new Date(),
            ipAddress: reviewData.ipAddress || 'unknown',
            verifiedPurchase: reviewData.verifiedPurchase || false,
            mlPredictions: mappedPredictions,
            processedByML: true,
            mlProcessedAt: new Date()
          });
          
          await review.save();
          
          results.push({
            reviewId: review._id,
            predictions: mappedPredictions
          });
          
        } catch (error) {
          console.error('Error processing individual review:', error);
          results.push({
            reviewId: null,
            error: error.message,
            predictions: null
          });
        }
      }
      
      res.json({
        success: true,
        message: `Processed ${results.length} reviews`,
        results: results
      });
      
    } catch (error) {
      console.error('Error processing batch reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process batch reviews',
        error: error.message
      });
    }
  }

  /**
   * Get review analytics data
   */
  async getReviewAnalytics(req, res) {
    try {
      // Try to get data from MongoDB
      let analyticsData;
      
      try {
        const totalReviews = await Review.countDocuments();
        const fakeReviews = await Review.countDocuments({ 'mlPredictions.isFake': true });
        const processedReviews = await Review.countDocuments({ processedByML: true });
        
        // Get detailed model insights
        const burstReviews = await Review.countDocuments({ 'mlPredictions.burstReviewDetected': true });
        const copyPasteReviews = await Review.countDocuments({ 'mlPredictions.copyPasteDetected': true });
        const botActivity = await Review.countDocuments({ 'mlPredictions.botActivityDetected': true });
        
        // Calculate average confidence scores
        const burstConfidence = await Review.aggregate([
          { $match: { 'mlPredictions.burstReviewDetected': true } },
          { $group: { _id: null, avgConfidence: { $avg: '$mlPredictions.burstReviewConfidence' } } }
        ]);
        
        const copyPasteConfidence = await Review.aggregate([
          { $match: { 'mlPredictions.copyPasteDetected': true } },
          { $group: { _id: null, avgConfidence: { $avg: '$mlPredictions.copyPasteConfidence' } } }
        ]);
        
        const botConfidence = await Review.aggregate([
          { $match: { 'mlPredictions.botActivityDetected': true } },
          { $group: { _id: null, avgConfidence: { $avg: '$mlPredictions.botActivityConfidence' } } }
        ]);
        
        // Get recent insights for detailed view
        const recentReviews = await Review.find({ processedByML: true })
          .sort({ mlProcessedAt: -1 })
          .limit(10)
          .select('reviewId reviewText mlPredictions');
        
        const recentInsights = recentReviews.map(review => ({
          reviewId: review.reviewId,
          reviewText: review.reviewText,
          burstReviewDetected: review.mlPredictions?.burstReviewDetected || false,
          burstReviewConfidence: review.mlPredictions?.burstReviewConfidence || 0,
          copyPasteDetected: review.mlPredictions?.copyPasteDetected || false,
          copyPasteConfidence: review.mlPredictions?.copyPasteConfidence || 0,
          botActivityDetected: review.mlPredictions?.botActivityDetected || false,
          botActivityConfidence: review.mlPredictions?.botActivityConfidence || 0,
          riskLevel: this.calculateRiskLevel(review.mlPredictions?.riskScore || 50)
        }));
        
        // Calculate sentiment distribution
        const sentimentAggregation = await Review.aggregate([
          { $match: { 'mlPredictions.sentiment': { $exists: true } } },
          { $group: { _id: '$mlPredictions.sentiment', count: { $sum: 1 } } }
        ]);
        
        const sentimentDistribution = sentimentAggregation.map(item => ({
          sentiment: item._id,
          count: item.count
        }));
        
        // Calculate rating distribution
        const ratingAggregation = await Review.aggregate([
          { $match: { rating: { $exists: true } } },
          { $group: { _id: '$rating', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]);
        
        const ratingDistribution = ratingAggregation.map(item => ({
          rating: item._id,
          count: item.count,
          percentage: (item.count / totalReviews) * 100
        }));
        
        // Calculate risk distribution
        const riskDistribution = await Review.aggregate([
          { $match: { 'mlPredictions.riskScore': { $exists: true } } },
          {
            $bucket: {
              groupBy: '$mlPredictions.riskScore',
              boundaries: [0, 40, 70, 100],
              default: 'high',
              output: { count: { $sum: 1 } }
            }
          }
        ]);
        
        // Calculate marketplace overview
        const marketplaceOverview = {
          totalReviews,
          fakeReviews,
          fakeReviewPercentage: totalReviews > 0 ? ((fakeReviews / totalReviews) * 100).toFixed(1) : 0,
          totalProducts: await Review.distinct('productId').then(products => products.length),
          totalSellers: await Review.distinct('sellerId').then(sellers => sellers.length),
        };
        
        analyticsData = {
          totalReviews,
          fakeReviews,
          processedReviews,
          burstReviews,
          copyPasteReviews,
          botActivity,
          burstReviewConfidence: burstConfidence[0]?.avgConfidence || 0,
          copyPasteConfidence: copyPasteConfidence[0]?.avgConfidence || 0,
          botActivityConfidence: botConfidence[0]?.avgConfidence || 0,
          recentInsights,
          sentimentDistribution,
          ratingDistribution,
          riskDistribution: {
            low: riskDistribution.find(r => r._id === 0)?.count || 0,
            medium: riskDistribution.find(r => r._id === 40)?.count || 0,
            high: riskDistribution.find(r => r._id === 70)?.count || 0
          },
          averageRiskScore: processedReviews > 0 ? (fakeReviews / processedReviews) * 100 : 0,
          marketplaceOverview
        };
        
      } catch (dbError) {
        console.log('MongoDB not available, using mock data');
        // Provide mock data when MongoDB is not available
        analyticsData = {
          totalReviews: 150,
          fakeReviews: 23,
          processedReviews: 150,
          burstReviews: 8,
          copyPasteReviews: 12,
          botActivity: 5,
          burstReviewConfidence: 0.75,
          copyPasteConfidence: 0.82,
          botActivityConfidence: 0.68,
          recentInsights: [
            {
              reviewId: 'rev_001',
              reviewText: 'AMAZING PRODUCT!!! BEST EVER!!! BUY NOW!!!',
              burstReviewDetected: true,
              burstReviewConfidence: 0.85,
              copyPasteDetected: false,
              copyPasteConfidence: 0.12,
              botActivityDetected: true,
              botActivityConfidence: 0.78,
              riskLevel: 'high'
            },
            {
              reviewId: 'rev_002',
              reviewText: 'This product is exactly what I was looking for. Great quality and fast delivery.',
              burstReviewDetected: false,
              burstReviewConfidence: 0.15,
              copyPasteDetected: false,
              copyPasteConfidence: 0.08,
              botActivityDetected: false,
              botActivityConfidence: 0.22,
              riskLevel: 'low'
            },
            {
              reviewId: 'rev_003',
              reviewText: 'Perfect product, highly recommend!',
              burstReviewDetected: false,
              burstReviewConfidence: 0.25,
              copyPasteDetected: true,
              copyPasteConfidence: 0.91,
              botActivityDetected: false,
              botActivityConfidence: 0.18,
              riskLevel: 'medium'
            }
          ],
          sentimentDistribution: [
            { sentiment: 'positive', count: 89 },
            { sentiment: 'negative', count: 23 },
            { sentiment: 'neutral', count: 38 }
          ],
          ratingDistribution: [
            { rating: 1, count: 10, percentage: 6.67 },
            { rating: 2, count: 20, percentage: 13.33 },
            { rating: 3, count: 30, percentage: 20.00 },
            { rating: 4, count: 40, percentage: 26.67 },
            { rating: 5, count: 50, percentage: 33.33 }
          ],
          riskDistribution: {
            low: 89,
            medium: 38,
            high: 23
          },
          averageRiskScore: 15.3,
          marketplaceOverview: {
            totalReviews: 150,
            fakeReviews: 23,
            fakeReviewPercentage: 15.33,
            totalProducts: 100,
            totalSellers: 50
          }
        };
      }
      
      res.json({
        success: true,
        data: analyticsData
      });
      
    } catch (error) {
      console.error('Error getting review analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get review analytics',
        error: error.message
      });
    }
  }

  /**
   * Calculate risk level based on risk score
   */
  calculateRiskLevel(riskScore) {
    if (riskScore >= 70) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * Get seller risk analytics
   */
  async getSellerRiskAnalytics(req, res) {
    try {
      const analytics = await MLService.getSellerRiskAnalytics();
      
      res.json({
        success: true,
        data: analytics
      });
      
    } catch (error) {
      console.error('Error getting seller risk analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get seller risk analytics',
        error: error.message
      });
    }
  }

  /**
   * Get marketplace overview
   */
  async getMarketplaceOverview(req, res) {
    try {
      const overview = await MLService.getMarketplaceOverview();
      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      console.error('Error getting marketplace overview:', error);
      const overview = MLService.getMockMarketplaceOverview();
      res.json({
        success: true,
        data: overview
      });
    }
  }

  /**
   * Get flagged products
   */
  async getFlaggedProducts(req, res) {
    try {
      const { limit = 10, page = 1 } = req.query;
      const products = await MLService.getFlaggedProducts(parseInt(limit), parseInt(page));
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error getting flagged products:', error);
      const products = MLService.getMockFlaggedProducts();
      res.json({
        success: true,
        data: products
      });
    }
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(req, res) {
    try {
      const { limit = 10 } = req.query;
      const alerts = await MLService.getRecentAlerts(parseInt(limit));
      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Error getting recent alerts:', error);
      const alerts = MLService.getMockRecentAlerts();
      res.json({
        success: true,
        data: alerts
      });
    }
  }

  /**
   * Get seller-specific data
   */
  async getSellerData(req, res) {
    try {
      const { sellerId } = req.params;
      const seller = await Seller.findOne({ _id: sellerId });
      if (!seller) {
        return res.status(404).json({ success: false, message: 'Seller not found' });
      }
      const reviews = await Review.find({ reviewerId: sellerId });
      res.json({
        success: true,
        seller,
        reviews
      });
    } catch (error) {
      console.error('Error getting seller data:', error);
      res.status(500).json({ success: false, message: 'Failed to get seller data', error: error.message });
    }
  }

  /**
   * Upload and process a file containing multiple reviews
   */
  async uploadAndProcessFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileBuffer = req.file.buffer;
      const fileContent = fileBuffer.toString('utf-8');
      const fileName = req.file.originalname;

      let reviews = [];

      if (fileName.endsWith('.csv')) {
        reviews = this.parseCSV(fileContent);
      } else if (fileName.endsWith('.json')) {
        try {
          reviews = JSON.parse(fileContent);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid JSON format'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported file format. Please upload CSV or JSON files.'
        });
      }

      if (!Array.isArray(reviews) || reviews.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid reviews found in the file'
        });
      }

      const results = [];
      let processedCount = 0;
      let fakeReviewCount = 0;

      for (const reviewData of reviews) {
        try {
          // Process each review
          const result = await this.processReviewData(reviewData);
          results.push(result);
          
          if (result.isFake) {
            fakeReviewCount++;
          }
          processedCount++;
        } catch (error) {
          console.error('Error processing review:', error);
          results.push({
            ...reviewData,
            error: error.message,
            isFake: false,
            confidence: 0
          });
        }
      }

      const fakeReviewPercentage = processedCount > 0 ? (fakeReviewCount / processedCount) * 100 : 0;

      res.json({
        success: true,
        message: `Successfully processed ${processedCount} reviews`,
        data: {
          totalReviews: reviews.length,
          processedReviews: processedCount,
          fakeReviews: fakeReviewCount,
          fakeReviewPercentage: fakeReviewPercentage.toFixed(2),
          results
        }
      });

    } catch (error) {
      console.error('Error uploading and processing file:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing file',
        error: error.message
      });
    }
  }

  async uploadSellerData(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileBuffer = req.file.buffer;
      const fileContent = fileBuffer.toString('utf-8');
      const fileName = req.file.originalname;

      let sellerData = [];

      if (fileName.endsWith('.csv')) {
        sellerData = this.parseSellerCSV(fileContent);
      } else if (fileName.endsWith('.json')) {
        try {
          sellerData = JSON.parse(fileContent);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid JSON format'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported file format. Please upload CSV or JSON files.'
        });
      }

      if (!Array.isArray(sellerData) || sellerData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid seller data found in the file'
        });
      }

      const results = [];
      let processedSellers = 0;
      let sellersWithRiskAssessment = 0;
      let totalRiskScore = 0;
      const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 };

      for (const seller of sellerData) {
        try {
          // Process seller and their reviews
          const result = await this.processSellerData(seller);
          results.push(result);
          
          if (result.riskAssessment) {
            sellersWithRiskAssessment++;
            totalRiskScore += result.riskAssessment.riskScore;
            
            // Update risk distribution
            const riskLevel = result.riskAssessment.riskLevel;
            if (riskDistribution.hasOwnProperty(riskLevel)) {
              riskDistribution[riskLevel]++;
            }
          }
          processedSellers++;
        } catch (error) {
          console.error('Error processing seller:', error);
          
          // Provide more specific error information
          let errorMessage = error.message;
          if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(key => 
              `${key}: ${error.errors[key].message}`
            ).join(', ');
            errorMessage = `Validation failed: ${validationErrors}`;
          }
          
          results.push({
            sellerId: seller.sellerId || 'unknown',
            sellerName: seller.sellerName || 'Unknown Seller',
            error: errorMessage,
            businessType: seller.businessType || 'unknown'
          });
        }
      }

      const averageRiskScore = sellersWithRiskAssessment > 0 ? totalRiskScore / sellersWithRiskAssessment : 0;

      res.json({
        success: true,
        message: `Successfully processed ${processedSellers} sellers`,
        data: {
          totalSellers: sellerData.length,
          processedSellers,
          sellersWithRiskAssessment,
          averageRiskScore: Math.round(averageRiskScore * 10) / 10,
          riskDistribution,
          results
        }
      });

    } catch (error) {
      console.error('Error uploading seller data:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing seller data',
        error: error.message
      });
    }
  }

  parseSellerCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const sellers = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length < headers.length) continue;

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      const sellerId = row.sellerId;
      if (!sellerId) continue;

      // Create seller object with basic information
      const seller = {
        sellerId,
        sellerName: row.sellerName || 'Unknown Seller',
        email: row.email || `${sellerId}@example.com`,
        phone: row.phone || '',
        businessType: row.businessType || 'business',
        registrationDate: row.registrationDate || new Date().toISOString().split('T')[0],
        status: row.status || 'active',
        // Add risk assessment data if provided
        riskAssessment: {
          totalReviews: parseInt(row.totalReviews) || 0,
          fakeReviews: parseInt(row.fakeReviews) || 0,
          riskScore: parseInt(row.riskScore) || 0,
          riskLevel: row.riskLevel || 'low'
        }
      };

      sellers.push(seller);
    }

    return sellers;
  }

  async processSellerData(sellerData) {
    const { sellerId, sellerName, email, phone, businessType, registrationDate, status, riskAssessment } = sellerData;

    if (!sellerId || !sellerName) {
      throw new Error('Missing required seller information');
    }

    // Normalize business type
    let normalizedBusinessType = 'business'; // default
    if (businessType) {
      const businessTypeLower = businessType.toLowerCase();
      if (businessTypeLower.includes('corporation') || businessTypeLower === 'corp') {
        normalizedBusinessType = 'corporation';
      } else if (businessTypeLower.includes('llc') || businessTypeLower.includes('limited liability')) {
        normalizedBusinessType = 'LLC';
      } else if (businessTypeLower.includes('partnership')) {
        normalizedBusinessType = 'Partnership';
      } else if (businessTypeLower.includes('sole') || businessTypeLower.includes('proprietorship')) {
        normalizedBusinessType = 'Sole Proprietorship';
      } else if (businessTypeLower.includes('individual')) {
        normalizedBusinessType = 'individual';
      } else {
        normalizedBusinessType = businessType; // Keep original if it matches enum
      }
    }

    // Create or update seller record
    let seller = await Seller.findOne({ sellerId });
    
    if (!seller) {
      // Initialize risk assessment with proper structure
      const initialRiskAssessment = {
        riskScore: riskAssessment?.riskScore || 0,
        riskLevel: riskAssessment?.riskLevel || 'low',
        totalReviews: riskAssessment?.totalReviews || 0,
        fakeReviews: riskAssessment?.fakeReviews || 0,
        fakeReviewPercentage: riskAssessment?.totalReviews > 0 ? 
          (riskAssessment.fakeReviews / riskAssessment.totalReviews) * 100 : 0,
        deliveryViolations: {
          totalOrders: 0,
          fakeProductReceived: 0,
          damagedProductReceived: 0,
          wrongProductReceived: 0,
          lateDelivery: 0,
          missingItems: 0,
          totalViolations: 0,
          violationRate: 0
        },
        suspiciousPatterns: {
          burstReviews: 0,
          copyPaste: 0,
          botActivity: 0,
          shortReviews: 0
        },
        riskFactors: [],
        lastUpdated: new Date()
      };

      seller = new Seller({
        sellerId,
        sellerName,
        email: email || `${sellerId}@example.com`,
        phone: phone || '',
        businessType: normalizedBusinessType,
        registrationDate: registrationDate ? new Date(registrationDate) : new Date(),
        status: status || 'active',
        riskAssessment: initialRiskAssessment
      });
    } else {
      // Update existing seller with new data
      seller.sellerName = sellerName;
      seller.email = email || seller.email;
      seller.phone = phone || seller.phone;
      seller.businessType = normalizedBusinessType;
      seller.status = status || seller.status;
      
      // Update risk assessment if provided
      if (riskAssessment) {
        seller.riskAssessment.riskScore = riskAssessment.riskScore || seller.riskAssessment.riskScore;
        seller.riskAssessment.riskLevel = riskAssessment.riskLevel || seller.riskAssessment.riskLevel;
        seller.riskAssessment.totalReviews = riskAssessment.totalReviews || seller.riskAssessment.totalReviews;
        seller.riskAssessment.fakeReviews = riskAssessment.fakeReviews || seller.riskAssessment.fakeReviews;
        seller.riskAssessment.fakeReviewPercentage = riskAssessment.totalReviews > 0 ? 
          (riskAssessment.fakeReviews / riskAssessment.totalReviews) * 100 : seller.riskAssessment.fakeReviewPercentage;
        seller.riskAssessment.lastUpdated = new Date();
      }
    }

    await seller.save();

    return {
      sellerId: seller.sellerId,
      sellerName: seller.sellerName,
      businessType: seller.businessType,
      riskAssessment: seller.riskAssessment
    };
  }

  /**
   * Parse CSV text into array of review objects
   */
  parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const reviews = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const review = {};
        headers.forEach((header, index) => {
          review[header] = values[index].trim().replace(/"/g, '');
        });
        reviews.push(review);
      }
    }

    return reviews;
  }

  /**
   * Parse a single CSV line, handling quoted values
   */
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current);
    return values;
  }

  async processReviewData(reviewData) {
    try {
      // Call ML service for review analysis
      const mlResponse = await fetch('http://localhost:5001/predict/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewText: reviewData.reviewText,
          rating: reviewData.rating,
          reviewerId: reviewData.reviewerId,
          productId: reviewData.productId,
          productName: reviewData.productName,
          reviewDate: reviewData.reviewDate,
          ipAddress: reviewData.ipAddress,
          verifiedPurchase: reviewData.verifiedPurchase
        })
      });

      if (!mlResponse.ok) {
        throw new Error('ML service error');
      }

      const mlResult = await mlResponse.json();
      
      if (!mlResult.success) {
        throw new Error(mlResult.error || 'ML service error');
      }

      return {
        reviewText: reviewData.reviewText,
        isFake: mlResult.is_fake,
        confidence: mlResult.confidence,
        suspiciousPatterns: mlResult.suspicious_patterns,
        sentiment: mlResult.sentiment,
        riskScore: mlResult.risk_score
      };

    } catch (error) {
      console.error('Error processing review data:', error);
      throw error;
    }
  }

  async assessSellerRisk(req, res) {
    try {
      const { sellerId } = req.params;

      // Get seller
      const seller = await Seller.findOne({ sellerId });
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found'
        });
      }

      // Get all reviews for the seller
      const reviews = await Review.find({ sellerId });
      
      // Calculate review-based risk
      const totalReviews = reviews.length;
      const fakeReviews = reviews.filter(review => review.isFake).length;
      const fakeReviewPercentage = totalReviews > 0 ? (fakeReviews / totalReviews) * 100 : 0;

      // Calculate suspicious patterns
      const suspiciousPatterns = {
        burstReviews: reviews.filter(review => review.suspiciousPatterns?.some(p => p.pattern === 'burst_reviews')).length,
        copyPaste: reviews.filter(review => review.suspiciousPatterns?.some(p => p.pattern === 'copy_paste')).length,
        botActivity: reviews.filter(review => review.suspiciousPatterns?.some(p => p.pattern === 'bot_activity')).length,
        shortReviews: reviews.filter(review => review.suspiciousPatterns?.some(p => p.pattern === 'short_reviews')).length
      };

      // Calculate delivery violation risk
      const deliveryViolationRisk = await this.calculateDeliveryViolationRisk(sellerId);

      // Calculate overall risk score (combining review risk and delivery violation risk)
      let reviewRiskScore = 0;
      if (totalReviews > 0) {
        // Base risk from fake review percentage
        reviewRiskScore += fakeReviewPercentage * 0.6;
        
        // Additional risk from suspicious patterns
        const patternRisk = (
          suspiciousPatterns.burstReviews * 10 +
          suspiciousPatterns.copyPaste * 15 +
          suspiciousPatterns.botActivity * 20 +
          suspiciousPatterns.shortReviews * 5
        ) / totalReviews;
        
        reviewRiskScore += patternRisk;
      }

      // Combine review risk (60%) and delivery violation risk (40%)
      const overallRiskScore = Math.round(
        (reviewRiskScore * 0.6) + (deliveryViolationRisk.riskScore * 0.4)
      );

      // Determine risk level
      const riskLevel = this.calculateRiskLevel(overallRiskScore);

      // Update seller with new risk assessment
      const updatedSeller = await Seller.findOneAndUpdate(
        { sellerId },
        {
          'riskAssessment.riskScore': overallRiskScore,
          'riskAssessment.riskLevel': riskLevel,
          'riskAssessment.totalReviews': totalReviews,
          'riskAssessment.fakeReviews': fakeReviews,
          'riskAssessment.fakeReviewPercentage': Math.round(fakeReviewPercentage * 100) / 100,
          'riskAssessment.suspiciousPatterns': suspiciousPatterns,
          'riskAssessment.deliveryViolations': {
            totalOrders: deliveryViolationRisk.totalViolations > 0 ? deliveryViolationRisk.totalViolations * 10 : 100,
            fakeProductReceived: deliveryViolationRisk.violationBreakdown.fakeProductReceived,
            damagedProductReceived: deliveryViolationRisk.violationBreakdown.damagedProductReceived,
            wrongProductReceived: deliveryViolationRisk.violationBreakdown.wrongProductReceived,
            lateDelivery: deliveryViolationRisk.violationBreakdown.lateDelivery,
            missingItems: deliveryViolationRisk.violationBreakdown.missingItems,
            totalViolations: deliveryViolationRisk.totalViolations,
            violationRate: deliveryViolationRisk.violationRate
          },
          'riskAssessment.riskFactors': this.generateRiskFactors(overallRiskScore, fakeReviewPercentage, deliveryViolationRisk),
          'riskAssessment.lastUpdated': new Date()
        },
        { new: true }
      );

      res.json({
        success: true,
        seller: updatedSeller,
        riskAssessment: {
          riskScore: overallRiskScore,
          riskLevel,
          totalReviews,
          fakeReviews,
          fakeReviewPercentage: Math.round(fakeReviewPercentage * 100) / 100,
          suspiciousPatterns,
          deliveryViolations: deliveryViolationRisk,
          riskFactors: this.generateRiskFactors(overallRiskScore, fakeReviewPercentage, deliveryViolationRisk)
        }
      });

    } catch (error) {
      console.error('Error assessing seller risk:', error);
      res.status(500).json({
        success: false,
        message: 'Error assessing seller risk',
        error: error.message
      });
    }
  }

  async getSellerRiskDashboard(req, res) {
    try {
      const { sellerId } = req.params;
      
      // Get seller with risk assessment
      const seller = await Seller.findOne({ sellerId });
      
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found'
        });
      }
      
      // Get recent reviews for this seller
      const recentReviews = await Review.find({ sellerId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      
      // Get risk history for trend analysis
      const riskHistory = seller.riskHistory.slice(-7); // Last 7 entries
      
      res.json({
        success: true,
        seller: {
          sellerId: seller.sellerId,
          sellerName: seller.sellerName,
          status: seller.status,
          registrationDate: seller.registrationDate
        },
        riskAssessment: seller.riskAssessment,
        riskTrend: seller.getRiskTrend(),
        recentReviews,
        riskHistory
      });
      
    } catch (error) {
      console.error('Error getting seller risk dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting seller risk dashboard',
        error: error.message
      });
    }
  }

  async getAllSellersRisk(req, res) {
    try {
      const { page = 1, limit = 20, riskLevel, sortBy = 'riskScore' } = req.query;
      
      // Build query
      const query = {};
      if (riskLevel) {
        query['riskAssessment.riskLevel'] = riskLevel;
      }
      
      // Build sort
      let sort = {};
      if (sortBy === 'riskScore') {
        sort['riskAssessment.riskScore'] = -1;
      } else if (sortBy === 'totalReviews') {
        sort['riskAssessment.totalReviews'] = -1;
      } else if (sortBy === 'fakeReviewPercentage') {
        sort['riskAssessment.fakeReviewPercentage'] = -1;
      }
      
      // Get sellers with pagination
      const sellers = await Seller.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .select('sellerId sellerName status riskAssessment registrationDate')
        .lean();
      
      // Get total count
      const total = await Seller.countDocuments(query);
      
      // Get risk level distribution
      const riskDistribution = await Seller.aggregate([
        {
          $group: {
            _id: '$riskAssessment.riskLevel',
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Initialize risk distribution with all levels set to 0
      const defaultRiskDistribution = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      };
      
      // Update with actual counts from aggregation
      const finalRiskDistribution = riskDistribution.reduce((acc, item) => {
        acc[item._id || 'low'] = item.count;
        return acc;
      }, defaultRiskDistribution);
      
      res.json({
        success: true,
        sellers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        riskDistribution: finalRiskDistribution
      });
      
    } catch (error) {
      console.error('Error getting all sellers risk:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting all sellers risk',
        error: error.message
      });
    }
  }

  // Calculate delivery violation risk score
  async calculateDeliveryViolationRisk(sellerId) {
    try {
      // Get all violations for the seller
      const violations = await DeliveryViolation.find({ sellerId });
      
      if (violations.length === 0) {
        return {
          riskScore: 0,
          totalViolations: 0,
          violationRate: 0,
          violationBreakdown: {
            fakeProductReceived: 0,
            damagedProductReceived: 0,
            wrongProductReceived: 0,
            lateDelivery: 0,
            missingItems: 0
          },
          severityBreakdown: {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
          }
        };
      }

      // Calculate violation breakdown
      const violationBreakdown = {
        fakeProductReceived: violations.filter(v => v.violationType === 'fake_product').length,
        damagedProductReceived: violations.filter(v => v.violationType === 'damaged_product').length,
        wrongProductReceived: violations.filter(v => v.violationType === 'wrong_product').length,
        lateDelivery: violations.filter(v => v.violationType === 'late_delivery').length,
        missingItems: violations.filter(v => v.violationType === 'missing_items').length
      };

      // Calculate severity breakdown
      const severityBreakdown = {
        low: violations.filter(v => v.severity === 'low').length,
        medium: violations.filter(v => v.severity === 'medium').length,
        high: violations.filter(v => v.severity === 'high').length,
        critical: violations.filter(v => v.severity === 'critical').length
      };

      // Calculate weighted risk score based on violation types and severity
      let totalRiskScore = 0;
      let totalWeight = 0;

      violations.forEach(violation => {
        let weight = 1;
        let severityMultiplier = 1;

        // Weight by violation type (fake products are most serious)
        switch (violation.violationType) {
          case 'fake_product':
            weight = 5;
            break;
          case 'damaged_product':
            weight = 3;
            break;
          case 'wrong_product':
            weight = 4;
            break;
          case 'late_delivery':
            weight = 2;
            break;
          case 'missing_items':
            weight = 3;
            break;
        }

        // Weight by severity
        switch (violation.severity) {
          case 'low':
            severityMultiplier = 0.5;
            break;
          case 'medium':
            severityMultiplier = 1;
            break;
          case 'high':
            severityMultiplier = 1.5;
            break;
          case 'critical':
            severityMultiplier = 2;
            break;
        }

        // Weight by recency (recent violations have more impact)
        const daysSinceViolation = (Date.now() - violation.violationDate.getTime()) / (1000 * 60 * 60 * 24);
        const recencyMultiplier = Math.max(0.5, 1 - (daysSinceViolation / 365)); // Decay over 1 year

        totalRiskScore += weight * severityMultiplier * recencyMultiplier * 10;
        totalWeight += weight;
      });

      // Normalize risk score to 0-100 range
      const normalizedRiskScore = totalWeight > 0 ? Math.min(100, totalRiskScore / totalWeight) : 0;

      // Calculate violation rate (assuming we have total orders data)
      const totalOrders = violations.length > 0 ? Math.max(violations.length * 10, 100) : 100; // Estimate
      const violationRate = (violations.length / totalOrders) * 100;

      return {
        riskScore: Math.round(normalizedRiskScore),
        totalViolations: violations.length,
        violationRate: Math.min(100, violationRate),
        violationBreakdown,
        severityBreakdown
      };
    } catch (error) {
      console.error('Error calculating delivery violation risk:', error);
      return {
        riskScore: 0,
        totalViolations: 0,
        violationRate: 0,
        violationBreakdown: {},
        severityBreakdown: {}
      };
    }
  }

  // Generate risk factors based on various metrics
  generateRiskFactors(riskScore, fakeReviewPercentage, deliveryViolationRisk) {
    const riskFactors = [];

    // Review-based risk factors
    if (fakeReviewPercentage > 20) {
      riskFactors.push('High fake review percentage');
    } else if (fakeReviewPercentage > 10) {
      riskFactors.push('Moderate fake review percentage');
    }

    if (deliveryViolationRisk.totalViolations > 0) {
      if (deliveryViolationRisk.violationBreakdown.fakeProductReceived > 0) {
        riskFactors.push('Fake products delivered');
      }
      if (deliveryViolationRisk.violationBreakdown.damagedProductReceived > 0) {
        riskFactors.push('Damaged products delivered');
      }
      if (deliveryViolationRisk.violationBreakdown.wrongProductReceived > 0) {
        riskFactors.push('Wrong products delivered');
      }
      if (deliveryViolationRisk.violationBreakdown.lateDelivery > 0) {
        riskFactors.push('Late deliveries');
      }
      if (deliveryViolationRisk.violationBreakdown.missingItems > 0) {
        riskFactors.push('Missing items in orders');
      }
    }

    // Overall risk level factors
    if (riskScore > 80) {
      riskFactors.push('Critical risk level');
    } else if (riskScore > 60) {
      riskFactors.push('High risk level');
    } else if (riskScore > 40) {
      riskFactors.push('Medium risk level');
    }

    return riskFactors;
  }

  // Create a new delivery violation
  async createDeliveryViolation(req, res) {
    try {
      const violationData = req.body;
      
      // Validate required fields
      if (!violationData.sellerId || !violationData.orderId || !violationData.violationType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: sellerId, orderId, violationType'
        });
      }

      // Create new violation
      const violation = new DeliveryViolation(violationData);
      await violation.save();

      // Update seller risk assessment
      await this.assessSellerRisk({ params: { sellerId: violationData.sellerId } }, { json: () => {} });

      res.status(201).json({
        success: true,
        violation
      });

    } catch (error) {
      console.error('Error creating delivery violation:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating delivery violation',
        error: error.message
      });
    }
  }

  // Get all delivery violations with pagination and filtering
  async getDeliveryViolations(req, res) {
    try {
      const { page = 1, limit = 20, sellerId, violationType, severity, resolutionStatus } = req.query;
      
      // Build query
      const query = {};
      if (sellerId) query.sellerId = sellerId;
      if (violationType) query.violationType = violationType;
      if (severity) query.severity = severity;
      if (resolutionStatus) query.resolutionStatus = resolutionStatus;

      // Get violations with pagination
      const violations = await DeliveryViolation.find(query)
        .sort({ violationDate: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

      // Get total count
      const total = await DeliveryViolation.countDocuments(query);

      // Get violation type distribution
      const violationTypeDistribution = await DeliveryViolation.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$violationType',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        violations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        violationTypeDistribution
      });

    } catch (error) {
      console.error('Error getting delivery violations:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting delivery violations',
        error: error.message
      });
    }
  }

  // Get a specific delivery violation
  async getDeliveryViolation(req, res) {
    try {
      const { violationId } = req.params;
      
      const violation = await DeliveryViolation.findOne({ violationId });
      if (!violation) {
        return res.status(404).json({
          success: false,
          message: 'Delivery violation not found'
        });
      }

      res.json({
        success: true,
        violation
      });

    } catch (error) {
      console.error('Error getting delivery violation:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting delivery violation',
        error: error.message
      });
    }
  }

  // Update a delivery violation
  async updateDeliveryViolation(req, res) {
    try {
      const { violationId } = req.params;
      const updateData = req.body;
      
      const violation = await DeliveryViolation.findOneAndUpdate(
        { violationId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      if (!violation) {
        return res.status(404).json({
          success: false,
          message: 'Delivery violation not found'
        });
      }

      // Update seller risk assessment if resolution status changed
      if (updateData.resolutionStatus) {
        await this.assessSellerRisk({ params: { sellerId: violation.sellerId } }, { json: () => {} });
      }

      res.json({
        success: true,
        violation
      });

    } catch (error) {
      console.error('Error updating delivery violation:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating delivery violation',
        error: error.message
      });
    }
  }

  // Delete a delivery violation
  async deleteDeliveryViolation(req, res) {
    try {
      const { violationId } = req.params;
      
      const violation = await DeliveryViolation.findOneAndDelete({ violationId });
      if (!violation) {
        return res.status(404).json({
          success: false,
          message: 'Delivery violation not found'
        });
      }

      // Update seller risk assessment
      await this.assessSellerRisk({ params: { sellerId: violation.sellerId } }, { json: () => {} });

      res.json({
        success: true,
        message: 'Delivery violation deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting delivery violation:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting delivery violation',
        error: error.message
      });
    }
  }

  // Get delivery violations for a specific seller
  async getSellerDeliveryViolations(req, res) {
    try {
      const { sellerId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Get violations for the seller
      const violations = await DeliveryViolation.find({ sellerId })
        .sort({ violationDate: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

      // Get total count
      const total = await DeliveryViolation.countDocuments({ sellerId });

      // Get violation breakdown
      const violationBreakdown = await DeliveryViolation.aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: '$violationType',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get severity breakdown
      const severityBreakdown = await DeliveryViolation.aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        violations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        violationBreakdown,
        severityBreakdown
      });

    } catch (error) {
      console.error('Error getting seller delivery violations:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting seller delivery violations',
        error: error.message
      });
    }
  }
}

module.exports = new MLController(); 