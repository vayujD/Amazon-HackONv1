// Review Analytics Types
export interface ReviewAnalytics {
  totalReviews?: number;
  fakeReviews?: number;
  processedReviews?: number;
  burstReviews?: number;
  copyPasteReviews?: number;
  botActivity?: number;
  burstReviewConfidence?: number;
  copyPasteConfidence?: number;
  botActivityConfidence?: number;
  recentInsights?: any[];
  sentimentDistribution?: SentimentDistribution[];
  ratingDistribution?: RatingDistribution[];
  riskDistribution?: {
    low: number;
    medium: number;
    high: number;
  };
  averageRiskScore?: number;
  marketplaceOverview?: MarketplaceOverview;
  fakeReviewTrend?: number;
  detectionMetrics?: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

export interface SentimentDistribution {
  sentiment: string;
  count: number;
  percentage?: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface RiskDistribution {
  _id: string;
  count: number;
}

export interface ReviewBurst {
  _id: string;
  totalReviews: number;
  fakeReviews: number;
}

export interface TransparencyMetric {
  metric: string;
  percentage: number;
}

// Seller Risk Analytics Types
export interface SellerRiskAnalytics {
  totalSellers: number;
  riskDistribution: SellerRiskDistribution[];
  averageRiskScore: number;
}

export interface SellerRiskDistribution {
  level: string;
  count: number;
  percentage: number;
}

export interface RecentViolation {
  seller: string;
  violation: string;
  date: string;
  severity: string;
  status: string;
}

export interface TopRiskSeller {
  sellerName: string;
  mlRiskAssessment: {
    overallRiskScore: number;
    riskLevel: string;
  };
  violations: any[];
  status: string;
  totalRevenue: number;
}

// Marketplace Overview Types
export interface MarketplaceOverview {
  totalReviews: number;
  fakeReviews: number;
  fakeReviewPercentage: string;
  totalProducts: number;
  totalSellers: number;
  recentActivity: number;
  detectionAccuracy: number;
  averageRating: string;
}

// Flagged Content Types
export interface FlaggedProducts {
  products: FlaggedProduct[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FlaggedProduct {
  productId: string;
  productName: string;
  totalReviews: number;
  fakeReviews: number;
  fakeReviewPercentage: string;
  averageRating: string;
  averageRiskScore: number;
}

export interface FlaggedSellers {
  sellers: FlaggedSeller[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FlaggedSeller {
  sellerName: string;
  mlRiskAssessment: {
    overallRiskScore: number;
    riskLevel: string;
  };
  violations: any[];
  status: string;
  totalRevenue: number;
  joinDate: string;
}

// Recent Alerts Types
export interface RecentAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  productName?: string;
  reviewText?: string;
  timestamp: string;
  sellerName?: string;
  riskScore?: number;
}

// Seller Data Types
export interface SellerData {
  seller: Seller;
  reviews: Review[];
  performanceData: SellerPerformance;
}

export interface Seller {
  sellerId: string;
  sellerName: string;
  email: string;
  joinDate: string;
  isVerified: boolean;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  mlRiskAssessment: SellerRiskAssessment;
  violations: Violation[];
  status: string;
}

export interface SellerRiskAssessment {
  overallRiskScore: number;
  riskLevel: string;
  confidence: number;
  lastUpdated: string;
  riskFactors: {
    counterfeitRisk: number;
    reviewManipulationRisk: number;
    pricingAnomalyRisk: number;
    accountSecurityRisk: number;
    complianceRisk: number;
  };
  suspiciousPatterns: string[];
  riskHistory: RiskHistory[];
}

export interface RiskHistory {
  date: string;
  riskScore: number;
  riskLevel: string;
  trigger?: string;
}

export interface Violation {
  type: string;
  description: string;
  date: string;
  severity: string;
  status: string;
  action: string;
  resolvedDate?: string;
}

export interface Review {
  reviewId: string;
  productName: string;
  reviewText: string;
  rating: number;
  reviewDate: string;
  verifiedPurchase: boolean;
  mlPredictions: ReviewMLPredictions;
  status: string;
}

export interface ReviewMLPredictions {
  isFake: boolean;
  confidence: number;
  riskScore: number;
  sentiment: string;
  sentimentScore: number;
  suspiciousPatterns: string[];
  reviewAuthenticity: number;
  reviewerCredibility: number;
}

export interface SellerPerformance {
  averageRating: string;
  totalReviews: number;
  fakeReviewPercentage: string;
  sentimentDistribution: SentimentDistribution[];
} 