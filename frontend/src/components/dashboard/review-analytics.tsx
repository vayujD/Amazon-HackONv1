import { useEffect, useState } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Star,
  Eye,
  Download,
  Send,
  Upload,
  Loader2,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api.service";
import { ReviewSubmission } from "./review-submission";
import { BatchSubmission } from "./batch-submission";
import { FileUpload } from "./file-upload";
import { ModelInsights } from "./model-insights";

interface AnalyticsData {
  marketplaceOverview: any; // Will handle the actual backend response
  reviewAnalytics: any; // Will handle the actual backend response  
  flaggedProducts: any; // Will handle the actual backend response
  recentAlerts: any; // Will handle the actual backend response
}

export function ReviewAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60); // 60 seconds countdown
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      
      console.log('🔄 Fetching analytics data...');
      
      // Test each endpoint individually to identify issues
      try {
        console.log('📊 Fetching marketplace overview...');
        const overviewResponse = await apiService.getMarketplaceOverview();
        console.log('✅ Marketplace overview received:', overviewResponse);
      } catch (error) {
        console.error('❌ Error fetching marketplace overview:', error);
      }

      try {
        console.log('📈 Fetching review analytics...');
        const analyticsResponse = await apiService.getReviewAnalytics();
        console.log('✅ Review analytics received:', analyticsResponse);
      } catch (error) {
        console.error('❌ Error fetching review analytics:', error);
      }

      try {
        console.log('🚩 Fetching flagged products...');
        const flaggedResponse = await apiService.getFlaggedProducts();
        console.log('✅ Flagged products received:', flaggedResponse);
      } catch (error) {
        console.error('❌ Error fetching flagged products:', error);
      }

      try {
        console.log('⚠️ Fetching recent alerts...');
        const alertsResponse = await apiService.getRecentAlerts();
        console.log('✅ Recent alerts received:', alertsResponse);
      } catch (error) {
        console.error('❌ Error fetching recent alerts:', error);
      }

      // Now fetch all data together
      const [
        overviewResponse,
        analyticsResponse,
        flaggedResponse,
        alertsResponse
      ] = await Promise.all([
        apiService.getMarketplaceOverview(),
        apiService.getReviewAnalytics(),
        apiService.getFlaggedProducts(),
        apiService.getRecentAlerts()
      ]);

      console.log('✅ All analytics data received:', {
        overview: overviewResponse,
        analytics: analyticsResponse,
        flagged: flaggedResponse,
        alerts: alertsResponse
      });

      setData({
        marketplaceOverview: overviewResponse,
        reviewAnalytics: analyticsResponse,
        flaggedProducts: flaggedResponse,
        recentAlerts: alertsResponse
      });

      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
      setIsError(true);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
      setIsLoading(false);
      
      // Set mock data as fallback
      setData({
        marketplaceOverview: {
          totalReviews: 0,
          fakeReviews: 0,
          fakeReviewPercentage: "0",
          totalProducts: 0,
          totalSellers: 0,
          recentActivity: 0,
          detectionAccuracy: 0,
          averageRating: "0"
        },
        reviewAnalytics: {
          totalReviews: 0,
          fakeReviews: 0,
          processedReviews: 0,
          burstReviews: 0,
          copyPasteReviews: 0,
          botActivity: 0,
          burstReviewConfidence: 0,
          copyPasteConfidence: 0,
          botActivityConfidence: 0,
          recentInsights: [],
          sentimentDistribution: [],
          ratingDistribution: [],
          riskDistribution: { low: 0, medium: 0, high: 0 },
          averageRiskScore: 0,
          marketplaceOverview: null,
          fakeReviewTrend: 0,
          detectionMetrics: { precision: 0, recall: 0, f1Score: 0 }
        },
        flaggedProducts: {
          products: [],
          total: 0,
          page: 1,
          totalPages: 0
        },
        recentAlerts: []
      });
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Auto-refresh every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchAnalytics();
        setCountdown(60); // Reset countdown after refresh
      }
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [isLoading]);

  // Countdown timer effect
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 60; // Reset to 60 when it reaches 0
        }
        return prev - 1;
      });
    }, 1000); // Update every second

    return () => clearInterval(countdownInterval);
  }, []);

  // Listen for review submission events to refresh data
  useEffect(() => {
    const handleReviewSubmitted = () => {
      fetchAnalytics();
    };

    window.addEventListener('reviewSubmitted', handleReviewSubmitted);
    
    return () => {
      window.removeEventListener('reviewSubmitted', handleReviewSubmitted);
    };
  }, []);

  // Manual refresh function that resets the auto-refresh timer
  const handleManualRefresh = () => {
    fetchAnalytics();
    setCountdown(60); // Reset countdown on manual refresh
    
    // Reset the auto-refresh timer by clearing and restarting the interval
    const resetInterval = () => {
      const interval = setInterval(() => {
        if (!isLoading) {
          fetchAnalytics();
        }
      }, 60000); // 1 minute
      
      return interval;
    };
    
    // Clear existing interval and start a new one
    const currentInterval = setInterval(() => {}, 60000);
    clearInterval(currentInterval);
    resetInterval();
  };

  // Add export analytics function
  const exportAnalytics = () => {
    if (!data) return;
    const { marketplaceOverview, reviewAnalytics, flaggedProducts, recentAlerts } = data;
    const csvRows = [
      ['Section', 'Metric', 'Value'],
      ['Marketplace Overview', 'Total Reviews', marketplaceOverview?.totalReviews || 0],
      ['Marketplace Overview', 'Fake Reviews', marketplaceOverview?.fakeReviews || 0],
      ['Marketplace Overview', 'Fake Review %', marketplaceOverview?.fakeReviewPercentage || 0],
      ['Marketplace Overview', 'Total Products', marketplaceOverview?.totalProducts || 0],
      ['Marketplace Overview', 'Total Sellers', marketplaceOverview?.totalSellers || 0],
      ['Marketplace Overview', 'Recent Activity', marketplaceOverview?.recentActivity || 0],
      ['Marketplace Overview', 'Detection Accuracy', marketplaceOverview?.detectionAccuracy || 0],
      ['Marketplace Overview', 'Average Rating', marketplaceOverview?.averageRating || 0],
      // Add more as needed
    ];
    // Add review analytics
    if (reviewAnalytics?.sentimentDistribution) {
      reviewAnalytics.sentimentDistribution.forEach((item: any) => {
        csvRows.push(['Review Analytics', `Sentiment: ${item.sentiment}`, item.count]);
      });
    }
    if (reviewAnalytics?.ratingDistribution) {
      reviewAnalytics.ratingDistribution.forEach((item: any) => {
        csvRows.push(['Review Analytics', `Rating: ${item.rating}`, item.count]);
      });
    }
    // Add flagged products
    if (flaggedProducts?.products) {
      flaggedProducts.products.forEach((product: any) => {
        csvRows.push(['Flagged Product', product.productName, `Fake Reviews: ${product.fakeReviews}, Risk: ${product.averageRiskScore}`]);
      });
    }
    // Add recent alerts
    if (recentAlerts) {
      recentAlerts.forEach((alert: any) => {
        csvRows.push(['Recent Alert', alert.productName || alert.type, alert.reviewText || alert.message]);
      });
    }
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Add deep analysis function
  const deepAnalysis = async () => {
    await fetchAnalytics();
    toast({
      title: 'Deep Analysis Refreshed',
      description: 'Analytics data has been refreshed with the latest insights.',
    });
  };

  if (isLoading) {
    return <ReviewAnalyticsSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load review analytics data'}</p>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const { marketplaceOverview, reviewAnalytics, flaggedProducts, recentAlerts } = data;

  // Check if we have real data from backend
  const hasRealData = marketplaceOverview && 
    (marketplaceOverview.totalReviews > 0 || 
     marketplaceOverview.totalSellers > 0 || 
     reviewAnalytics?.totalReviews > 0);

  // Transform data for charts with safe fallbacks
  const sentimentData = (reviewAnalytics?.sentimentDistribution || []).map((item: any) => ({
    sentiment: item.sentiment || 'neutral',
    count: item.count || 0,
    percentage: (item.count / (reviewAnalytics?.totalReviews || 1)) * 100,
    color: getSentimentColor(item.sentiment || 'neutral'),
  }));

  const ratingData = (reviewAnalytics?.ratingDistribution || []).map((item: any) => ({
    rating: `${item.rating || 0} Star${(item.rating || 1) !== 1 ? 's' : ''}`,
    count: item.count || 0,
    percentage: item.percentage || 0,
  }));

  // Safe data extraction with fallbacks
  const totalReviews = marketplaceOverview?.totalReviews || 0;
  const fakeReviews = marketplaceOverview?.fakeReviews || 0;
  const fakeReviewPercentage = marketplaceOverview?.fakeReviewPercentage || 0;
  const totalProducts = marketplaceOverview?.totalProducts || 0;
  const totalSellers = marketplaceOverview?.totalSellers || 0;
  const recentActivity = marketplaceOverview?.recentActivity || 0;
  const detectionAccuracy = marketplaceOverview?.detectionAccuracy || 0;
  const averageRating = marketplaceOverview?.averageRating || '0.0';

  const suspiciousPatterns = [
    { pattern: "Burst Reviews", detected: reviewAnalytics?.burstReviews || 0, products: (flaggedProducts?.products || []).length, severity: "High" },
    { pattern: "Copy-Paste Reviews", detected: reviewAnalytics?.copyPasteReviews || 0, products: (flaggedProducts?.products || []).length, severity: "Medium" },
    { pattern: "Bot Activity", detected: reviewAnalytics?.botActivity || 0, products: 5, severity: "Critical" },
    { pattern: "Fake Reviews", detected: fakeReviews, products: totalProducts, severity: "High" },
  ];

  const riskData = [
    { risk: "Low Risk", count: reviewAnalytics?.riskDistribution?.low || 0, color: "#10b981" },
    { risk: "Medium Risk", count: reviewAnalytics?.riskDistribution?.medium || 0, color: "#f59e0b" },
    { risk: "High Risk", count: reviewAnalytics?.riskDistribution?.high || 0, color: "#ef4444" },
  ];

  const marketplaceStats = [
    { label: "Total Reviews", value: marketplaceOverview?.totalReviews || 0, change: "+12%", trend: "up" },
    { label: "Fake Reviews", value: marketplaceOverview?.fakeReviews || 0, change: "+5%", trend: "up" },
    { label: "Fake Review %", value: `${marketplaceOverview?.fakeReviewPercentage || 0}%`, change: "-2%", trend: "down" },
    { label: "Total Products", value: marketplaceOverview?.totalProducts || 0, change: "+8%", trend: "up" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Analytics</h1>
          <p className="text-muted-foreground">
            Advanced analytics for review patterns, sentiment analysis, and fraud detection
          </p>
          {hasRealData && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">
                Live data from {totalSellers} sellers • {totalReviews} reviews analyzed
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* Countdown Timer */}
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Next refresh in {countdown}s
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleManualRefresh} disabled={isLoading}>
              <Loader2 className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" onClick={exportAnalytics}>
              <Download className="mr-2 h-4 w-4" />
              Export Analytics
            </Button>
            <Button className="bg-amazon-orange hover:bg-amazon-orange-dark" onClick={deepAnalysis}>
              <Eye className="mr-2 h-4 w-4" />
              Deep Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analytics Dashboard
          </TabsTrigger>
          <TabsTrigger value="submit" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Submit Review
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Batch Analysis
          </TabsTrigger>
          <TabsTrigger value="file-upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            File Upload
          </TabsTrigger>
          <TabsTrigger value="model-insights" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Model Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Reviews Analyzed"
              value={totalReviews.toLocaleString()}
              icon={MessageSquare}
              trend={{ value: recentActivity, label: "in last 24h" }}
            />
            <StatsCard
              title="Fake Reviews Detected"
              value={fakeReviews.toLocaleString()}
              icon={AlertTriangle}
              trend={{ value: fakeReviewPercentage, label: "% of total" }}
            />
            <StatsCard
              title="Average Rating"
              value={averageRating}
              icon={Star}
              trend={{ value: 2, label: "from last month" }}
            />
            <StatsCard
              title="Detection Accuracy"
              value={`${typeof detectionAccuracy === 'string' ? detectionAccuracy : detectionAccuracy.toFixed(1)}%`}
              icon={TrendingUp}
              trend={{ value: 3, label: "from last month" }}
            />
          </div>

          {/* Marketplace Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {marketplaceStats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sentiment Analysis and Rating Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ sentiment, percentage }) => `${sentiment} ${Math.round(percentage || 0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} reviews`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ratingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`${value} reviews`, 'Count']} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Review Activity Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Review Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalReviews}</div>
                  <div className="text-sm text-muted-foreground">Total Reviews</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{fakeReviews}</div>
                  <div className="text-sm text-muted-foreground">Fake Reviews</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{totalReviews - fakeReviews}</div>
                  <div className="text-sm text-muted-foreground">Authentic Reviews</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {totalReviews > 0 ? 
                      (typeof fakeReviews === 'string' || typeof totalReviews === 'string' ? 
                        ((parseFloat(fakeReviews) / parseFloat(totalReviews)) * 100).toFixed(1) :
                        ((fakeReviews / totalReviews) * 100).toFixed(1)
                      ) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Fake Review Rate</div>
                </div>
              </div>
              
              {/* Simple Trend Chart */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-4">Recent Activity</h4>
                <div className="flex items-end justify-between h-32 space-x-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const day = new Date();
                    day.setDate(day.getDate() - (6 - i));
                    const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
                    const height = Math.random() * 60 + 20; // Simulate daily activity
                    return (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-blue-200 rounded-t"
                          style={{ height: `${height}%` }}
                        />
                        <div className="text-xs text-muted-foreground mt-2">{dayName}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suspicious Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Patterns Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {suspiciousPatterns.map((pattern) => (
                  <div key={pattern.pattern} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{pattern.pattern}</h4>
                      <Badge
                        variant={
                          pattern.severity === "Critical" ? "destructive" :
                          pattern.severity === "High" ? "default" : "secondary"
                        }
                      >
                        {pattern.severity}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{pattern.detected}</div>
                    <p className="text-sm text-muted-foreground">
                      Across {pattern.products} products
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Flagged Products */}
          <Card>
            <CardHeader>
              <CardTitle>Flagged Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(!flaggedProducts?.products || flaggedProducts.products.length === 0) ? (
                  <p className="text-center text-muted-foreground py-4">
                    No flagged products found
                  </p>
                ) : (
                  flaggedProducts.products.map((product: any) => (
                    <div key={product.productId || product._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{product.productName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {product.totalReviews || 0} reviews • Avg: {product.averageRating || 0} stars
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-red-600">
                            {product.fakeReviews || 0} fake reviews
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {product.fakeReviewPercentage ? 
                              (typeof product.fakeReviewPercentage === 'string' ? 
                                product.fakeReviewPercentage : 
                                product.fakeReviewPercentage.toFixed(1)
                              ) : 0}% of total
                          </div>
                        </div>
                        <Badge variant="destructive">
                          Risk: {product.averageRiskScore ? 
                            (typeof product.averageRiskScore === 'string' ? 
                              product.averageRiskScore : 
                              product.averageRiskScore.toFixed(0)
                            ) : 0}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(!recentAlerts || recentAlerts.length === 0) ? (
                  <p className="text-center text-muted-foreground py-4">
                    No recent alerts
                  </p>
                ) : (
                  recentAlerts.map((alert: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{alert.productName || alert.type || 'Unknown'}</h4>
                          <Badge variant="destructive">
                            {alert.mlPredictions?.confidence > 0.8 ? 'High Risk' : 'Medium Risk'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          "{alert.reviewText || alert.message || 'No details available'}"
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>{alert.rating || 0} stars</span>
                          <span>Risk: {alert.mlPredictions?.riskScore ? 
                            (typeof alert.mlPredictions.riskScore === 'string' ? 
                              alert.mlPredictions.riskScore : 
                              alert.mlPredictions.riskScore.toFixed(1)
                            ) : 0}</span>
                          <span>{new Date(alert.reviewDate || alert.time || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ risk, count }) => `${risk}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} reviews`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts?.alerts?.slice(0, 5).map((alert: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.severity === 'high' ? 'bg-red-500' : 
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                    </div>
                  </div>
                ))}
                {(!recentAlerts?.alerts || recentAlerts.alerts.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit">
          <ReviewSubmission />
        </TabsContent>

        <TabsContent value="batch">
          <BatchSubmission />
        </TabsContent>

        <TabsContent value="file-upload">
          <FileUpload />
        </TabsContent>

        <TabsContent value="model-insights">
          <ModelInsights 
            data={{
              totalReviews: reviewAnalytics?.totalReviews || 0,
              burstReviews: reviewAnalytics?.burstReviews || 0,
              copyPasteReviews: reviewAnalytics?.copyPasteReviews || 0,
              botActivity: reviewAnalytics?.botActivity || 0,
              burstReviewConfidence: reviewAnalytics?.burstReviewConfidence || 0,
              copyPasteConfidence: reviewAnalytics?.copyPasteConfidence || 0,
              botActivityConfidence: reviewAnalytics?.botActivityConfidence || 0,
              recentInsights: reviewAnalytics?.recentInsights || []
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive':
      return '#10b981';
    case 'negative':
      return '#ef4444';
    case 'neutral':
      return '#6b7280';
    default:
      return '#3b82f6';
  }
}

function ReviewAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>

      <Skeleton className="h-96" />
    </div>
  );
}








