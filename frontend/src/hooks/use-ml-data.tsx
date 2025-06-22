import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import type {
  ReviewAnalytics,
  SellerRiskAnalytics,
  MarketplaceOverview,
  FlaggedProducts,
  FlaggedSellers,
  RecentAlert,
  SellerData
} from '@/types/ml-data';

// Review Analytics
export const useReviewAnalytics = () => {
  return useQuery<ReviewAnalytics>({
    queryKey: ['reviewAnalytics'],
    queryFn: () => apiService.getReviewAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

// Seller Risk Analytics
export const useSellerRiskAnalytics = () => {
  return useQuery<SellerRiskAnalytics>({
    queryKey: ['sellerRiskAnalytics'],
    queryFn: () => apiService.getSellerRiskAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

// Marketplace Overview
export const useMarketplaceOverview = () => {
  return useQuery<MarketplaceOverview>({
    queryKey: ['marketplaceOverview'],
    queryFn: () => apiService.getMarketplaceOverview(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
};

// Flagged Products
export const useFlaggedProducts = (limit = 10, page = 1) => {
  return useQuery<FlaggedProducts>({
    queryKey: ['flaggedProducts', limit, page],
    queryFn: () => apiService.getFlaggedProducts(limit, page),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Flagged Sellers
export const useFlaggedSellers = (limit = 10, page = 1) => {
  return useQuery<FlaggedSellers>({
    queryKey: ['flaggedSellers', limit, page],
    queryFn: () => apiService.getFlaggedSellers(limit, page),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Recent Alerts
export const useRecentAlerts = (limit = 10) => {
  return useQuery<RecentAlert[]>({
    queryKey: ['recentAlerts', limit],
    queryFn: () => apiService.getRecentAlerts(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 15 * 1000, // 15 seconds
  });
};

// Seller Data
export const useSellerData = (sellerId: string) => {
  return useQuery<SellerData>({
    queryKey: ['sellerData', sellerId],
    queryFn: () => apiService.getSellerData(sellerId),
    enabled: !!sellerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ML Processing Mutations
export const useProcessReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewData: any) => apiService.processReview(reviewData),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['reviewAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['flaggedProducts'] });
      queryClient.invalidateQueries({ queryKey: ['recentAlerts'] });
    },
  });
};

export const useProcessSellerRisk = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sellerData: any) => apiService.processSellerRisk(sellerData),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['sellerRiskAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['flaggedSellers'] });
      queryClient.invalidateQueries({ queryKey: ['recentAlerts'] });
    },
  });
};

// Dashboard Data Hook (combines multiple queries)
export const useDashboardData = () => {
  const reviewAnalytics = useReviewAnalytics();
  const sellerRiskAnalytics = useSellerRiskAnalytics();
  const marketplaceOverview = useMarketplaceOverview();
  const recentAlerts = useRecentAlerts();

  const isLoading = reviewAnalytics.isLoading || 
                   sellerRiskAnalytics.isLoading || 
                   marketplaceOverview.isLoading || 
                   recentAlerts.isLoading;

  const isError = reviewAnalytics.isError || 
                 sellerRiskAnalytics.isError || 
                 marketplaceOverview.isError || 
                 recentAlerts.isError;

  const error = reviewAnalytics.error || 
               sellerRiskAnalytics.error || 
               marketplaceOverview.error || 
               recentAlerts.error;

  return {
    data: {
      reviewAnalytics: reviewAnalytics.data,
      sellerRiskAnalytics: sellerRiskAnalytics.data,
      marketplaceOverview: marketplaceOverview.data,
      recentAlerts: recentAlerts.data,
    },
    isLoading,
    isError,
    error,
    refetch: () => {
      reviewAnalytics.refetch();
      sellerRiskAnalytics.refetch();
      marketplaceOverview.refetch();
      recentAlerts.refetch();
    },
  };
}; 