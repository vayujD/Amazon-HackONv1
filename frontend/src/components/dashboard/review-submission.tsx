import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Send, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { apiService } from "@/services/api.service";

interface ReviewSubmission {
  reviewText: string;
  rating: number;
  reviewerId: string;
  productId: string;
  productName: string;
  reviewDate: string;
  ipAddress: string;
  verifiedPurchase: boolean;
}

interface MLPrediction {
  isFake: boolean;
  confidence: number;
  riskScore: number;
  sentiment: string;
  sentimentScore: number;
  suspiciousPatterns: string[];
  reviewAuthenticity: number;
  reviewerCredibility: number;
}

export function ReviewSubmission() {
  const [formData, setFormData] = useState<ReviewSubmission>({
    reviewText: "",
    rating: 5,
    reviewerId: "",
    productId: "",
    productName: "",
    reviewDate: new Date().toISOString().split('T')[0],
    ipAddress: "192.168.1.1",
    verifiedPurchase: false,
  });

  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ReviewSubmission, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPrediction(null);
    setIsSubmitted(false);

    try {
      // Submit to backend API using authenticated service
      const result = await apiService.processReview(formData);
      
      setPrediction(result.predictions);
      setIsSubmitted(true);

      toast({
        title: "Review Analyzed Successfully",
        description: `Analysis complete with ${(result.predictions.confidence * 100).toFixed(1)}% confidence`,
      });

      // Trigger a refresh of the analytics dashboard
      // This will update the dashboard with the new data
      window.dispatchEvent(new CustomEvent('reviewSubmitted'));

    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to analyze review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 70) return { level: "High", color: "bg-red-100 text-red-800" };
    if (riskScore >= 40) return { level: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { level: "Low", color: "bg-green-100 text-green-800" };
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Submit Review for Analysis</h2>
        <p className="text-muted-foreground">
          Submit a review to analyze it using our ML-powered fake review detection system
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Review Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reviewText">Review Text *</Label>
                <Textarea
                  id="reviewText"
                  placeholder="Enter the review text here..."
                  value={formData.reviewText}
                  onChange={(e) => handleInputChange('reviewText', e.target.value)}
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating *</Label>
                  <Select
                    value={formData.rating.toString()}
                    onValueChange={(value) => handleInputChange('rating', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewerId">Reviewer ID</Label>
                  <Input
                    id="reviewerId"
                    placeholder="user123"
                    value={formData.reviewerId}
                    onChange={(e) => handleInputChange('reviewerId', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productId">Product ID</Label>
                  <Input
                    id="productId"
                    placeholder="prod456"
                    value={formData.productId}
                    onChange={(e) => handleInputChange('productId', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="Product Name"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reviewDate">Review Date</Label>
                  <Input
                    id="reviewDate"
                    type="date"
                    value={formData.reviewDate}
                    onChange={(e) => handleInputChange('reviewDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input
                    id="ipAddress"
                    placeholder="192.168.1.1"
                    value={formData.ipAddress}
                    onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="verifiedPurchase"
                  checked={formData.verifiedPurchase}
                  onCheckedChange={(checked) => handleInputChange('verifiedPurchase', checked)}
                />
                <Label htmlFor="verifiedPurchase">Verified Purchase</Label>
              </div>

              <Button type="submit" disabled={isLoading || !formData.reviewText} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Analyze Review
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!prediction && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Submit a review to see the ML analysis results</p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                <p>Analyzing review with ML models...</p>
              </div>
            )}

            {prediction && (
              <div className="space-y-4">
                {/* Overall Result */}
                <Alert className={prediction.isFake ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                  <div className="flex items-center">
                    {prediction.isFake ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <AlertDescription className="ml-2 font-medium">
                      {prediction.isFake ? "Suspicious Review Detected" : "Review Appears Legitimate"}
                    </AlertDescription>
                  </div>
                </Alert>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {prediction.reviewAuthenticity.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Authenticity</div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="space-y-2">
                  <Label>Risk Assessment</Label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Risk Score</span>
                    <Badge className={getRiskLevel(prediction.riskScore).color}>
                      {prediction.riskScore.toFixed(1)} - {getRiskLevel(prediction.riskScore).level}
                    </Badge>
                  </div>
                </div>

                {/* Sentiment Analysis */}
                <div className="space-y-2">
                  <Label>Sentiment Analysis</Label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Sentiment</span>
                    <Badge className={getSentimentColor(prediction.sentiment)}>
                      {prediction.sentiment.charAt(0).toUpperCase() + prediction.sentiment.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Suspicious Patterns */}
                {prediction.suspiciousPatterns.length > 0 && (
                  <div className="space-y-2">
                    <Label>Suspicious Patterns Detected</Label>
                    <div className="space-y-1">
                      {prediction.suspiciousPatterns.map((pattern, index) => (
                        <Badge key={index} variant="destructive" className="mr-1">
                          {pattern.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviewer Credibility */}
                <div className="space-y-2">
                  <Label>Reviewer Credibility</Label>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${prediction.reviewerCredibility}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {prediction.reviewerCredibility.toFixed(0)}% credibility score
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 