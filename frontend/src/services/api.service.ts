import type {
  ReviewAnalytics,
  SellerRiskAnalytics,
  MarketplaceOverview,
  FlaggedProducts,
  FlaggedSellers,
  RecentAlert,
  SellerData
} from '@/types/ml-data';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Handle backend response format: { success: true, data: ... }
    if (result.success && result.data !== undefined) {
      return result.data;
    }
    
    // If no success/data wrapper, return the result directly
    return result;
  }

  // Review Analytics
  async getReviewAnalytics(): Promise<ReviewAnalytics> {
    return this.makeRequest<ReviewAnalytics>('/dashboard/review-analytics');
  }

  // Seller Risk Analytics
  async getSellerRiskAnalytics(): Promise<SellerRiskAnalytics> {
    return this.makeRequest<SellerRiskAnalytics>('/dashboard/seller-risk-analytics');
  }

  // Marketplace Overview
  async getMarketplaceOverview(): Promise<MarketplaceOverview> {
    return this.makeRequest<MarketplaceOverview>('/dashboard/marketplace-overview');
  }

  // Flagged Content
  async getFlaggedProducts(limit = 10, page = 1): Promise<FlaggedProducts> {
    return this.makeRequest<FlaggedProducts>(`/dashboard/flagged-products?limit=${limit}&page=${page}`);
  }

  async getFlaggedSellers(limit = 10, page = 1): Promise<FlaggedSellers> {
    return this.makeRequest<FlaggedSellers>(`/dashboard/flagged-sellers?limit=${limit}&page=${page}`);
  }

  // Recent Alerts
  async getRecentAlerts(limit = 10): Promise<RecentAlert[]> {
    return this.makeRequest<RecentAlert[]>(`/dashboard/recent-alerts?limit=${limit}`);
  }

  // ML Processing
  async processReview(reviewData: any): Promise<any> {
    return this.makeRequest('/dashboard/process-review', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async processBatchReviews(reviewsData: any[]): Promise<any> {
    return this.makeRequest('/dashboard/process-batch-reviews', {
      method: 'POST',
      body: JSON.stringify({ reviews: reviewsData }),
    });
  }

  async uploadAndProcessFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}/dashboard/upload-file`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Handle backend response format: { success: true, data: ... }
    if (result.success && result.data !== undefined) {
      return result.data;
    }
    
    // If no success/data wrapper, return the result directly
    return result;
  }

  async uploadSellerData(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}/dashboard/upload-seller-data`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Handle backend response format: { success: true, data: ... }
    if (result.success && result.data !== undefined) {
      return result.data;
    }
    
    // If no success/data wrapper, return the result directly
    return result;
  }

  async processSellerRisk(sellerData: any): Promise<any> {
    return this.makeRequest('/dashboard/process-seller-risk', {
      method: 'POST',
      body: JSON.stringify(sellerData),
    });
  }

  // Seller-specific data
  async getSellerData(sellerId: string): Promise<SellerData> {
    return this.makeRequest<SellerData>(`/dashboard/seller/${sellerId}`);
  }

  // Seller Risk Assessment Methods
  async assessSellerRisk(sellerId: string): Promise<any> {
    return this.makeRequest(`/dashboard/assess-seller-risk/${sellerId}`, { method: 'POST' });
  }

  async getSellerRiskDashboard(sellerId: string): Promise<any> {
    return this.makeRequest(`/dashboard/seller-risk-dashboard/${sellerId}`, { method: 'GET' });
  }

  async getAllSellersRisk(params?: {
    page?: number;
    limit?: number;
    riskLevel?: string;
    sortBy?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.riskLevel) queryParams.append('riskLevel', params.riskLevel);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    
    const url = `/dashboard/all-sellers-risk${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(url, { method: 'GET' });
  }

  // Delivery Violations for a Seller
  async getSellerDeliveryViolations(sellerId: string, page = 1, limit = 20): Promise<any> {
    return this.makeRequest<any>(`/dashboard/delivery-violations/seller/${sellerId}?page=${page}&limit=${limit}`);
  }
}

export const apiService = new ApiService(); 