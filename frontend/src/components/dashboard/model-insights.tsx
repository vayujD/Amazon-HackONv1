import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Copy, 
  Zap, 
  Bot, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  BarChart3,
  Shield
} from "lucide-react";

interface ModelInsightsProps {
  data: {
    totalReviews: number;
    burstReviews: number;
    copyPasteReviews: number;
    botActivity: number;
    burstReviewConfidence: number;
    copyPasteConfidence: number;
    botActivityConfidence: number;
    recentInsights: Array<{
      reviewId: string;
      reviewText: string;
      burstReviewDetected: boolean;
      burstReviewConfidence: number;
      copyPasteDetected: boolean;
      copyPasteConfidence: number;
      botActivityDetected: boolean;
      botActivityConfidence: number;
      riskLevel: 'low' | 'medium' | 'high';
    }>;
  };
}

export function ModelInsights({ data }: ModelInsightsProps) {
  const getRiskLevel = (confidence: number) => {
    if (confidence >= 70) return { level: "High", color: "bg-red-100 text-red-800" };
    if (confidence >= 40) return { level: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { level: "Low", color: "bg-green-100 text-green-800" };
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const burstPercentage = data.totalReviews > 0 ? (data.burstReviews / data.totalReviews) * 100 : 0;
  const copyPastePercentage = data.totalReviews > 0 ? (data.copyPasteReviews / data.totalReviews) * 100 : 0;
  const botPercentage = data.totalReviews > 0 ? (data.botActivity / data.totalReviews) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">ML Model Insights</h2>
        <p className="text-muted-foreground">
          Detailed analysis from specialized detection models
        </p>
      </div>

      {/* Model Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Burst Review Detection */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Burst Review Detection</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.burstReviews}</div>
            <p className="text-xs text-muted-foreground">
              {burstPercentage.toFixed(1)}% of total reviews
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Detection Confidence</span>
                <span>{(data.burstReviewConfidence * 100).toFixed(1)}%</span>
              </div>
              <Progress value={data.burstReviewConfidence * 100} className="h-2" />
            </div>
            <Badge 
              variant={getRiskLevel(data.burstReviewConfidence * 100).color as any}
              className="mt-2"
            >
              {getRiskLevel(data.burstReviewConfidence * 100).level} Risk
            </Badge>
          </CardContent>
        </Card>

        {/* Copy-Paste Detection */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Copy-Paste Detection</CardTitle>
            <Copy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.copyPasteReviews}</div>
            <p className="text-xs text-muted-foreground">
              {copyPastePercentage.toFixed(1)}% of total reviews
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Detection Confidence</span>
                <span>{(data.copyPasteConfidence * 100).toFixed(1)}%</span>
              </div>
              <Progress value={data.copyPasteConfidence * 100} className="h-2" />
            </div>
            <Badge 
              variant={getRiskLevel(data.copyPasteConfidence * 100).color as any}
              className="mt-2"
            >
              {getRiskLevel(data.copyPasteConfidence * 100).level} Risk
            </Badge>
          </CardContent>
        </Card>

        {/* Bot Activity Detection */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Activity Detection</CardTitle>
            <Bot className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.botActivity}</div>
            <p className="text-xs text-muted-foreground">
              {botPercentage.toFixed(1)}% of total reviews
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Detection Confidence</span>
                <span>{(data.botActivityConfidence * 100).toFixed(1)}%</span>
              </div>
              <Progress value={data.botActivityConfidence * 100} className="h-2" />
            </div>
            <Badge 
              variant={getRiskLevel(data.botActivityConfidence * 100).color as any}
              className="mt-2"
            >
              {getRiskLevel(data.botActivityConfidence * 100).level} Risk
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Model Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Detection Rates</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Burst Reviews</span>
                  <span className="text-sm font-medium">{burstPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Copy-Paste Reviews</span>
                  <span className="text-sm font-medium">{copyPastePercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bot Activity</span>
                  <span className="text-sm font-medium">{botPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Average Confidence</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Burst Detection</span>
                  <span className="text-sm font-medium">{(data.burstReviewConfidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Copy-Paste Detection</span>
                  <span className="text-sm font-medium">{(data.copyPasteConfidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bot Detection</span>
                  <span className="text-sm font-medium">{(data.botActivityConfidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Model Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {data.recentInsights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Review {index + 1}</span>
                    <Badge variant="outline" className="text-xs">
                      {insight.reviewId}
                    </Badge>
                  </div>
                  <Badge 
                    variant={getRiskLevel(insight.riskLevel === 'high' ? 80 : insight.riskLevel === 'medium' ? 50 : 20).color as any}
                    className="text-xs"
                  >
                    {insight.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  "{insight.reviewText}"
                </p>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {/* Burst Review */}
                  <div className="text-center p-2 border rounded">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="h-3 w-3 text-orange-500" />
                      <span className="font-medium">Burst</span>
                    </div>
                    {insight.burstReviewDetected ? (
                      <div className="flex items-center justify-center gap-1 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{(insight.burstReviewConfidence * 100).toFixed(0)}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Clean</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Copy-Paste */}
                  <div className="text-center p-2 border rounded">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Copy className="h-3 w-3 text-blue-500" />
                      <span className="font-medium">Copy-Paste</span>
                    </div>
                    {insight.copyPasteDetected ? (
                      <div className="flex items-center justify-center gap-1 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{(insight.copyPasteConfidence * 100).toFixed(0)}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Original</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Bot Activity */}
                  <div className="text-center p-2 border rounded">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Bot className="h-3 w-3 text-purple-500" />
                      <span className="font-medium">Bot</span>
                    </div>
                    {insight.botActivityDetected ? (
                      <div className="flex items-center justify-center gap-1 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{(insight.botActivityConfidence * 100).toFixed(0)}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Human</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            How Our Models Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Burst Review Detection
              </h4>
              <p className="text-sm text-muted-foreground">
                Identifies coordinated review bombing campaigns where multiple reviews are posted in a short time period, often with similar patterns.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Copy className="h-4 w-4 text-blue-500" />
                Copy-Paste Detection
              </h4>
              <p className="text-sm text-muted-foreground">
                Detects duplicate or mass-copied review content, indicating review farming or automated posting activities.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-500" />
                Bot Activity Detection
              </h4>
              <p className="text-sm text-muted-foreground">
                Identifies patterns consistent with automated bot behavior, including repetitive language and timing patterns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 