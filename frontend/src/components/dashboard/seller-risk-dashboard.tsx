import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Shield, 
  Activity,
  RefreshCw,
  BarChart3,
  Clock,
  Target
} from 'lucide-react';
import { apiService } from '@/services/api.service';
import { useToast } from '@/hooks/use-toast';

interface SellerRiskData {
  seller: {
    sellerId: string;
    sellerName: string;
    status: string;
    registrationDate: string;
  };
  riskAssessment: {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    totalReviews: number;
    fakeReviews: number;
    fakeReviewPercentage: number;
    suspiciousPatterns: {
      burstReviews: number;
      copyPaste: number;
      botActivity: number;
      shortReviews: number;
    };
    riskFactors: string[];
    lastUpdated: string;
  };
  riskTrend: 'increasing' | 'decreasing' | 'stable';
  recentReviews: any[];
  riskHistory: any[];
}

const SellerRiskDashboard: React.FC<{ sellerId: string }> = ({ sellerId }) => {
  const [data, setData] = useState<SellerRiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSellerRiskDashboard(sellerId);
      if (response.success) {
        setData(response);
      } else {
        toast({
          title: "Error",
          description: "Failed to load seller risk data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching seller risk data:', error);
      toast({
        title: "Error",
        description: "Failed to load seller risk data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshRiskAssessment = async () => {
    try {
      setRefreshing(true);
      await apiService.assessSellerRisk(sellerId);
      await fetchData();
      toast({
        title: "Success",
        description: "Risk assessment updated successfully",
      });
    } catch (error) {
      console.error('Error refreshing risk assessment:', error);
      toast({
        title: "Error",
        description: "Failed to update risk assessment",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sellerId]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskTrendText = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'Risk Increasing';
      case 'decreasing': return 'Risk Decreasing';
      case 'stable': return 'Risk Stable';
      default: return 'Risk Stable';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No seller risk data available. Please try refreshing.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Seller Risk Dashboard</h2>
          <p className="text-muted-foreground">
            {data.seller.sellerName} • {data.seller.sellerId}
          </p>
        </div>
        <Button 
          onClick={refreshRiskAssessment} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Assessment
        </Button>
      </div>

      {/* Risk Score Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.riskAssessment.riskScore}</div>
            <Progress value={data.riskAssessment.riskScore} className="mt-2" />
            <Badge className={`mt-2 ${getRiskLevelColor(data.riskAssessment.riskLevel)}`}>
              {data.riskAssessment.riskLevel.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Trend</CardTitle>
            {getRiskTrendIcon(data.riskTrend)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRiskTrendText(data.riskTrend)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on recent activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.riskAssessment.totalReviews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.riskAssessment.fakeReviews} fake reviews detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fake Review %</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.riskAssessment.fakeReviewPercentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.riskAssessment.fakeReviews} of {data.riskAssessment.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Suspicious Patterns</TabsTrigger>
          <TabsTrigger value="history">Risk History</TabsTrigger>
          <TabsTrigger value="reviews">Recent Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Risk Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Factors</CardTitle>
            </CardHeader>
            <CardContent>
              {data.riskAssessment.riskFactors.length > 0 ? (
                <div className="space-y-2">
                  {data.riskAssessment.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">{factor}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No specific risk factors identified.</p>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {data.riskAssessment.riskLevel === 'high' || data.riskAssessment.riskLevel === 'critical' ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Review and improve product quality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Avoid incentivized reviews</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Monitor review patterns closely</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Continue maintaining good practices</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Monitor for any suspicious activity</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Patterns Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Burst Reviews</span>
                    <Badge variant={data.riskAssessment.suspiciousPatterns.burstReviews > 0 ? "destructive" : "secondary"}>
                      {data.riskAssessment.suspiciousPatterns.burstReviews}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Multiple reviews in short time periods
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Copy-Paste Reviews</span>
                    <Badge variant={data.riskAssessment.suspiciousPatterns.copyPaste > 0 ? "destructive" : "secondary"}>
                      {data.riskAssessment.suspiciousPatterns.copyPaste}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Identical or very similar review content
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Bot Activity</span>
                    <Badge variant={data.riskAssessment.suspiciousPatterns.botActivity > 0 ? "destructive" : "secondary"}>
                      {data.riskAssessment.suspiciousPatterns.botActivity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automated review generation detected
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Short Reviews</span>
                    <Badge variant={data.riskAssessment.suspiciousPatterns.shortReviews > 0 ? "destructive" : "secondary"}>
                      {data.riskAssessment.suspiciousPatterns.shortReviews}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reviews with minimal content
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Score History</CardTitle>
            </CardHeader>
            <CardContent>
              {data.riskHistory.length > 0 ? (
                <div className="space-y-4">
                  {data.riskHistory.slice(-7).reverse().map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          entry.riskLevel === 'low' ? 'bg-green-500' :
                          entry.riskLevel === 'medium' ? 'bg-yellow-500' :
                          entry.riskLevel === 'high' ? 'bg-orange-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium">Risk Score: {entry.riskScore}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge className={getRiskLevelColor(entry.riskLevel)}>
                        {entry.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No risk history available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {data.recentReviews.map((review, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Review #{review.reviewId}</span>
                          <Badge variant={review.mlPredictions?.isFake ? "destructive" : "secondary"}>
                            {review.mlPredictions?.isFake ? "Fake" : "Authentic"}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {review.reviewText?.substring(0, 100)}...
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Rating: {review.rating}/5</span>
                        <span>Confidence: {Math.round((review.mlPredictions?.confidence || 0) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent reviews available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerRiskDashboard; 