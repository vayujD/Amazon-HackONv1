const express = require('express');
const router = express.Router();
const MLController = require('../controllers/ml.controller');
const auth = require('../middleware/auth.middleware');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/json' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and JSON files are allowed.'), false);
    }
  }
});

// Apply authentication middleware to all routes
// router.use(auth); // Temporarily disabled for testing

// Review Analytics - properly bound
router.get('/review-analytics', (req, res) => MLController.getReviewAnalytics(req, res));

// Seller Risk Analytics - properly bound
router.get('/seller-risk-analytics', (req, res) => MLController.getSellerRiskAnalytics(req, res));

// Marketplace Overview - properly bound
router.get('/marketplace-overview', (req, res) => MLController.getMarketplaceOverview(req, res));

// Flagged Products - properly bound
router.get('/flagged-products', (req, res) => MLController.getFlaggedProducts(req, res));

// Recent Alerts - properly bound
router.get('/recent-alerts', (req, res) => MLController.getRecentAlerts(req, res));

// Process Review with ML - properly bound
router.post('/process-review', (req, res) => MLController.processReview(req, res));

// Process Batch Reviews - properly bound
router.post('/process-batch-reviews', (req, res) => MLController.processBatchReviews(req, res));

// Upload and Process File - properly bound
router.post('/upload-file', upload.single('file'), (req, res) => MLController.uploadAndProcessFile(req, res));

// Upload and Process Seller Data - properly bound
router.post('/upload-seller-data', upload.single('file'), (req, res) => MLController.uploadSellerData(req, res));

// Seller-specific data - properly bound
router.get('/seller/:sellerId', (req, res) => MLController.getSellerData(req, res));

// Legacy endpoints (keeping for backward compatibility)
router.get('/overview', (req, res) => {
  res.json({ message: 'Get dashboard overview endpoint' });
});

router.get('/stats', (req, res) => {
  res.json({ message: 'Get dashboard statistics endpoint' });
});

router.get('/activity', (req, res) => {
  res.json({ message: 'Get recent activity endpoint' });
});

// Seller Risk Assessment Routes - properly bound
router.post('/assess-seller-risk/:sellerId', (req, res) => MLController.assessSellerRisk(req, res));
router.get('/seller-risk-dashboard/:sellerId', (req, res) => MLController.getSellerRiskDashboard(req, res));
router.get('/all-sellers-risk', (req, res) => MLController.getAllSellersRisk(req, res));

// Delivery violation routes - properly bound
router.post('/delivery-violations', (req, res) => MLController.createDeliveryViolation(req, res));
router.get('/delivery-violations', (req, res) => MLController.getDeliveryViolations(req, res));
router.get('/delivery-violations/:violationId', (req, res) => MLController.getDeliveryViolation(req, res));
router.put('/delivery-violations/:violationId', (req, res) => MLController.updateDeliveryViolation(req, res));
router.delete('/delivery-violations/:violationId', (req, res) => MLController.deleteDeliveryViolation(req, res));
router.get('/delivery-violations/seller/:sellerId', (req, res) => MLController.getSellerDeliveryViolations(req, res));

module.exports = router;

 